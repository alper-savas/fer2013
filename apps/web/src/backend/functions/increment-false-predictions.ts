"use server";

import prisma from "@fer-app/db/prisma";

/**
 * Increments the false predictions for a trial
 * 
 * @param {Object} params - The parameters object
 * @param {string} params.id - The unique identifier of the trial to increment false predictions for
 * @returns {Promise<void>} A promise that resolves when the false predictions are incremented
 */
export async function incrementFalsePredictions({
    id,
}: {
    id: string;
}) {
    const trial = await prisma.trial.findUnique({ where: { id } });
    if (!trial) {
        throw new Error("Trial not found");
    }
    await prisma.trial.update({ where: { id }, data: { falsePredictions: trial.falsePredictions + 1 } });
}