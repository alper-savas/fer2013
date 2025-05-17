/**
 * Determines if the page should refresh based on trial conditions
 */
export function shouldRefreshPage(
    predictedOutlier: string,
    actualOutlier: string,
    currentRound: number,
    falsePredictions: number
): boolean {
    return (
        (predictedOutlier !== actualOutlier && (currentRound <= 10 || falsePredictions > 4)) ||
        (predictedOutlier === actualOutlier && currentRound > 15 && falsePredictions < 5)
    );
}