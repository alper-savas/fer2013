"use server";

import prisma from "@fer-app/db/prisma";
import { ResQueItem } from "./types";

export async function submitResque({
    trialId,
    answers,
}: {
    trialId: string;
    answers: ResQueItem[];
}) {
    // First, check if the trial exists
    const trial = await prisma.trial.findUnique({
        where: { id: trialId },
    });

    if (!trial) {
        return undefined
    }

    const resQue = await prisma.resQue.upsert({
        where: { trialId },
        update: {
            items: answers,
            updatedAt: new Date(),
        },
        create: {
            trialId,
            items: answers,
        },
    });

    // Update the trial
    const updatedTrial = await prisma.trial.update({
        where: { id: trialId },
        data: {
            updatedAt: new Date(),
        },
    });

    return {
        id: trial.id,
    };
}