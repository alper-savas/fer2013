"use server"

import prisma from "@fer-app/db/prisma";

export async function answerTrialQuestion({ trialId, isCorrect }: { trialId: string, isCorrect: boolean }) {
  // Fetch the trial
  const trial = await prisma.trial.findUnique({
    where: { id: trialId },
  });

  // Throw error if trial doesn't exist
  if (!trial) {
    throw new Error("Trial not found");
  }

  // Prepare update data
  const updateData: any = {};

  // Increment correct or false answers based on isCorrect
  if (isCorrect) {
    updateData.correctAnswers = { increment: 1 };
  } else {
    updateData.incorrectAnswers = { increment: 1 };
  }

  // Increment current round
  updateData.currentRound = { increment: 1 };

  // If it's the 20th round, set finishedAt to now
  if (trial.currentRound === 19) { // 19 + 1 = 20 after increment
    updateData.finishedAt = new Date();
  }

  // Update the trial
  const updatedTrial = await prisma.trial.update({
    where: { id: trialId },
    data: updateData,
  });

  return updatedTrial;

}

