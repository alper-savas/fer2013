"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { motion, easeInOut } from "framer-motion";
import { UserCircle2, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AutomationLevel, ResQueLevel } from "@/backend/enums";
import { ResQueItem } from "@/backend/types";
import { submitResque } from "@/backend";
import { automationLevels } from "@/app/data";

// Define form schema with validation
const formSchema = z.object({
    // General Trust
    generalTrust1: z.string().min(1, "Please answer this question"),
    generalTrust2: z.string().min(1, "Please answer this question"),
    generalTrust3: z.string().min(1, "Please answer this question"),

    // Automation-Specific Trust - these are conditionally required based on automation level
    autoTrust1: z.string().min(1, "Please answer this question"),
    autoTrust2: z.string().min(1, "Please answer this question"),
    autoTrust3: z.string().min(1, "Please answer this question"),

    // Confidence and Reliance
    confidence1: z.string().min(1, "Please answer this question"),
    confidence2: z.string().min(1, "Please answer this question"),
    confidence3: z.string().min(1, "Please answer this question"),

    // Perceived Accuracy and Bias
    accuracyAndBias1: z.string().min(1, "Please answer this question"),
    accuracyAndBias2: z.string().min(1, "Please answer this question"),
    accuracyAndBias3: z.string().min(1, "Please answer this question"),
    accuracyAndBias4: z.string().min(1, "Please answer this question"),
    accuracyAndBias5: z.string().min(1, "Please answer this question"),
    accuracyAndBias6: z.string().min(1, "Please answer this question"),

    // Usefulness
    usefulness1: z.string().min(1, "Please answer this question"),
    usefulness2: z.string().min(1, "Please answer this question"),
    usefulness3: z.string().min(1, "Please answer this question"),
}).refine((data) => {
    return true;
}, {
    message: "Please complete all required questions",
    path: ["form"]
});

type ResqueFormValues = z.infer<typeof formSchema>;

type ResqueProps = {
    trialId: string;
    automationLevel: AutomationLevel;
    accuracy: number | undefined;
};

// Map of questions for each field
const questionMap = {
    generalTrust1: "I felt confident that the system helped me identify the correct outlier image.",
    generalTrust2: "I trusted the system to make accurate decisions about which image was the outlier.",
    generalTrust3: "I felt comfortable relying on the system to assist me in this task.",

    autoTrust1: "The way the images were presented made it easier for me to trust the system's recommendations.",
    autoTrust2: "I trusted the system's recommendations to be the correct outlier.",
    autoTrust3: "I preferred making the decision relying on the system's output rather than my own judgment.",

    confidence1: "I would rely on this system if I had to perform this task again.",
    confidence2: "The system's involvement made me question my own judgment less.",
    confidence3: "I felt more confident in my choices when the system's recommendations were the same as my own.",

    accuracyAndBias1: "I believe the system accurately identified the outlier most of the time.",
    accuracyAndBias2: "I found myself agreeing with the system's recommendations even when I wasn't sure they were correct.",
    accuracyAndBias3: "I felt pressured to accept the system's output.",
    accuracyAndBias4: "I accepted the system's recommendations without thoroughly reviewing them myself.",
    accuracyAndBias5: "I felt inclined to agree with the system's choice even when I had doubts about its accuracy.",
    accuracyAndBias6: "The system's recommendations influenced my decisions more than my own judgment.",

    usefulness1: "The system was useful in helping me identify the correct outlier image.",
    usefulness2: "Using the system made the task of finding the outlier image more efficient.",
    usefulness3: "I found the system's recommendations valuable for completing this task accurately.",
};

