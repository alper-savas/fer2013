"use server";

import prisma from "@fer-app/db/prisma";

/**
 * Gets the total count of trials in the database
 * 
 * @returns {Promise<number>} The total number of trials
 */
export async function getNumberOfTrials() {
    const count = await prisma.trial.count();
    return count;
}
