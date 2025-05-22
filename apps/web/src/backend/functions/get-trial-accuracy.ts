"use server";

import prisma from "@fer-app/db/prisma";

const TOTAL_QUESTIONS = 20;

export const getTrialAccuracy = async ({
    trialId,
}: {
    trialId: string;
}): Promise<{ accuracy: number } | undefined> => {
    const trial = await prisma.trial.findUnique({
        where: { id: trialId },
    });

    if (!trial) {
        return undefined
    }


    const correctAnswers = trial.correctAnswers;

    const accuracy = correctAnswers / TOTAL_QUESTIONS;

    return {
        accuracy,
    };
};  