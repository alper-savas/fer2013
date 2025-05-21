"use client";

import { motion, easeInOut } from "framer-motion";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronDown } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createTrial } from "@/backend";
import { AutomationLevel } from "@/backend/enums";

export default function LOA1() {
    const router = useRouter();
    const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);
    const scrollContainerRef = useRef(null);
    const emotions = ["Anger", "Fear", "Happiness", "Sadness", "Surprise", "Neutral"];

    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
            // Check if user has scrolled to the bottom (with a small threshold)
            const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;

            if (isAtBottom && !hasScrolledToEnd) {
                setHasScrolledToEnd(true);
            }
        }
    };

    return (
        <div className="relative max-w-3xl mx-auto p-8 space-y-2 mt-8">
            {/* Back Button */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, ease: easeInOut }}
                className="absolute left-8 top-10"
            >
                <div
                    onClick={() => router.push('/')}
                    className="p-2 rounded-full hover:bg-white/[0.05] cursor-pointer transition-colors duration-200 group"
                >
                    <ChevronLeft className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors duration-200" />
                </div>
            </motion.div>

            {/* Header */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, ease: easeInOut }}
                className="text-center flex flex-col items-center justify-center gap-2"
            >
                <div className="space-y-3">
                    <div className="relative inline-block">
                        <div className="absolute inset-0 blur-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full"></div>
                        <span className="relative px-4 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-slate-700/50 text-blue-300">
                            You have been assigned to
                        </span>
                    </div>

                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 py-1">
                        Level of Automation 1
                    </h1>

                    <div className="flex items-center justify-center space-x-2">
                        <p className="text-slate-400 text-xl">
                            Fully Manual Classification
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Task Description Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4, ease: easeInOut }}
                className="mt-8"
            >
                <div className="group relative bg-white/[0.03] backdrop-blur-sm rounded-xl overflow-hidden border border-slate-800/30">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-transparent" />
                    <div className="relative p-6 flex flex-col h-[500px]">
                        {/* Scrollable content area */}
                        <div
                            ref={scrollContainerRef}
                            onScroll={handleScroll}
                            className="overflow-y-auto pr-4 flex-grow mb-4
                                    scrollbar-thin scrollbar-thumb-blue-500/50 scrollbar-track-slate-800/20
                                    scrollbar-thumb-rounded-full hover:scrollbar-thumb-blue-500/70"
                            style={{
                                scrollbarWidth: 'thin',
                                msOverflowStyle: 'none'
                            }}
                        >
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <h2 className="text-2xl font-semibold text-white">Task Description</h2>
                                    <div className="space-y-3 text-slate-300">
                                        <p>
                                            This configuration represents the lower boundary (Level of Automation 1), where the entire classification task is performed manually without any computational support. Your task involves:
                                        </p>
                                        <p className="text-slate-400">
                                            Identifying outlier emotions among presented images, performing all aspects of the classification task independently,
                                            making decisions without any computational or system assistance, and completing the classification based purely on your judgment.
                                        </p>
                                        <p className="mt-4 text-slate-400">
                                            This represents the baseline configuration where all subtasks are assigned to the user,
                                            establishing a foundation for comparing different levels of automation in the emotion
                                            recognition task.
                                        </p>

                                        <div className="mt-6 space-y-4">
                                            <h3 className="text-xl font-semibold text-white">How to interact with the system:</h3>
                                            <div className="space-y-3 text-slate-400">
                                                <ul className="list-disc list-inside space-y-2 ml-4">
                                                    <li>For each round, review all 6 facial expressions. 5 of them are the same emotion, but one is different.</li>
                                                    <li>Select the image that shows a different emotion from the others</li>
                                                    <li>Click on the "Confirm Selection" button to proceed to the next question</li>
                                                    <li>You must select and confirm your choice to proceed to the next round</li>
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="mt-6 space-y-4">
                                            <h3 className="text-xl font-semibold text-white">Trial Procedure</h3>
                                            <div className="space-y-3 text-slate-400">
                                                <p>During this trial:</p>
                                                <ul className="list-disc list-inside space-y-2 ml-4">
                                                    <li>You will complete 20 rounds of facial expression classification</li>
                                                    <li>Each round will present 6 different facial expression images from the FER2013 dataset</li>
                                                </ul>

                                                <p className="mt-4">You will answer ResQue questions to provide feedback about your experience</p>

                                                <p className="mt-4">Possible emotions you'll encounter:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {emotions.map((emotion, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="py-2 px-3 bg-slate-800/80 text-sm rounded-md border border-slate-700 text-slate-300"
                                                        >
                                                            {emotion}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer with button - fixed at bottom */}
                        <div className="pt-4 flex flex-row justify-between items-center border-t border-slate-700/30">
                            {!hasScrolledToEnd ? (
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                                    <p className="text-amber-400 text-sm">
                                        Please scroll to the end to continue
                                    </p>
                                    <motion.div
                                        animate={{ y: [0, 3, 0] }}
                                        transition={{
                                            repeat: Infinity,
                                            duration: 1.5,
                                            ease: "easeInOut"
                                        }}
                                    >
                                        <ChevronDown className="h-4 w-4 text-amber-400" />
                                    </motion.div>
                                </div>
                            ) : (
                                <div className="text-green-400 text-sm flex items-center space-x-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    <span>Ready to proceed</span>
                                </div>
                            )}

                            <Button
                                onClick={async () => {
                                    try {
                                        const trial = await createTrial({ automationLevel: AutomationLevel.LOA1 });
                                        router.push(`/trial/${trial.id}`);
                                        toast.success("Trial created successfully. Redirecting to trial...", {
                                            style: {
                                                backgroundColor: "#0D1117",
                                                color: "#C9D1D9",
                                                border: "1px solid #30363D",
                                            }
                                        });
                                    } catch (err) {
                                        toast.error("Failed to create trial. Please try again.", {
                                            style: {
                                                backgroundColor: "#0D1117",
                                                color: "#C9D1D9",
                                                border: "1px solid #30363D",
                                            }
                                        });
                                    }
                                }}
                                disabled={!hasScrolledToEnd}
                                className={`${hasScrolledToEnd
                                    ? "bg-[#0D1117]/50 hover:bg-[#1C2128] text-white hover:border-blue-400/70"
                                    : "bg-[#0D1117]/30 text-slate-400 cursor-not-allowed"
                                    } text-base px-6 py-3 rounded-md transition-all duration-300 border border-slate-500/60 cursor-pointer`}
                            >
                                I Understand - Start Trial
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
