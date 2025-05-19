from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import tensorflow as tf
from tensorflow import keras
from PIL import Image
import numpy as np
import io
import os
import json
from tensorflow.keras.preprocessing.image import ImageDataGenerator

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Approximate class weights from original training
class_weights_dict = {
    0: 1.26,  # Angry
    1: 1.18,  # Fear
    2: 0.57,  # Happy
    3: 0.97,  # Sad
    4: 1.66,  # Surprise
    5: 1.02,  # Neutral
}

# Define emotions
emotions = ["Angry", "Fear", "Happy", "Sad", "Surprise", "Neutral"]

# Define WeightedFocalLoss class exactly as in the training script
class WeightedFocalLoss(tf.keras.losses.Loss):
    """
    Weighted Focal Loss implementation for handling class imbalance.
    
    Focal loss adds a factor to reduce the loss contribution from easy examples
    and increases the contribution from hard examples.
    """
    def __init__(self, class_weights_dict, gamma=2.0, alpha=0.25, name='weighted_focal_loss'):
        super().__init__(name=name)
        self.class_weights = np.array(list(class_weights_dict.values()), dtype=np.float32)
        self.gamma = gamma
        self.alpha = alpha

    def call(self, y_true, y_pred):
        weights = tf.convert_to_tensor(self.class_weights, dtype=tf.float32)
        class_indices = tf.argmax(y_true, axis=1)
        sample_weights = tf.gather(weights, class_indices)
        
        # Prevent numerical instability
        epsilon = 1e-7
        y_pred = tf.clip_by_value(y_pred, epsilon, 1.0 - epsilon)
        
        # Calculate cross entropy
        cross_entropy = -y_true * tf.math.log(y_pred)
        
        # Apply focal weight
        focal_weight = tf.pow(1.0 - y_pred, self.gamma) * y_true
        
        # Apply sample weights
        loss = sample_weights[:, tf.newaxis] * focal_weight * cross_entropy
        
        return tf.reduce_mean(tf.reduce_sum(loss, axis=1))
    
    # Add get_config for model serialization
    def get_config(self):
        config = super().get_config()
        config.update({
            "gamma": self.gamma,
            "alpha": self.alpha,
            "class_weights_dict": dict(zip(range(len(self.class_weights)), self.class_weights.tolist()))
        })
        return config

    # Add from_config for model deserialization
    @classmethod
    def from_config(cls, config):
        return cls(
            config.get("class_weights_dict", class_weights_dict),
            config.get("gamma", 2.0),
            config.get("alpha", 0.25)
        )

# Load the trained model
model_path = "FER_main_model.h5"

def verify_model(loaded_model):
    """Verify the model works by running a simple prediction"""
    try:
        # Create a simple test tensor (random noise)
        test_input = np.random.random((1, 48, 48, 1)) * 2 - 1  # Range [-1, 1]
        # Run a prediction
        test_output = loaded_model.predict(test_input)
        # Check if output shape and values are reasonable
        if test_output.shape == (1, 6) and np.sum(test_output) > 0.99 and np.sum(test_output) < 1.01:
            print("Model verification successful")
            return True
        else:
            print(f"Model verification failed: Output shape {test_output.shape}, sum {np.sum(test_output)}")
            return False
    except Exception as e:
        print(f"Error during model verification: {e}")
        return False

def load_model_with_fallbacks():
    """Load model with multiple fallback strategies exactly as in FER_main_prediction.py"""
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found at {model_path}")
    
    # EXACTLY as in FER_main_prediction.py
    try:
        try:
            from tensorflow.keras.models import load_model as keras_load_model
            loaded_model = keras_load_model(model_path, compile=False)
            print(f"Model loaded successfully from {model_path}")
            return loaded_model
        except Exception as first_err:
            print(f"First loading attempt failed: {first_err}")
            # Second fallback - exact same code as in FER_main_prediction.py
            simple_loss = lambda y_true, y_pred: tf.reduce_mean(
                tf.reduce_sum(-y_true * tf.math.log(tf.clip_by_value(y_pred, 1e-7, 1.0)), axis=1)
            )
            loaded_model = keras_load_model(model_path, custom_objects={'loss': simple_loss})
            print("Model loaded with simple categorical crossentropy")
            return loaded_model
    except Exception as e:
        print(f"Error loading model: {str(e)}")
        try:
            # Try with the weighted focal loss
            loaded_model = tf.keras.models.load_model(
                model_path, 
                custom_objects={
                    'WeightedFocalLoss': WeightedFocalLoss(class_weights_dict)
                },
                compile=False  
            )
            print("Model loaded with WeightedFocalLoss custom object")
            return loaded_model
        except Exception as focal_err:
            print(f"Weighted focal loss loading failed: {focal_err}")
            
        raise RuntimeError("All model loading approaches failed")

