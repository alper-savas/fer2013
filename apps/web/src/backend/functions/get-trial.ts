"use server";

import prisma from "@fer-app/db/prisma";
import { GetTrialOutput } from "@/backend/types";
import { AutomationLevel } from "@/backend/enums";

/**
 * Retrieves a trial from the database by its ID
 * 
 * @param {Object} params - The parameters object
 * @param {string} params.id - The unique identifier of the trial to retrieve
 * @returns {Promise<GetTrialOutput>} The trial data including id, timestamps, automation level and current round
 * @throws {Error} If trial with given ID is not found
 */
export async function getTrial({ id }: { id: string }) {
    const trial = await prisma.trial.findUnique({
        where: {
            id,
        },
        include: {
            resQue: true,
        }
    });

    if (!trial) {
        return undefined
    }

    return {
        id: trial.id,
        createdAt: trial.createdAt,
        updatedAt: trial.updatedAt,
        finishedAt: trial.finishedAt ?? undefined,
        automationLevel: trial.automationLevel as AutomationLevel,
        currentRound: trial.currentRound ?? undefined,
        falsePredictions: trial.falsePredictions ?? undefined,
        resQueId: trial.resQue?.id,
    } satisfies GetTrialOutput;
}