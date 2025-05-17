import { convertEmotionToLabel } from "./convert-emotion-to-label";
import { ImageData, ImageObject, OutlierProbability, EmotionData } from "@/backend/types";


/**
 * Processes the emotion data from classification results
 */
export const processImageObject = (
    images: ImageData[],
    classificationResults: EmotionData[],
    outlierProbabilities: OutlierProbability[]
): ImageObject[] => {
    return images.map((image, index) => {
        const result = classificationResults[index];
        return {
            imageId: image.id,
            label: image.label,
            probabilities: result.probabilities,
            predictedEmotion: convertEmotionToLabel(result.emotion),
            outlierProbability: outlierProbabilities.find(p => p.id === image.id)?.probability || 0,
            path: image.path,
            correct: image.correct
        } as ImageObject;
    });
}