"use server";

import prisma from "@fer-app/db/prisma";

export async function getTrial({ id }: { id: string }) {
    const trial = await prisma.trial.findUnique({
        where: {
            id,
        },
    });

    return trial;
}