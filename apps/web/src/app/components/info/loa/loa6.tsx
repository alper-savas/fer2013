"use client";

import { motion, easeInOut } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronDown } from "lucide-react";
import { AutomationLevel } from "@/backend/enums";
import { createTrial } from "@/backend";
import { useState, useRef } from "react";
import { toast } from "sonner";

export default function LOA6() {
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
                        Level of Automation 6
                    </h1>

                    <div className="flex items-center justify-center space-x-2">
                        <p className="text-slate-400 text-xl">
                            Automated Classification with Veto
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
                                            This configuration represents the upper boundary of automation in facial emotion recognition, balancing efficiency with necessary human oversight and
                                            <strong className="text-blue-400"> the system's automatic selections might not always be correct</strong>. Your role involves:
                                        </p>
                                        <p className="text-slate-400">
                                            Monitoring the system as it selects and prepares to lock in its decision, exercising your veto option
                                            during a limited time window if needed, entering manual mode to select a different image if you vetoed
                                            the system's choice, and allowing the system's decision to be automatically confirmed if no veto is issued.
                                        </p>
                                        <p className="mt-4 text-slate-400">
                                            This represents the highest suitable automation level for FER applications, as higher levels (LoA 7-10)
                                            lack necessary human oversight and risk perpetuating biases or misclassifications. The constrained veto
                                            opportunity ensures reliability while maximizing automation benefits.
                                        </p>

                                        <div className="mt-6 space-y-4">
                                            <h3 className="text-xl font-semibold text-white">How to interact with the system:</h3>
                                            <div className="space-y-3 text-slate-400">
                                                <ul className="list-disc list-inside space-y-2 ml-4">
                                                    <li>For each round, review all 6 facial expressions. 5 of them are the same emotion, but one is different.</li>
                                                    <li>The system will automatically select an outlier</li>
                                                    <li>A countdown timer will appear, during which you can veto the system's decision</li>
                                                    <li>If you disagree with the selection, click the "Veto" button within the time window</li>
                                                    <li>After vetoing, select a different image and confirm your selection</li>
                                                    <li>If you don't veto, the system will automatically proceed to the next round</li>
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

                                                <p className="mt-4">After completing this trial:</p>
                                                <ul className="list-disc list-inside space-y-2 ml-4">
                                                    <li>You will answer ResQue questions to provide feedback about your experience</li>
                                                </ul>

                                                <p className="mt-4">Possible emotions you'll encounter:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {emotions.map((emotion, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="px-3 py-2 bg-slate-800/80 text-sm rounded-md border border-slate-700 text-slate-300"
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
                                        const trial = await createTrial({ automationLevel: AutomationLevel.LOA6 });
                                        router.push(`/trial/${trial.id}`);
                                        toast.success("Trial created successfully. Redirecting to trial...", {
                                            style: {
                                                backgroundColor: "#0D1117",
                                                color: "#C9D1D9",
                                                border: "1px solid #30363D",
                                            }
                                        });
                                    } catch (error) {
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
