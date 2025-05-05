"use server";

import prisma from "@fer-app/db/prisma";

export async function createTrial() {
  const trial = await prisma.trial.create({
    data: {},
  });

  return trial.id;
}
