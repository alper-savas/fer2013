"use client";

import { getNumberOfTrials } from "@/backend/functions/get-number-of-trials";
import { LOA1, LOA2, LOA3, LOA45, LOA6 } from "@/app/components/info";
import { useState, useEffect } from "react";

const LOA_COMPONENTS = {
    0: LOA1,
    1: LOA2,
    2: LOA3,
    3: LOA45,
    4: LOA6,
} as const;

export default function TrialPage() {
    const [numberOfTrials, setNumberOfTrials] = useState(0);
    const currentLoa = numberOfTrials % 5;
    const CurrentLOAComponent = LOA_COMPONENTS[currentLoa as keyof typeof LOA_COMPONENTS];

    useEffect(() => {
        const fetchNumberOfTrials = async () => {
            const count = await getNumberOfTrials();
            setNumberOfTrials(count);
        };
        fetchNumberOfTrials();
    }, []);

    return <CurrentLOAComponent />;
}