export function Resque({ trialId, automationLevel, accuracy }: ResqueProps) {
    const router = useRouter();
    const [isSubmitted, setIsSubmitted] = useState(false);

    const form = useForm<ResqueFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            generalTrust1: "",
            generalTrust2: "",
            generalTrust3: "",
            autoTrust1: "",
            autoTrust2: "",
            autoTrust3: "",
            confidence1: "",
            confidence2: "",
            confidence3: "",
            accuracyAndBias1: "",
            accuracyAndBias2: "",
            accuracyAndBias3: "",
            accuracyAndBias4: "",
            accuracyAndBias5: "",
            accuracyAndBias6: "",
            usefulness1: "",
            usefulness2: "",
            usefulness3: "",
        },
        mode: "onChange",
    });

    // Check if all fields are filled based on automation level
    const isFormValid = () => {
        const values = form.getValues();
        const errors = form.formState.errors;
        const hasErrors = Object.keys(errors).length > 0;

        // Basic required fields for all automation levels
        const requiredFields = [
            "generalTrust1", "generalTrust2", "generalTrust3",
            "autoTrust1", "autoTrust2", "autoTrust3",
            "confidence1", "confidence2", "confidence3",
            "accuracyAndBias1", "accuracyAndBias2", "accuracyAndBias3", "accuracyAndBias4", "accuracyAndBias5", "accuracyAndBias6",
            "usefulness1", "usefulness2", "usefulness3",
        ];
        // Check if all required fields are filled
        const allFieldsFilled = requiredFields.every(field => {
            const value = values[field as keyof ResqueFormValues];
            return !!value && value.trim() !== "";
        });

        console.log("Form validation check:", {
            allFieldsFilled,
            hasErrors,
            automationLevel,
            requiredFields,
        });

        return allFieldsFilled && !hasErrors;
    };

    async function onSubmit(values: ResqueFormValues) {
        console.log("onSubmit function called with values:", values);
        try {
            const resqueItems: ResQueItem[] = Object.entries(values).map(([key, value]) => {
                // Map numeric values to ResQueLevel enum values
                let answerValue: ResQueLevel;

                switch (value) {
                    case "1":
                        answerValue = ResQueLevel.STRONGLY_DISAGREE;
                        break;
                    case "2":
                        answerValue = ResQueLevel.DISAGREE;
                        break;
                    case "3":
                        answerValue = ResQueLevel.NEUTRAL;
                        break;
                    case "4":
                        answerValue = ResQueLevel.AGREE;
                        break;
                    case "5":
                        answerValue = ResQueLevel.STRONGLY_AGREE;
                        break;
                    default:
                        answerValue = ResQueLevel.NEUTRAL;
                }

                return {
                    id: key,
                    question: questionMap[key as keyof typeof questionMap],
                    answer: answerValue
                };
            });

            await submitResque({ trialId, answers: resqueItems });
            setIsSubmitted(true);

            // Removed the redirect logic
        } catch (error) {
            console.error("Error submitting answers:", error);
            toast.error("Error submitting your answers. Please try again.");
        }
    }

    // Helper function to render Likert scale questions
    function renderLikertQuestion(
        name: keyof ResqueFormValues,
        question: string,
    ) {
        // Determine if this field is required based on automation level
        const isRequired = () => {
            // General fields are always required
            if (name.startsWith('generalTrust') ||
                name.startsWith('autoTrust') ||
                name.startsWith('confidence') ||
                name.startsWith('accuracy') ||
                name.startsWith('autoBias') ||
                name.startsWith('usefulness')) {
                return true;
            }
        };

        return (
            <FormField
                control={form.control}
                name={name}
                render={({ field }) => (
                    <FormItem className="space-y-3 mb-6">
                        <FormLabel className="text-base text-slate-300">
                            {question}
                            {isRequired() && <span className="text-red-500 ml-1">*</span>}
                        </FormLabel>
                        <FormControl>
                            <RadioGroup
                                onValueChange={(value) => {
                                    field.onChange(value);
                                    // Force re-evaluation of form validity
                                    isFormValid();
                                }}
                                defaultValue={field.value}
                                className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 justify-between"
                            >
                                <FormItem className="flex items-center space-x-2 hover:cursor-pointer group">
                                    <FormControl>
                                        <RadioGroupItem
                                            value="1"
                                            className={`h-5 w-5 ${field.value === "1" ? "bg-blue-500 border-blue-400" : "border-slate-500 group-hover:border-blue-300"} hover:cursor-pointer`}
                                        />
                                    </FormControl>
                                    <FormLabel className={`text-slate-400 ${field.value === "1" ? "font-medium text-blue-300" : "group-hover:text-slate-300"} hover:cursor-pointer`}>Strongly Disagree</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2 hover:cursor-pointer group">
                                    <FormControl>
                                        <RadioGroupItem
                                            value="2"
                                            className={`h-5 w-5 ${field.value === "2" ? "bg-blue-500 border-blue-400" : "border-slate-500 group-hover:border-blue-300"} hover:cursor-pointer`}
                                        />
                                    </FormControl>
                                    <FormLabel className={`text-slate-400 ${field.value === "2" ? "font-medium text-blue-300" : "group-hover:text-slate-300"} hover:cursor-pointer`}>Disagree</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2 hover:cursor-pointer group">
                                    <FormControl>
                                        <RadioGroupItem
                                            value="3"
                                            className={`h-5 w-5 ${field.value === "3" ? "bg-blue-500 border-blue-400" : "border-slate-500 group-hover:border-blue-300"} hover:cursor-pointer`}
                                        />
                                    </FormControl>
                                    <FormLabel className={`text-slate-400 ${field.value === "3" ? "font-medium text-blue-300" : "group-hover:text-slate-300"} hover:cursor-pointer`}>Neutral</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2 hover:cursor-pointer group">
                                    <FormControl>
                                        <RadioGroupItem
                                            value="4"
                                            className={`h-5 w-5 ${field.value === "4" ? "bg-blue-500 border-blue-400" : "border-slate-500 group-hover:border-blue-300"} hover:cursor-pointer`}
                                        />
                                    </FormControl>
                                    <FormLabel className={`text-slate-400 ${field.value === "4" ? "font-medium text-blue-300" : "group-hover:text-slate-300"} hover:cursor-pointer`}>Agree</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2 hover:cursor-pointer group">
                                    <FormControl>
                                        <RadioGroupItem
                                            value="5"
                                            className={`h-5 w-5 ${field.value === "5" ? "bg-blue-500 border-blue-400" : "border-slate-500 group-hover:border-blue-300"} hover:cursor-pointer`}
                                        />
                                    </FormControl>
                                    <FormLabel className={`text-slate-400 ${field.value === "5" ? "font-medium text-blue-300" : "group-hover:text-slate-300"} hover:cursor-pointer`}>Strongly Agree</FormLabel>
                                </FormItem>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage className="text-red-400" />
                    </FormItem>
                )}
            />
        );
    }


    // Main return statement with styled form
    return (
        <div className="max-w-7xl mx-auto p-12">
            {!isSubmitted ? (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, ease: easeInOut }}
                        className="mb-8"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <UserCircle2 className="h-6 w-6 text-blue-400" />
                            <h2 className="text-lg font-medium text-slate-200">
                                Post-Experience Questionnaire
                            </h2>
                        </div>

                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">
                                ResQue Questionnaire
                            </h1>
                            <p className="text-slate-400">
                                Please answer the following questions about your experience with the system.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, ease: easeInOut }}
                    >
                        <Form {...form}>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    console.log("Form submit event prevented");
                                    if (isFormValid()) {
                                        const values = form.getValues();
                                        onSubmit(values);
                                    } else {
                                        toast.error("Please complete all required questions");
                                    }
                                }}
                                className="space-y-8"
                            >
                                <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-lg">
                                    <h3 className="text-xl font-semibold text-blue-400 mb-4">
                                        General Trust in the System
                                    </h3>
                                    {renderLikertQuestion(
                                        "generalTrust1",
                                        questionMap.generalTrust1
                                    )}
                                    {renderLikertQuestion(
                                        "generalTrust2",
                                        questionMap.generalTrust2
                                    )}
                                    {renderLikertQuestion(
                                        "generalTrust3",
                                        questionMap.generalTrust3
                                    )}
                                </div>

                                <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-lg">
                                    <h3 className="text-xl font-semibold text-blue-400 mb-4">
                                        Automation-Specific Trust
                                    </h3>
                                    {renderLikertQuestion(
                                        "autoTrust1",
                                        questionMap.autoTrust1,
                                    )}
                                    {renderLikertQuestion(
                                        "autoTrust2",
                                        questionMap.autoTrust2,
                                    )}
                                    {renderLikertQuestion(
                                        "autoTrust3",
                                        questionMap.autoTrust3,
                                    )}
                                </div>

                                <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-lg">
                                    <h3 className="text-xl font-semibold text-blue-400 mb-4">
                                        Confidence and Reliance
                                    </h3>
                                    {renderLikertQuestion(
                                        "confidence1",
                                        questionMap.confidence1
                                    )}
                                    {renderLikertQuestion(
                                        "confidence2",
                                        questionMap.confidence2
                                    )}
                                    {renderLikertQuestion(
                                        "confidence3",
                                        questionMap.confidence3
                                    )}
                                </div>

                                <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-lg">
                                    <h3 className="text-xl font-semibold text-blue-400 mb-4">
                                        Perceived Accuracy and Bias
                                    </h3>
                                    {renderLikertQuestion(
                                        "accuracyAndBias1",
                                        questionMap.accuracyAndBias1
                                    )}
                                    {renderLikertQuestion(
                                        "accuracyAndBias2",
                                        questionMap.accuracyAndBias2
                                    )}
                                    {renderLikertQuestion(
                                        "accuracyAndBias3",
                                        questionMap.accuracyAndBias3
                                    )}
                                    {renderLikertQuestion(
                                        "accuracyAndBias4",
                                        questionMap.accuracyAndBias4
                                    )}
                                    {renderLikertQuestion(
                                        "accuracyAndBias5",
                                        questionMap.accuracyAndBias5
                                    )}
                                    {renderLikertQuestion(
                                        "accuracyAndBias6",
                                        questionMap.accuracyAndBias6
                                    )}
                                </div>

                                <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-lg">
                                    <h3 className="text-xl font-semibold text-blue-400 mb-4">
                                        Usefulness
                                    </h3>
                                    {renderLikertQuestion(
                                        "usefulness1",
                                        questionMap.usefulness1
                                    )}
                                    {renderLikertQuestion(
                                        "usefulness2",
                                        questionMap.usefulness2
                                    )}
                                    {renderLikertQuestion(
                                        "usefulness3",
                                        questionMap.usefulness3
                                    )}
                                </div>

                                <motion.div
                                    whileHover={{ scale: form.formState.isValid ? 1.02 : 1 }}
                                    whileTap={{ scale: form.formState.isValid ? 0.98 : 1 }}
                                    className="flex justify-center mt-8"
                                >
                                    <Button
                                        type="submit"
                                        disabled={!isFormValid()}
                                        className={`text-white text-base p-6 rounded-lg 
                                  transition-colors duration-300 ease-in-out
                                  shadow-md shadow-blue-500/10
                                  w-full max-w-md ${isFormValid()
                                                ? "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 hover:cursor-pointer hover:shadow-lg hover:shadow-blue-500/20"
                                                : "bg-slate-700 cursor-not-allowed opacity-50"}`}
                                    >
                                        {isFormValid() ? "Submit Feedback" : "Please complete all questions"}
                                    </Button>
                                </motion.div>
                            </form>
                        </Form>
                    </motion.div>
                </>
            ) : (
                <ResqueFinished accuracy={accuracy} />
            )}
        </div>
    );
}

