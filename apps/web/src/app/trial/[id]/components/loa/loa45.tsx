"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, easeInOut } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ImageObject } from "@/backend/types";
import { answerTrialQuestion } from "@/backend/functions/answer-trial-question";
import { toast } from "sonner";
import { TOTAL_ROUNDS } from "@/app/utils";
import { loaInfoLoa45 as loaInfo } from "@/app/data";
import { InfoPopover } from "@/components/ui/info-popover";
import { Button } from "@/components/ui/button";

type LOA45ComponentProps = {
    id: string;
    currentRound: number;
    imageObject: ImageObject[];
    falsePrediction: boolean;
};

export function LOA45Component({ id, currentRound, imageObject, falsePrediction }: LOA45ComponentProps) {
    const router = useRouter();

    // Sort images by outlier probability (highest to lowest)
    const sortedImages = useMemo(() => {
        if (!imageObject || imageObject.length === 0) return [];
        return [...imageObject].sort((a, b) => b.outlierProbability - a.outlierProbability);
    }, [imageObject]);

    // Initialize state - will be updated by useEffect when imageObject changes
    const [selectedImage, setSelectedImage] = useState<ImageObject | null>(null);

    // Reset the selected image to the one with highest outlier probability whenever imageObject changes
    useEffect(() => {
        if (sortedImages.length > 0) {
            setSelectedImage(sortedImages[0]);
        }
    }, [sortedImages, imageObject]);

    // Get rank colors based on position (green → yellow → orange → red)
    const getRankColor = (index: number, total: number) => {
        const colors = {
            0: {
                bg: 'from-emerald-500/40 via-emerald-500/30 to-emerald-400/20',
                border: 'border-emerald-400/60',
                glow: 'shadow-emerald-500/25',
                ring: 'ring-emerald-400/70',
                selected: 'from-emerald-600/30 via-emerald-400/20 to-emerald-500/25',
                badge: 'from-emerald-500/90 to-emerald-600/90'
            },
            1: {
                bg: 'from-green-500/40 via-green-500/30 to-green-400/20',
                border: 'border-green-400/60',
                glow: 'shadow-green-500/25',
                ring: 'ring-green-400/70',
                selected: 'from-green-600/30 via-green-400/20 to-green-500/25',
                badge: 'from-green-500/90 to-green-600/90'
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
                bg: 'from-red-500/40 via-red-500/30 to-red-400/20',
                border: 'border-red-400/60',
                glow: 'shadow-red-500/25',
                ring: 'ring-red-400/70',
                selected: 'from-red-600/30 via-red-400/20 to-red-500/25',
                badge: 'from-red-500/90 to-red-600/90'
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
                        <CheckCircle2 className="h-6 w-6 text-blue-400" />
                        <h2 className="text-lg font-medium text-slate-200" >
                            Level of Automation 4-5: Ranked / Validated Classification
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

                < div >
                    <h1 className="text-4xl font-bold text-white mb-2" >
                        Find the Outlier Emotion
                    </h1>
                    < p className="text-slate-400" >
                        Select the image that shows a different emotion from the others
                    </p>
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
                    </div>
                    <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden backdrop-blur-sm" >
                        <div
                            className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full shadow-sm"
                            style={{ width: `${(currentRound - 1) * 100 / TOTAL_ROUNDS}%` }}
                        />
                    </div>
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
                        onClick={async () => {
                            // Find image with highest outlier probability
                            const highestProbabilityImage = [...imageObject].sort((a, b) =>
                                b.outlierProbability - a.outlierProbability
                            )[0];

                            // Check if user selected the highest probability image
                            const isUserAccepted = selectedImage?.imageId === highestProbabilityImage?.imageId;

                            try {
                                await answerTrialQuestion({ trialId: id, isCorrect: selectedImage?.correct ?? false, falsePrediction, isUserAccepted });
                                router.push(`/trial/${id}`);
                            } catch (error) {
                                toast.error("Error answering trial question");
                            }
                        }}
                    >
                        {currentRound === TOTAL_ROUNDS ? "Finish" : "Confirm Selection"}
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
                                onClick={() => setSelectedImage(imageObj)}
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
