"use server";

import axios from "axios";

const fastApiUrl = process.env.FASTAPI_URL || "http://localhost:8000";

import { EmotionData } from "../types";

export async function classifyEmotions(imageUrls: string[]): Promise<EmotionData[]> {
    try {
        if (!imageUrls || imageUrls.length === 0) {
            throw new Error("No image URLs provided");
        }

        // Process each image URL in parallel
        const results = await Promise.all(
            imageUrls.map(async (imageUrl) => {
                try {
                    // Fetch image from S3 or URL source
                    const response = await axios.get(imageUrl, {
                        responseType: "arraybuffer",
                        headers: {
                            'Cache-Control': 'no-cache',
                            'Pragma': 'no-cache',
                            'Expires': '0',
                        }
                    });
                    const imageBuffer = Buffer.from(response.data);

                    // Create FormData with the image
                    const formData = new FormData();
                    const blob = new Blob([imageBuffer], { type: 'image/jpeg' });
                    formData.append("file", blob, "image.jpg");

                    const classification = await axios.post(
                        `${fastApiUrl}/classify-emotion/`,
                        formData,
                        {
                            headers: { "Content-Type": "multipart/form-data" },
                            timeout: 30000 // 30 second timeout
                        }
                    );

                    // Check for errors
                    if (classification.data.error) {
                        throw new Error(classification.data.error);
                    }

                    const result: EmotionData = {
                        imageUrl,
                        emotion: classification.data.emotion,
                        probabilities: classification.data.probabilities || {},
                    };

                    return result;
                } catch (error) {
                    console.error(`Error classifying emotion for ${imageUrl}:`, error);
                    throw new Error(`Failed to classify emotion for ${imageUrl}`);
                }
            })
        );

        return results;
    } catch (error) {
        console.error("Error classifying emotions:", error);
        throw new Error("Failed to classify emotions");
    }
}


