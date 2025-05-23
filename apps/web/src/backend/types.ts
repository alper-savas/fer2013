import { AutomationLevel, Label, ResQueLevel } from "./enums";

export type GetTrialOutput = {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    finishedAt?: Date;
    // duration?: number;
    automationLevel: AutomationLevel;
    currentRound?: number;
    falsePredictions?: number;
    resQueId?: string;
    // correctAnswers?: number;
    // incorrectAnswers?: number;
    // acceptedTrue?: number;
    // acceptedFalse?: number;
    // rejectedTrue?: number;
    // rejectedFalse?: number;
}

export type ImageData = {
    id: string;
    path: string;
    label: Label;
    correct: boolean;
}

export type ResQueItem = {
    id: string;
    question: string;
    answer: ResQueLevel;
}

export type ImageObject = {
    imageId: string;
    label: Label;
    probabilities: Record<string, number>;
    predictedEmotion: Label;
    outlierProbability: number;
    path: string;
    correct: boolean;
}

export type ImageProbability = {
    id: string;
    probabilities: Record<string, number>;
}

export type OutlierProbability = {
    id: string;
    probability: number;
}

export type EmotionData = {
    imageUrl: string;
    emotion: string;
    probabilities: Record<string, number>;
}


