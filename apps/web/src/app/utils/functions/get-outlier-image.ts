import { Label } from "@/backend/enums";
import { ImageData } from "@/backend/types";

/**
 * Gets the outlier image from a set of images
 * 
 * @param {ImageData[]} imageData - The images to get the outlier image from
 * @returns {string} The id of the outlier image
 */
export function getOutlierImage(imageData: ImageData[]): string {
    if (!imageData.length) return "";

    // Count occurrences of each label
    const labelCounts: Record<Label, number> = {} as Record<Label, number>;

    imageData.forEach(image => {
        labelCounts[image.label] = (labelCounts[image.label] || 0) + 1;
    });

    // Find the most common label
    let majorityLabel = imageData[0].label;
    let maxCount = 0;

    Object.entries(labelCounts).forEach(([label, count]) => {
        if (count > maxCount) {
            maxCount = count;
            majorityLabel = label as Label;
        }
    });

    // Find the first image with a different label
    const outlier = imageData.find(image => image.label !== majorityLabel);

    // If no outlier is found, return an empty string
    return outlier?.id || "";
}