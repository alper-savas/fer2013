import { OutlierProbability, ImageProbability } from "@/backend/types";

/**
 * Calculates the outlier probabilities for a set of images
 * 
 * @param {ImageProbability[]} images - The images to calculate outlier probabilities for
 * @returns {OutlierProbability[]} The outlier probabilities for the images
 */
export function calculateOutlierProbabilities(images: ImageProbability[]): OutlierProbability[] {
    if (images.length !== 6) {
        throw new Error("Expected exactly 6 images");
    }

    // Ensure all probability objects have the same emotion keys
    const allKeys = new Set<string>();
    images.forEach(img => {
        Object.keys(img.probabilities).forEach(key => allKeys.add(key));
    });

    // Standardize all probability objects to have the same keys
    const standardizedImages = images.map(img => {
        const standardizedProbabilities: Record<string, number> = {};
        allKeys.forEach(key => {
            standardizedProbabilities[key] = img.probabilities[key] || 0;
        });
        return {
            id: img.id,
            probabilities: standardizedProbabilities
        };
    });

    // Calculate average probability distribution
    const averageDistribution: Record<string, number> = {};
    allKeys.forEach(key => {
        const sum = standardizedImages.reduce((acc, img) => acc + img.probabilities[key], 0);
        averageDistribution[key] = sum / images.length;
    });

    // Calculate Jensen-Shannon divergence for each image compared to the average
    // This is a measure of how different each distribution is from the average
    const divergences = standardizedImages.map(img => {
        const divergence = calculateJensenShannonDivergence(img.probabilities, averageDistribution);
        return {
            id: img.id,
            divergence
        };
    });

    // Higher divergence means more likely to be an outlier
    const totalDivergence = divergences.reduce((sum, d) => sum + d.divergence, 0);

    // Normalize to probabilities that sum to 100%
    const normalizedProbabilities = divergences.map(d => ({
        id: d.id,
        probability: totalDivergence > 0 ? (d.divergence / totalDivergence) * 100 : 100 / images.length
    }));

    return normalizedProbabilities;
}


/**
 * Calculate Jensen-Shannon Divergence between two probability distributions
 * This is a symmetric measure of similarity between two probability distributions
 * Returns a value between 0 (identical) and 1 (completely different)
 */
function calculateJensenShannonDivergence(
    dist1: Record<string, number>,
    dist2: Record<string, number>
): number {
    // Ensure both distributions contain the same keys
    const keys = [...new Set([...Object.keys(dist1), ...Object.keys(dist2)])];

    // Calculate the midpoint distribution
    const midpoint: Record<string, number> = {};
    keys.forEach(key => {
        midpoint[key] = ((dist1[key] || 0) + (dist2[key] || 0)) / 2;
    });

    // Calculate KL divergence from each distribution to the midpoint
    const kl1 = calculateKLDivergence(dist1, midpoint);
    const kl2 = calculateKLDivergence(dist2, midpoint);

    // JS divergence is the average of the two KL divergences
    return (kl1 + kl2) / 2;
}

/**
 * Calculate Kullback-Leibler Divergence from dist1 to dist2
 * A measure of how one probability distribution diverges from a second
 */
function calculateKLDivergence(
    dist1: Record<string, number>,
    dist2: Record<string, number>
): number {
    const keys = Object.keys(dist1);

    let divergence = 0;
    keys.forEach(key => {
        const p = dist1[key] || 0;
        const q = dist2[key] || 0.0001; // Small epsilon to avoid division by zero

        // Only calculate for non-zero probabilities in dist1
        if (p > 0) {
            divergence += p * Math.log(p / q);
        }
    });

    return divergence;
}