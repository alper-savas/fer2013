import { OutlierProbability } from "@/backend/services/types";



/**
 * Gets the predicted outlier image from a set of outlier probabilities
 * 
 * @param {OutlierProbability[]} images - The outlier probabilities to get the predicted outlier image from
 * @returns {string} The id of the predicted outlier image
 */
export function getPredictedOutlierImage(images: OutlierProbability[]): string {
    if (!images.length) return "";

    const outlierImage = images.reduce(
        (highest, current) =>
            current.probability > highest.probability ? current : highest,
        images[0]
    );

    return outlierImage.id;
}