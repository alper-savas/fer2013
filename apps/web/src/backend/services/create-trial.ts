"use server";

import prisma from "@fer-app/db/prisma";
import { AutomationLevel } from "./enums";

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
