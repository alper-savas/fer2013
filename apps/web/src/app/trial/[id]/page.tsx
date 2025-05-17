import { LOA1Component, LOA2Component, LOA3Component, LOA45Component, LOA6Component } from "./components";
import { getTrial, getImages, classifyEmotions, incrementFalsePredictions } from "@/backend";
import { notFound, redirect } from "next/navigation";
import { ImageObject, OutlierProbability } from "@/backend/types";
import {
    calculateOutlierProbabilities, getPredictedOutlierImage,
    getOutlierImage,
    shouldRefreshPage,
    processImageObject,
} from "@/app/utils";

import { AutomationLevel } from "@/backend/enums";
import { ImageData } from "@/backend/types";
import { Resque } from "@/app/components/resque";

export default async function TrialPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    let falsePrediction = false;

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
        redirect(`/trial/${id}`);
    } else if (predictedOutlierImage !== actualOutlierImage) {
        falsePrediction = true;
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
            automationLevel={automationLevel}
            images={images}
            falsePrediction={falsePrediction}
        />;
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
 * Renders the appropriate LOA component based on automation level
 */
function RenderTrialScreen({
    id,
    currentRound,
    imageObject,
    automationLevel,
    images,
    falsePrediction
}: {
    id: string;
    currentRound: number;
    imageObject: ImageObject[];
    automationLevel: AutomationLevel;
    images: ImageData[];
    falsePrediction: boolean;
}) {
    return (
        <div className="trial-container">
            {automationLevel === AutomationLevel.LOA1 && (
                <LOA1Component
                    id={id}
                    currentRound={currentRound}
                    images={images}
                />
            )}
            {automationLevel === AutomationLevel.LOA2 && (
                <LOA2Component
                    id={id}
                    currentRound={currentRound}
                    imageObject={imageObject}
                    falsePrediction={falsePrediction}
                />
            )}
            {automationLevel === AutomationLevel.LOA3 && (
                <LOA3Component
                    id={id}
                    currentRound={currentRound}
                    imageObject={imageObject}
                    falsePrediction={falsePrediction}
                />
            )}
            {automationLevel === AutomationLevel.LOA4_5 && (
                <LOA45Component
                    id={id}
                    currentRound={currentRound}
                    imageObject={imageObject}
                    falsePrediction={falsePrediction}
                />
            )}
            {automationLevel === AutomationLevel.LOA6 && (
                <LOA6Component
                    id={id}
                    currentRound={currentRound}
                    imageObject={imageObject}
                    falsePrediction={falsePrediction}
                />
            )}
        </div>
    );
}

