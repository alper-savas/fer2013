"use server"

import prisma from "@fer-app/db/prisma";

export async function answerTrialQuestion({ trialId, isCorrect, falsePrediction, isUserAccepted }: { trialId: string, isCorrect: boolean, falsePrediction?: boolean, isUserAccepted?: boolean }) {
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

  if (falsePrediction) {
    updateData.falsePredictions = { increment: 1 };
  }

  if (isUserAccepted) {
    if (falsePrediction) {
      updateData.acceptedFalse = { increment: 1 };
    } else {
      updateData.acceptedTrue = { increment: 1 };
    }
  } else {
    if (falsePrediction) {
      updateData.rejectedFalse = { increment: 1 };
    } else {
      updateData.rejectedTrue = { increment: 1 };
    }
  }


  // Increment current round
  updateData.currentRound = { increment: 1 };

  // If it's the 20th round, set finishedAt to now
  if (trial.currentRound === 20) {
    updateData.finishedAt = new Date();
    updateData.duration = new Date().getTime() - trial.createdAt.getTime();
  }

  // Update the trial
  const updatedTrial = await prisma.trial.update({
    where: { id: trialId },
    data: updateData,
  });

  return updatedTrial;

}

