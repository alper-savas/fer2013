"use client";

import { motion, easeInOut } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export default function LOA3() {
    const router = useRouter();

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
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 py-1">
                    Level of Automation 3
                </h1>
                <p className="text-slate-400 text-xl max-w-2xl mx-auto">
                    Ranked Classification
                </p>
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
                    <div className="relative p-8">
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <h2 className="text-2xl font-semibold text-white">Task Description</h2>
                                <div className="space-y-3 text-slate-300">
                                    <p>
                                        In this configuration, the system performs initial processing and ranking, while you maintain decision authority. The process involves:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 ml-4 text-slate-400">
                                        <li>The system automatically extracts facial features and identifies emotional expressions</li>
                                        <li>All images are ranked according to their probability of being an outlier</li>
                                        <li>Review the ordered list of images based on these probability rankings</li>
                                        <li>Make your selection informed by both the system's rankings and your visual inspection</li>
                                        <li>Adjust the selection if necessary based on your judgment</li>
                                        <li>Confirm the final classification decision</li>
                                    </ul>
                                    <p className="mt-4 text-slate-400">
                                        This configuration assigns substantial preprocessing and ranking tasks to the system while preserving
                                        your authority to make the final decision. The probability-based ranking enables comprehensive
                                        evaluation of all possible selections.
                                    </p>

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
                                                <li>You will answer NASA TLX questions to evaluate the perceived workload and task demands</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex flex-row justify-end">
                                <Button
                                    onClick={() => router.push("/loa3/trial")}
                                    className="bg-[#0D1117]/50 hover:bg-[#1C2128]/50 text-white text-base p-6 rounded-md transition-colors duration-300 hover:cursor-pointer border border-slate-500/60"
                                >
                                    I Understand - Start Trial
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
