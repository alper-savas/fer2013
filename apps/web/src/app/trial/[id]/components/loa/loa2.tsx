"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, easeInOut } from "framer-motion";
import { CircleDot, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ImageObject } from "@/backend/types";
import { answerTrialQuestion } from "@/backend/functions/answer-trial-question";
import { toast } from "sonner";
import { TOTAL_ROUNDS } from "@/app/utils";
import { loaInfoLoa2 as loaInfo } from "@/app/data";
import { InfoPopover } from "@/components/ui/info-popover";
import { Button } from "@/components/ui/button";

type LOA2ComponentProps = {
    id: string;
    currentRound: number;
    imageObject: ImageObject[];
    falsePrediction: boolean;
};

export function LOA2Component({ id, currentRound, imageObject, falsePrediction }: LOA2ComponentProps) {
    const router = useRouter();
    const [selectedImage, setSelectedImage] = useState<ImageObject | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Reset selectedImage when imageObject changes (new question)
    useEffect(() => {
        setSelectedImage(null);
        setIsLoading(false);
    }, [imageObject]);

    // Find images to highlight - either the top 3 outliers or random images if correct image is not in top 3
    const imagesToHighlight = useMemo(() => {
        if (!imageObject || imageObject.length === 0) return [];

        // Find the correct image
        const correctImage = imageObject.find(img => img.correct === true);
        if (!correctImage) return [];

        // Sort by outlier probability
        const sortedImages = [...imageObject].sort((a, b) => b.outlierProbability - a.outlierProbability);

        // Check if the correct image has the highest probability
        const isCorrectHighestProbability = sortedImages[0].imageId === correctImage.imageId;

        if (isCorrectHighestProbability) {
            // If correct image has highest probability, highlight top 3
            return sortedImages.slice(0, 3);
        } else {
            // If correct image is not highest probability, highlight 3 random images that are NOT the correct image
            const otherImages = imageObject.filter(img => img.imageId !== correctImage.imageId);
            const availableIndices = [...Array(otherImages.length).keys()];
            const shuffled = availableIndices.sort(() => 0.5 - Math.random());
            const randomIndices = shuffled.slice(0, Math.min(3, otherImages.length));
            return randomIndices.map(idx => otherImages[idx]);
        }
    }, [imageObject]);

    return (
        <div className="max-w-7xl mx-auto p-8" >
            {/* Header Section with Top Navigation */}
            < motion.div
                initial={{ opacity: 0 }
                }
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, ease: easeInOut }}
                className="mb-4"
            >
                <div className="flex items-center justify-between mb-4" >
                    <div className="flex items-center gap-3">
                        <CircleDot className="h-6 w-6 text-blue-400" />
                        <h2 className="text-lg font-medium text-slate-200" >
                            Level of Automation 2: Assisted Classification
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
                        disabled={selectedImage === null || isLoading}
                        className={`
                        bg-gradient-to-r from-blue-600 to-blue-500 text-white text-base p-6 rounded-lg 
                        transition-colors duration-300 ease-in-out
                        shadow-md shadow-blue-500/10
                        hover:from-blue-500 hover:to-blue-400 hover:cursor-pointer
                        hover:shadow-lg hover:shadow-blue-500/20
                        disabled:opacity-80 disabled:cursor-not-allowed
                        flex items-center gap-2
                      `}
                        onClick={async () => {
                            setIsLoading(true);
                            try {
                                // Find image with highest outlier probability
                                const highestProbabilityImage = [...imageObject].sort((a, b) =>
                                    b.outlierProbability - a.outlierProbability
                                )[0];

                                // Check if user selected the highest probability image
                                const isUserAccepted = selectedImage?.imageId === highestProbabilityImage?.imageId;

                                await answerTrialQuestion({
                                    trialId: id,
                                    isCorrect: selectedImage?.correct ?? false,
                                    falsePrediction,
                                    isUserAccepted
                                });
                                router.push(`/trial/${id}`);
                            } catch (error) {
                                toast.error("Error answering trial question");
                                setIsLoading(false);
                            }
                        }}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            currentRound === TOTAL_ROUNDS ? "Finish" : "Confirm Selection"
                        )}
                    </Button>
                </div>
            </motion.div>

            {/* Image Grid - Smaller Images */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto" >
                {
                    imageObject?.map((imageObj, index) => {
                        // Only show highlighting if no image is selected yet and this image is in imagesToHighlight
                        const shouldHighlight = selectedImage === null && imagesToHighlight.some(img => img.imageId === imageObj.imageId);

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{
                                    delay: 0.05 + index * 0.05,
                                    duration: 0.4,
                                    ease: easeInOut
                                }}
                                className={`
                                  group relative aspect-square rounded-xl overflow-hidden cursor-pointer w-[240px] h-[240px] mx-auto
                                  ${shouldHighlight
                                        ? 'bg-white/[0.25] backdrop-blur-sm border-2 border-blue-400/60'
                                        : 'bg-white/[0.10] backdrop-blur-sm border border-slate-800/30'} 
                                  hover:border-blue-300/50 hover:scale-[1.002] transition-all duration-500
                                  ${selectedImage?.imageId === imageObj.imageId ? 'border-blue-500 ring-2 ring-blue-400/50 shadow-md shadow-blue-500/20' : ''}
                                  ${shouldHighlight ? 'shadow-lg shadow-blue-500/25' : ''}
                                `}
                                onClick={() => setSelectedImage(imageObj)}
                            >
                                {shouldHighlight && (
                                    <motion.div
                                        className="absolute -inset-1 bg-blue-500/20 rounded-xl z-0 blur-sm"
                                        animate={{
                                            opacity: [0.4, 0.7, 0.4],
                                            scale: [0.98, 1.01, 0.98]
                                        }}
                                        transition={{
                                            duration: 2.5,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    />
                                )}
                                <div className={`absolute inset-0 z-10 bg-gradient-to-r 
                                ${shouldHighlight
                                        ? 'from-blue-500/40 via-purple-500/30 to-blue-400/20 opacity-50'
                                        : 'from-blue-500/10 via-purple-500/10 to-transparent opacity-0'} 
                                ${selectedImage?.imageId === imageObj.imageId ? 'opacity-80 from-blue-600/30 via-blue-400/20 to-blue-500/25' : ''} 
                                group-hover:opacity-100 transition-opacity duration-300`} />
                                <div className="w-full h-full relative p-3 z-10">
                                    <div className={`w-full h-full relative rounded-lg overflow-hidden shadow-inner 
                                    ${shouldHighlight ? 'ring-2 ring-blue-400/70' : 'ring-1 ring-white/10'} 
                                    ${selectedImage?.imageId === imageObj.imageId ? 'ring-blue-400/50 ring-2' : ''}`}>
                                        <Image
                                            src={imageObj.path}
                                            alt={imageObj.label}
                                            fill
                                            className={`object-cover transition-transform duration-500 ${shouldHighlight ? 'brightness-110' : ''} group-hover:scale-102`}
                                            unoptimized={true}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>
                                    {
                                        selectedImage?.imageId === imageObj.imageId && (
                                            <div className="absolute bottom-4 right-4 text-white font-medium bg-gradient-to-r from-blue-500/90 to-blue-600/90 px-3 py-1 rounded-full text-xs shadow-sm" >
                                                Selected
                                            </div>
                                        )
                                    }
                                </div>
                            </motion.div>
                        );
                    })}
            </div>
        </div>
    );
}