try:
    # Load model with robust fallback strategy
    model = load_model_with_fallbacks()
except Exception as e:
    print(f"Critical error loading model: {e}")
    raise

# Define a consistent preprocessing function that's used across all endpoints
def preprocess_input(x):
    """Normalize to [-1, 1] - identical to FER_main_prediction.py"""
    return (x - 0.5) * 2

def preprocess_image(image: Image.Image):
    """Process the input image to match the format required by the model."""
    # Resize to model input size
    image = image.resize((48, 48))
    # Convert to grayscale
    image = image.convert("L")
    # Convert to numpy array and normalize exactly as in FER_main_prediction.py
    image_array = np.array(image) / 255.0  # First normalize to [0, 1]
    image_array = (image_array - 0.5) * 2  # Then normalize to [-1, 1]
    # Reshape for model input
    image_array = image_array.reshape(1, 48, 48, 1)
    return image_array

# Setup a consistent ImageDataGenerator for all preprocessing
test_datagen = ImageDataGenerator(
    rescale=1./255,
    preprocessing_function=preprocess_input
)

class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        if isinstance(obj, np.number):
            return float(obj)
        return super(NumpyEncoder, self).default(obj)

@app.post("/classify-emotion/")
async def classify_emotion(file: UploadFile = File(...)):
    """Endpoint to classify facial emotion in an uploaded image."""
    try:
        # Read image data
        image_data = await file.read()
        
        # Load with PIL first 
        image = Image.open(io.BytesIO(image_data))
        image = image.resize((48, 48))
        image = image.convert("L")
        
        # Convert to format that can be processed by ImageDataGenerator
        from tensorflow.keras.preprocessing.image import img_to_array
        img_array = img_to_array(image)
        
        # Apply the same standardization as in FER_main_prediction.py
        img_array = test_datagen.standardize(img_array)
        img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
        
        # Make prediction
        predictions = model.predict(img_array)
        
        # Apply bias correction to reduce Neutral class bias - same as in evaluate-test-set-v2
        def apply_bias_correction(predictions, neutral_index=5):
            """Apply a correction factor to reduce Neutral class bias"""
            # Create a copy of the predictions
            adjusted_predictions = predictions.copy()
            
            # Reduce the probability of Neutral class by a calibrated factor (from comparison testing)
            neutral_reduction_factor = 0.40  # Determined from analysis of prediction differences
            
            for i in range(len(adjusted_predictions)):
                # Reduce Neutral probability
                original_neutral_prob = adjusted_predictions[i][neutral_index]
                adjusted_neutral_prob = original_neutral_prob * neutral_reduction_factor
                reduction = original_neutral_prob - adjusted_neutral_prob
                
                # Redistribute the reduced probability to other classes proportionally
                non_neutral_sum = sum(adjusted_predictions[i][:neutral_index]) + sum(adjusted_predictions[i][neutral_index+1:])
                
                if non_neutral_sum > 0:
                    for j in range(len(adjusted_predictions[i])):
                        if j != neutral_index:
                            # Distribute proportionally
                            adjusted_predictions[i][j] += (reduction * adjusted_predictions[i][j] / non_neutral_sum)
                        else:
                            # Apply the reduction to Neutral
                            adjusted_predictions[i][j] = adjusted_neutral_prob
                
            return adjusted_predictions
            
        # Apply the bias correction to adjust predictions
        adjusted_predictions = apply_bias_correction(predictions)
        
        # Get the highest probability emotion from adjusted predictions
        emotion_idx = np.argmax(adjusted_predictions[0])
        top_emotion = emotions[emotion_idx]
        
        # Create a dictionary of all emotions with their probabilities
        emotion_probs = {}
        for i, emotion in enumerate(emotions):
            emotion_probs[emotion] = float(adjusted_predictions[0][i])
        
        # Create response data
        response_data = {
            "emotion": top_emotion,
            "probabilities": emotion_probs
        }
        
        return JSONResponse(content=response_data)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JSONResponse(content={"error": str(e)}, status_code=500)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)