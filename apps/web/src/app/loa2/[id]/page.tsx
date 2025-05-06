import { getTrial, getImages, classifyEmotions, incrementFalsePredictions } from "@/backend/services";
import { notFound, redirect } from "next/navigation";
import { ImageObject, OutlierProbability, ImageData } from "@/backend/services/types";
import {
    calculateOutlierProbabilities,
    convertEmotionToLabel,
    getPredictedOutlierImage,
    getOutlierImage
} from "@/app/utils";
import { LOA2Component } from "./components";
import { Resque } from "@/app/components/resque";
import { EmotionData } from "@/backend/services/classify-emotions";
import { AutomationLevel } from "@/backend/services/enums";
import { cache } from "react";

type PageParams = {
    params: Promise<{ id: string }>;
};

export default async function LOA2Page({ params }: PageParams) {
    const { id } = await params;

    // Fetch trial and images data in parallel
    const [trial, images] = await Promise.all([
        getTrial({ id }),
        getImages()
    ]);

    if (!trial) {
        return notFound();
    }

    const { currentRound, automationLevel, falsePredictions } = trial;

    // Process image classification
    const classificationResults = await classifyEmotions(images.map(image => image.path));

    // Calculate outlier probabilities
    const outlierProbabilities = calculateOutlierProbabilities(
        images.map((image, index) => ({
            id: image.id,
            probabilities: classificationResults[index].probabilities
        }))
    ) as OutlierProbability[];

    // Determine outlier images
    const predictedOutlierImage = getPredictedOutlierImage(outlierProbabilities);
    const actualOutlierImage = getOutlierImage(images);

    // Handle refresh logic
    if (shouldRefreshPage(predictedOutlierImage, actualOutlierImage, currentRound, falsePredictions)) {
        redirect(`/loa2/${id}`);
    } else if (predictedOutlierImage !== actualOutlierImage) {
        await incrementFalsePredictions({ id });
    }

    // Process emotion data for rendering
    const imageObject = processImageObject(images, classificationResults, outlierProbabilities);

    // Render appropriate screen based on current round
    return currentRound === 21
        ? <RenderResqueScreen trialId={id} automationLevel={automationLevel} />
        : <RenderTrialScreen
            id={id}
            currentRound={currentRound}
            imageObject={imageObject}
        />;
}

/**
 * Processes the emotion data from classification results
 */
const processImageObject = cache(
    (
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
);

/**
 * Determines if the page should refresh based on trial conditions
 */
function shouldRefreshPage(
    predictedOutlier: string,
    actualOutlier: string,
    currentRound: number,
    falsePredictions: number
): boolean {
    return (
        (predictedOutlier !== actualOutlier && (currentRound <= 10 || falsePredictions > 3)) ||
        (predictedOutlier === actualOutlier && currentRound > 15 && falsePredictions < 4)
    );
}

/**
 * Renders the final rescue screen at the end of the trial
 */
function RenderResqueScreen({ trialId, automationLevel }: { trialId: string; automationLevel: AutomationLevel }) {
    return (
        <div className="resque-container">
            <Resque trialId={trialId} automationLevel={automationLevel} />
        </div>
    );
}

/**
 * Renders the main LOA2 component during the trial
 */
function RenderTrialScreen({
    id,
    currentRound,
    imageObject
}: {
    id: string;
    currentRound: number;
    imageObject: ImageObject[];
}) {
    return (
        <div className="trial-container">
            <LOA2Component
                id={id}
                currentRound={currentRound}
                imageObject={imageObject}
            />
        </div>
    );
}

