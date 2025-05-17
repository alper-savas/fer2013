"use client";

import { useState } from "react";
import { motion, easeInOut } from "framer-motion";
import { UserCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ImageData } from "@/backend/types";
import { answerTrialQuestion } from "@/backend/functions/answer-trial-question";
import { toast } from "sonner";
import { TOTAL_ROUNDS } from "@/app/utils";
import { loaInfoLoa1 as loaInfo } from "@/app/data";
import { InfoPopover } from "@/components/ui/info-popover";
import { Button } from "@/components/ui/button";

type LOA1ComponentProps = {
    id: string;
    currentRound: number;
    finishedAt?: Date;
    images: ImageData[];
};

export function LOA1Component({ id, currentRound, finishedAt, images }: LOA1ComponentProps) {
    const router = useRouter();
    const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);

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
                        <UserCircle2 className="h-6 w-6 text-blue-400" />
                        <h2 className="text-lg font-medium text-slate-200" >
                            Level of Automation 1: Fully Manual Classification
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
                            try {
                                await answerTrialQuestion({ trialId: id, isCorrect: selectedImage?.correct ?? false });
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

            {/* Image Grid - Smaller Images */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto" >
                {
                    images?.map((image, index) => (
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
              bg-white/[0.10] backdrop-blur-sm border border-slate-800/30 
              hover:border-blue-300/50 hover:scale-[1.002] transition-all duration-500
              ${selectedImage?.id === image.id ? 'border-blue-500 ring-2 ring-blue-400/50 shadow-md shadow-blue-500/20' : ''}
            `}
                            onClick={() => setSelectedImage(image)}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-transparent opacity-0 
                            ${selectedImage?.id === image.id ? 'opacity-80 from-blue-600/30 via-blue-400/20 to-blue-500/25' : ''} 
                            group-hover:opacity-100 transition-opacity duration-300`} />
                            <div className="w-full h-full relative p-3">
                                <div className={`w-full h-full relative rounded-lg overflow-hidden shadow-inner ring-1 ring-white/10 
                                ${selectedImage?.id === image.id ? 'ring-blue-400/50 ring-2' : ''}`}>
                                    <Image
                                        src={image.path}
                                        alt={image.label}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-102"
                                        unoptimized={true}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>
                                {
                                    selectedImage?.id === image.id && (
                                        <div className="absolute bottom-4 right-4 text-white font-medium bg-gradient-to-r from-blue-500/90 to-blue-600/90 px-3 py-1 rounded-full text-xs shadow-sm" >
                                            Selected
                                        </div>
                                    )
                                }
                            </div>
                        </motion.div>
                    ))}
            </div>
        </div>
    );
}
