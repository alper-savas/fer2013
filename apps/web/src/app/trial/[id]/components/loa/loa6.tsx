"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { motion, easeInOut } from "framer-motion";
import { Timer } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ImageObject } from "@/backend/types";
import { answerTrialQuestion } from "@/backend/functions/answer-trial-question";
import { toast } from "sonner";
import { InfoPopover } from "@/components/ui/info-popover";
import { TOTAL_ROUNDS } from "@/app/utils";
import { loaInfoLoa6 as loaInfo } from "@/app/data";

const AUTO_CONFIRM_SECONDS = 10;

type LOA6ComponentProps = {
    id: string;
    currentRound: number;
    imageObject: ImageObject[];
    falsePrediction: boolean;
};

export function LOA6Component({ id, currentRound, imageObject, falsePrediction }: LOA6ComponentProps) {
    const router = useRouter();

    // Sort images by outlier probability (highest to lowest)
    const sortedImages = useMemo(() => {
        if (!imageObject || imageObject.length === 0) return [];
        return [...imageObject].sort((a, b) => b.outlierProbability - a.outlierProbability);
    }, [imageObject]);

    // Initialize state - will be updated by useEffect when imageObject changes
    const [selectedImage, setSelectedImage] = useState<ImageObject | null>(null);
    const [timeLeft, setTimeLeft] = useState(AUTO_CONFIRM_SECONDS);
    const [timerActive, setTimerActive] = useState(true);
    const [timerProgress, setTimerProgress] = useState(100); // 100% to start
    const animationRef = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const shouldConfirmRef = useRef(false);

    const confirmSelection = useCallback(async () => {
        if (!selectedImage) return;

        // Find image with highest outlier probability
        const highestProbabilityImage = [...imageObject].sort((a, b) =>
            b.outlierProbability - a.outlierProbability
        )[0];

        // Check if user selected the highest probability image
        const isUserAccepted = selectedImage.imageId === highestProbabilityImage.imageId;

        try {
            await answerTrialQuestion({ trialId: id, isCorrect: selectedImage.correct ?? false, falsePrediction, isUserAccepted });
            router.push(`/trial/${id}`);
        } catch (error) {
            toast.error("Error answering trial question");
        }
    }, [id, router, selectedImage, falsePrediction, imageObject]);

    // Smooth timer animation using requestAnimationFrame
    const animateTimer = useCallback((timestamp: number) => {
        if (!startTimeRef.current) startTimeRef.current = timestamp;

        const elapsed = timestamp - startTimeRef.current;
        const totalDuration = AUTO_CONFIRM_SECONDS * 1000;
        const remaining = Math.max(0, totalDuration - elapsed);

        // Update the smooth progress (0-100%)
        const newProgress = (remaining / totalDuration) * 100;
        setTimerProgress(newProgress);

        // Update the second counter (only when it changes)
        const secondsRemaining = Math.ceil(remaining / 1000);
        setTimeLeft(secondsRemaining);

        // Continue animation or finish
        if (remaining > 0 && timerActive) {
            animationRef.current = requestAnimationFrame(animateTimer);
        } else if (remaining <= 0) {
            // Set the ref and force a state update to trigger the confirmation effect
            shouldConfirmRef.current = true;
            setTimerActive(false); // Stop the timer and force a re-render
        }
    }, [timerActive]);

    // Effect to handle confirmations triggered by timer
    useEffect(() => {
        // We use a separate state variable to track if confirmation has been attempted
        // to prevent multiple confirmation attempts
        const needsConfirmation = shouldConfirmRef.current;

        if (needsConfirmation) {
            // Reset the flag immediately to prevent duplicate confirmations
            shouldConfirmRef.current = false;

            // Use setTimeout to ensure this happens after current render cycle
            setTimeout(() => {
                confirmSelection();
            }, 0);
        }
    }, [confirmSelection, timerActive]);

    // Reset the selected image to the one with highest outlier probability whenever imageObject changes
    useEffect(() => {
        if (sortedImages.length > 0) {
            setSelectedImage(sortedImages[0]);
            // Reset timer when new images load
            setTimeLeft(AUTO_CONFIRM_SECONDS);
            setTimerProgress(100);
            setTimerActive(true);
            startTimeRef.current = null;
        }
    }, [sortedImages, imageObject]);

    // Timer effect with requestAnimationFrame
    useEffect(() => {
        if (timerActive && selectedImage) {
            // Cancel any existing animation
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }

            // Start new animation
            startTimeRef.current = null;
            animationRef.current = requestAnimationFrame(animateTimer);
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [timerActive, selectedImage, animateTimer]);

    // Handler for image selection
    const handleImageSelection = (imageObj: ImageObject) => {
        setSelectedImage(imageObj);

        // Reset timer when user selects a different image
        if (imageObj.imageId !== sortedImages[0].imageId) {
            setTimerActive(false);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        }
    };

    // Get rank colors based on position (green → yellow → orange → red)
    const getRankColor = (index: number, total: number) => {
        const colors = {
            0: {
                bg: 'from-green-500/40 via-green-500/30 to-green-400/20',
                border: 'border-green-400/60',
                glow: 'shadow-green-500/25',
                ring: 'ring-green-400/70',
                selected: 'from-green-600/30 via-green-400/20 to-green-500/25',
                badge: 'from-green-500/90 to-green-600/90'
            },
            1: {
                bg: 'from-lime-500/40 via-lime-500/30 to-lime-400/20',
                border: 'border-lime-400/60',
                glow: 'shadow-lime-500/25',
                ring: 'ring-lime-400/70',
                selected: 'from-lime-600/30 via-lime-400/20 to-lime-500/25',
                badge: 'from-lime-500/90 to-lime-600/90'
            },
            2: {
                bg: 'from-yellow-500/40 via-yellow-500/30 to-yellow-400/20',
                border: 'border-yellow-400/60',
                glow: 'shadow-yellow-500/25',
                ring: 'ring-yellow-400/70',
                selected: 'from-yellow-600/30 via-yellow-400/20 to-yellow-500/25',
                badge: 'from-yellow-500/90 to-yellow-600/90'
            },
            3: {
                bg: 'from-orange-500/40 via-orange-500/30 to-orange-400/20',
                border: 'border-orange-400/60',
                glow: 'shadow-orange-500/25',
                ring: 'ring-orange-400/70',
                selected: 'from-orange-600/30 via-orange-400/20 to-orange-500/25',
                badge: 'from-orange-500/90 to-orange-600/90'
            },
            4: {
                bg: 'from-red-600/40 via-red-600/30 to-red-500/20',
                border: 'border-red-500/60',
                glow: 'shadow-red-600/25',
                ring: 'ring-red-500/70',
                selected: 'from-red-700/30 via-red-500/20 to-red-600/25',
                badge: 'from-red-600/90 to-red-700/90'
            }
        };

        // Map index to color based on position
        const normalizedIndex = Math.min(index, Object.keys(colors).length - 1);
        return colors[normalizedIndex as keyof typeof colors];
    };

    return (
        <div className="max-w-7xl mx-auto p-8" >
            {/* Header Section with Top Navigation */}
            < motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, ease: easeInOut }}
                className="mb-4"
            >
                <div className="flex items-center justify-between mb-4" >
                    <div className="flex items-center gap-3">
                        <Timer className="h-6 w-6 text-blue-400" />
                        <h2 className="text-lg font-medium text-slate-200" >
                            Level of Automation 6: Automated Classification with Veto
                        </h2>
                    </div>
                    <InfoPopover
                        title={loaInfo.title}
                        description={loaInfo.description}
                        details={loaInfo.details}
                        interaction={loaInfo.interaction}
                        emotions={["Anger", "Fear", "Happiness", "Sadness", "Surprise", "Neutral"]}
                    />
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2" >
                            Find the Outlier Emotion
                        </h1>
                        <p className="text-slate-400" >
                            Select the image that shows a different emotion from the others
                        </p>
                    </div>

                    {/* Emotions Info Section */}
                    <div className="mt-4 inline-block p-3 rounded-lg bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
                        <div className="flex flex-wrap gap-2">
                            {["Anger", "Fear", "Happiness", "Sadness", "Surprise", "Neutral"].map((emotion, index) => (
                                <span
                                    key={index}
                                    className="text-xs px-3 py-1.5 rounded-full bg-slate-700 text-slate-300 font-medium"
                                >
                                    {emotion}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Progress Bar */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, ease: easeInOut }}
                className="mb-8 relative flex flex-col items-center gap-8"
            >
                <div className="w-full" >
                    <div className="flex justify-between text-sm text-slate-400 mb-1" >
                        <div>Question {currentRound} of {TOTAL_ROUNDS} </div>
                        {timerActive && (
                            <div className="font-medium text-amber-400">
                                Auto-confirming in {timeLeft}s
                            </div>
                        )}
                    </div>
                    <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden backdrop-blur-sm" >
                        <div
                            className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full shadow-sm"
                            style={{ width: `${(currentRound - 1) * 100 / TOTAL_ROUNDS}%` }}
                        />
                    </div>
                    {/* Timer progress bar */}
                    {timerActive && (
                        <div className="w-full h-1 mt-1 bg-slate-700/30 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"
                                style={{ width: `${timerProgress}%` }}
                            />
                        </div>
                    )}
                </div>

                <div className="flex justify-center" >
                    <Button
                        disabled={selectedImage === null}
                        className={`
                        bg-gradient-to-r from-blue-600 to-blue-500 text-white text-base p-6 rounded-lg 
                        transition-colors duration-300 ease-in-out
                        shadow-md shadow-blue-500/10
                        hover:from-blue-500 hover:to-blue-400 hover:cursor-pointer
                        hover:shadow-lg hover:shadow-blue-500/20
                      `}
                        onClick={confirmSelection}
                    >
                        {timerActive ? `Confirm (${timeLeft}s)` : currentRound === TOTAL_ROUNDS ? "Finish" : "Confirm Selection"}
                    </Button>
                </div>
            </motion.div>

            {/* Image Grid - Sorted by outlier probability */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto" >
                {
                    sortedImages.map((imageObj, index) => {
                        const rankColors = getRankColor(index, sortedImages.length);

                        return (
                            <motion.div
                                key={imageObj.imageId}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{
                                    delay: 0.05 + index * 0.05,
                                    duration: 0.4,
                                    ease: easeInOut
                                }}
                                className={`
                                  group relative aspect-square rounded-xl overflow-hidden cursor-pointer w-[240px] h-[240px] mx-auto
                                  bg-white/[0.07] backdrop-blur-sm border ${rankColors.border}
                                  hover:scale-[1.01] transition-all duration-300
                                  ${selectedImage?.imageId === imageObj.imageId ? `ring-2 ${rankColors.ring} shadow-md ${rankColors.glow}` : ''}
                                  shadow-sm
                                `}
                                onClick={() => handleImageSelection(imageObj)}
                            >
                                <motion.div
                                    className={`absolute -inset-1 bg-gradient-to-r ${rankColors.bg} rounded-xl z-0 opacity-30 blur-sm`}
                                    animate={{
                                        opacity: [0.2, 0.3, 0.2],
                                        scale: [0.99, 1.005, 0.99]
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                />
                                <div className={`absolute inset-0 z-10 bg-gradient-to-r 
                                    ${rankColors.bg} opacity-20
                                    ${selectedImage?.imageId === imageObj.imageId ? `opacity-40 ${rankColors.selected}` : ''} 
                                    group-hover:opacity-30 transition-opacity duration-300`} />
                                <div className="w-full h-full relative p-3 z-10">
                                    <div className={`w-full h-full relative rounded-lg overflow-hidden shadow-inner 
                                        ${selectedImage?.imageId === imageObj.imageId ? `ring-2 ${rankColors.ring}` : 'ring-1 ring-white/10'}`}>
                                        <Image
                                            src={imageObj.path}
                                            alt={imageObj.label}
                                            fill
                                            className="object-cover transition-transform duration-500 brightness-100 group-hover:scale-105"
                                            unoptimized={true}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>

                                    {selectedImage?.imageId === imageObj.imageId && (
                                        <div className="absolute bottom-4 right-4 text-white font-medium bg-gradient-to-r from-blue-500/90 to-blue-600/90 px-3 py-1 rounded-full text-xs shadow-sm">
                                            Selected
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
            </div>
        </div>
    );
}
