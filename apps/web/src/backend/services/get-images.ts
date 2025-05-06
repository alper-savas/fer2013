"use server";

import { ImageData } from "./types";
import { Label } from "./enums";
import prisma from "@fer-app/db/prisma";
/**
 * Gets 6 images where 5 have one emotion and 1 has a different emotion
 * @returns An array of 6 image objects with correct flags set
 */
export const getImages = async (): Promise<ImageData[]> => {
    // All emotions except disgust
    const emotions = [
        Label.ANGRY,
        Label.FEAR,
        Label.HAPPY,
        Label.NEUTRAL,
        Label.SAD,
        Label.SURPRISE,
    ];

    // Pick two random emotions
    const shuffledEmotions = [...emotions].sort(() => Math.random() - 0.5);
    const [majorityEmotion, minorityEmotion] = shuffledEmotions.slice(0, 2);

    // Fetch all images with the majority emotion
    const allMajorityImages = await prisma.image.findMany({
        where: {
            label: majorityEmotion as any
        },
    });

    // Fetch all images with the minority emotion
    const allMinorityImages = await prisma.image.findMany({
        where: {
            label: minorityEmotion as any
        },
    });

    if (allMajorityImages.length < 5 || allMinorityImages.length < 1) {
        throw new Error("Not enough images found in the database");
    }

    // Randomly select 5 images from the majority emotion
    const shuffledMajorityImages = [...allMajorityImages].sort(() => Math.random() - 0.5);
    const selectedMajorityImages = shuffledMajorityImages.slice(0, 5);

    // Randomly select 1 image from the minority emotion
    const shuffledMinorityImages = [...allMinorityImages].sort(() => Math.random() - 0.5);
    const selectedMinorityImage = shuffledMinorityImages[0];

    // Format the majority images (correct = false)
    const formattedMajorityImages: ImageData[] = selectedMajorityImages.map(img => {
        // Ensure the URL uses the correct S3 endpoint
        let imagePath = img.url || '';
        if (imagePath.includes('s3.us-east-1.amazonaws.com')) {
            imagePath = imagePath.replace('s3.us-east-1.amazonaws.com', 's3.eu-north-1.amazonaws.com');
        }

        return {
            id: String(img.id),
            path: imagePath,
            label: img.label as any as Label || Label.NEUTRAL,
            correct: false,
        };
    });

    // Format the minority image (correct = true)
    let minorityImagePath = selectedMinorityImage.url || '';
    if (minorityImagePath.includes('s3.us-east-1.amazonaws.com')) {
        minorityImagePath = minorityImagePath.replace('s3.us-east-1.amazonaws.com', 's3.eu-north-1.amazonaws.com');
    }

    const formattedMinorityImage: ImageData = {
        id: String(selectedMinorityImage.id),
        path: minorityImagePath,
        label: selectedMinorityImage.label as any as Label || Label.NEUTRAL,
        correct: true,
    };

    // Combine and shuffle the images
    const allImages = [...formattedMajorityImages, formattedMinorityImage].sort(() => Math.random() - 0.5);

    return allImages as ImageData[];
};
