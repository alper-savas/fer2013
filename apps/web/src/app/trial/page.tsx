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
    const [numberOfTrials, setNumberOfTrials] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const currentLoa = numberOfTrials === null ? null : numberOfTrials % 5;
    const CurrentLOAComponent = currentLoa !== null ? LOA_COMPONENTS[currentLoa as keyof typeof LOA_COMPONENTS] : null;

    useEffect(() => {
        const fetchNumberOfTrials = async () => {
            try {
                const count = await getNumberOfTrials();
                setNumberOfTrials(count);
            } catch (error) {
                console.error('Failed to fetch number of trials:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchNumberOfTrials();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-700"></div>
            </div>
        );
    }

    if (currentLoa === null || !CurrentLOAComponent) {
        return <div>Error loading trial data</div>;
    }

    return <CurrentLOAComponent />;
}