export const ResqueFinished = ({ accuracy }: { accuracy?: number }) => {
    const [currentScreen, setCurrentScreen] = useState(0);

    const screens = [
        // Screen 1: Completion and Accuracy
        {
            content: (
                <motion.div
                    className="flex flex-col items-center justify-center"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        <CheckCircle2 className="h-24 w-24 text-green-500" strokeWidth={1.5} />
                    </motion.div>
                    <motion.h2
                        className="text-2xl font-bold text-white mt-6"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.3 }}
                    >
                        Thank you for your submission!
                    </motion.h2>
                    {accuracy !== undefined && (
                        <motion.div
                            className="mt-6 p-8 bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.4 }}
                        >
                            <h3 className="text-xl font-semibold text-blue-400 mb-4">Your Performance</h3>
                            <div className="flex items-center justify-center">
                                <motion.div
                                    className="relative w-40 h-40"
                                    initial={{ rotate: -90 }}
                                    animate={{ rotate: 0 }}
                                    transition={{ delay: 0.8, duration: 0.6, type: "spring" }}
                                >
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <motion.span
                                            className="text-4xl font-bold text-white"
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 1.2, duration: 0.3 }}
                                        >
                                            {Math.round(accuracy * 100)}%
                                        </motion.span>
                                    </div>
                                    <svg className="transform -rotate-90 w-40 h-40">
                                        <circle
                                            cx="80"
                                            cy="80"
                                            r="70"
                                            className="stroke-slate-700/30"
                                            strokeWidth="8"
                                            fill="transparent"
                                        />
                                        <motion.circle
                                            cx="80"
                                            cy="80"
                                            r="70"
                                            className="stroke-blue-500"
                                            strokeWidth="8"
                                            fill="transparent"
                                            strokeDasharray={`${accuracy * 440} 440`}
                                            initial={{ pathLength: 0 }}
                                            animate={{ pathLength: accuracy }}
                                            transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
                                        />
                                    </svg>
                                </motion.div>
                            </div>
                            <motion.p
                                className="text-slate-400 text-center mt-6"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.4, duration: 0.3 }}
                            >
                                This represents your accuracy in identifying outlier images during the trial.
                            </motion.p>
                        </motion.div>
                    )}
                </motion.div>
            )
        },
        // Screen 2: Study Information
        {
            content: (
                <motion.div
                    className="flex flex-col items-center justify-center h-full max-h-[calc(100vh-160px)]"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                >
                    <motion.h2
                        className="text-3xl font-bold text-white mb-8"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        About the System
                    </motion.h2>
                    <motion.div
                        className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-8 w-full max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/30"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.3 }}
                        >
                            <h3 className="text-xl font-semibold text-blue-400 mb-4">System Objectives</h3>
                            <div className="space-y-3">
                                <p className="text-slate-300 leading-relaxed">
                                    The system is designed to help operators identify outliers in a set of images.
                                </p>
                                <ul className="list-disc list-inside space-y-2 text-slate-300 pl-4">
                                    <li className="leading-relaxed">
                                        Analyze patterns of misuse due to overreliance and disuse, when operators fail to detect erroneous system recommendations across different automation levels
                                    </li>
                                    <li className="leading-relaxed">
                                        Define boundaries where automation enhances or detracts from decision-making
                                    </li>
                                    <li className="leading-relaxed">
                                        Investigate the correlation between operator trust and system performance, especially focusing on accuracy
                                    </li>
                                </ul>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6, duration: 0.3 }}
                            className="mt-8"
                        >
                            <h3 className="text-xl font-semibold text-blue-400 mb-4">System Configurations</h3>
                            <div className="space-y-4">
                                <div className="bg-slate-800/50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="flex gap-1.5">
                                            {[1, 2, 3, 4].map((dot) => (
                                                <div key={dot} className="h-2 w-2 rounded-full bg-slate-700" />
                                            ))}
                                        </div>
                                        <span className="text-white font-medium">{automationLevels[0].label}</span>
                                    </div>
                                    <p className="text-slate-300 text-sm leading-relaxed">
                                        {automationLevels[0].popoverContent.description}
                                    </p>
                                </div>

                                <div className="bg-slate-800/50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="flex gap-1.5">
                                            {[1].map((dot) => (
                                                <div key={dot} className="h-2 w-2 rounded-full bg-blue-500" />
                                            ))}
                                            {[2, 3, 4].map((dot) => (
                                                <div key={dot} className="h-2 w-2 rounded-full bg-slate-700" />
                                            ))}
                                        </div>
                                        <span className="text-white font-medium">{automationLevels[1].label}</span>
                                    </div>
                                    <p className="text-slate-300 text-sm leading-relaxed">
                                        {automationLevels[1].popoverContent.description}
                                    </p>
                                </div>

                                <div className="bg-slate-800/50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="flex gap-1.5">
                                            {[1, 2].map((dot) => (
                                                <div key={dot} className="h-2 w-2 rounded-full bg-blue-500" />
                                            ))}
                                            {[3, 4].map((dot) => (
                                                <div key={dot} className="h-2 w-2 rounded-full bg-slate-700" />
                                            ))}
                                        </div>
                                        <span className="text-white font-medium">{automationLevels[2].label}</span>
                                    </div>
                                    <p className="text-slate-300 text-sm leading-relaxed">
                                        {automationLevels[2].popoverContent.description}
                                    </p>
                                </div>

                                <div className="bg-slate-800/50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="flex gap-1.5">
                                            {[1, 2, 3].map((dot) => (
                                                <div key={dot} className="h-2 w-2 rounded-full bg-blue-500" />
                                            ))}
                                            {[4].map((dot) => (
                                                <div key={dot} className="h-2 w-2 rounded-full bg-slate-700" />
                                            ))}
                                        </div>
                                        <span className="text-white font-medium">{automationLevels[3].label}</span>
                                    </div>
                                    <p className="text-slate-300 text-sm leading-relaxed">
                                        {automationLevels[3].popoverContent.description}
                                    </p>
                                </div>

                                <div className="bg-slate-800/50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="flex gap-1.5">
                                            {[1, 2, 3, 4].map((dot) => (
                                                <div key={dot} className="h-2 w-2 rounded-full bg-blue-500" />
                                            ))}
                                        </div>
                                        <span className="text-white font-medium">{automationLevels[4].label}</span>
                                    </div>
                                    <p className="text-slate-300 text-sm leading-relaxed">
                                        {automationLevels[4].popoverContent.description}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </motion.div>
            )
        }
    ];

    return (
        <div className="flex flex-col items-center min-h-screen relative px-4">
            {/* Main Content with Scroll Container */}
            <div className="w-full overflow-y-auto">
                {screens[currentScreen].content}
            </div>

            {/* Fixed Navigation Controls */}
            <motion.div
                className="fixed bottom-8 left-1/2 -translate-x-1/2 flex justify-center items-center space-x-6 bg-gradient-to-t from-black/50 to-transparent py-4 px-8 rounded-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.3 }}
            >
                <motion.button
                    onClick={() => setCurrentScreen(prev => Math.max(0, prev - 1))}
                    disabled={currentScreen === 0}
                    className="text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <ChevronLeft className="h-8 w-8" />
                </motion.button>
                <div className="flex space-x-3">
                    {screens.map((_, index) => (
                        <motion.div
                            key={index}
                            className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${index === currentScreen ? 'bg-blue-500' : 'bg-slate-600/50'
                                }`}
                            whileHover={{ scale: 1.2 }}
                            onClick={() => setCurrentScreen(index)}
                            style={{ cursor: 'pointer' }}
                        />
                    ))}
                </div>
                <motion.button
                    onClick={() => setCurrentScreen(prev => Math.min(screens.length - 1, prev + 1))}
                    disabled={currentScreen === screens.length - 1}
                    className="text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <ChevronRight className="h-8 w-8" />
                </motion.button>
            </motion.div>
        </div>
    );
};
