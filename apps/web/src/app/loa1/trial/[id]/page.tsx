import { getTrial } from "@/backend/services";
import { LOA1Component } from "./components";
import { getImages } from "@/backend/services";
import { Resque } from "../../../components/resque";
import { notFound } from "next/navigation";

type PageParams = {
    params: Promise<{ id: string }>;
};

export default async function LOA1Page({ params }: PageParams) {
    const { id } = await params;
    const [trial, images] = await Promise.all([
        getTrial({ id }),
        getImages()
    ]);

    if (!trial) {
        return notFound();
    }

    const { currentRound, finishedAt, automationLevel } = trial;

    return (
        currentRound === 21 ? (
            <div>
                <Resque trialId={id} automationLevel={automationLevel} />
            </div>
        ) : (
            <div>
                <LOA1Component
                    id={id}
                    currentRound={currentRound}
                    finishedAt={finishedAt}
                    images={images}
                />
            </div>
        )
    );
}