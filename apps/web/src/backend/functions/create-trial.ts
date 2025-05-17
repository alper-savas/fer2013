"use server";

import prisma from "@fer-app/db/prisma";
import { AutomationLevel } from "../enums";

/**
 * Creates a new trial with the specified automation level
 * 
 * @param {Object} params - The parameters object
 * @param {AutomationLevel} params.automationLevel - The automation level for the trial
 * @returns {Promise<Object>} The created trial object with id and createdAt timestamp
 */
export async function createTrial({ automationLevel }: { automationLevel: AutomationLevel }) {
  const trial = await prisma.trial.create({
    data: {
      automationLevel,
    },
  });

  return {
    id: trial.id,
    createdAt: trial.createdAt,
  };
}
