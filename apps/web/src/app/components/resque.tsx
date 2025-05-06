"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { motion, easeInOut } from "framer-motion";
import { UserCircle2, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl, FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import {
    RadioGroup,
    RadioGroupItem,
} from "@/components/ui/radio-group";
import { AutomationLevel, ResQueLevel } from "@/backend/services/enums";
import { ResQueItem } from "@/backend/services/types";
import { submitResque } from "@/backend/services";
import { toast } from "sonner";

// Define form schema with validation
const formSchema = z.object({
    // General Trust
    generalTrust1: z.string().min(1, "Please answer this question"),
    generalTrust2: z.string().min(1, "Please answer this question"),
    generalTrust3: z.string().min(1, "Please answer this question"),

    // Automation-Specific Trust - these are conditionally required based on automation level
    autoTrust1: z.string().optional(),
    autoTrust2: z.string().optional(),
    autoTrust3: z.string().optional(),
    autoTrust4: z.string().optional(),

    // Confidence and Reliance
    confidence1: z.string().min(1, "Please answer this question"),
    confidence2: z.string().min(1, "Please answer this question"),
    confidence3: z.string().min(1, "Please answer this question"),

    // Perceived Accuracy and Bias
    accuracy1: z.string().min(1, "Please answer this question"),
    accuracy2: z.string().min(1, "Please answer this question"),
    accuracy3: z.string().min(1, "Please answer this question"),
}).refine((data) => {
    // Additional validation based on automation level
    return true;
}, {
    message: "Please complete all required questions",
    path: ["form"]
});

type ResqueFormValues = z.infer<typeof formSchema>;

type ResqueProps = {
    trialId: string;
    automationLevel: AutomationLevel;
};

// Map of questions for each field
const questionMap = {
    generalTrust1: "I felt confident that the system helped me identify the correct outlier image.",
    generalTrust2: "I trusted the system to make accurate decisions about which image was the outlier.",
    generalTrust3: "I felt comfortable relying on the system to assist me in this task.",

    autoTrust1: "The order in which the images were presented made it easier for me to trust the system's suggestions.",
    autoTrust2: "I trusted the system's preselected image to be the correct outlier.",
    autoTrust3: "I felt the system's locked choice was reliable, even if I didn't change it.",
    autoTrust4: "I preferred making the decision myself without the system's input because I didn't trust it to help.",

    confidence1: "I felt more certain of my choices when the system provided assistance.",
    confidence2: "I would rely on this system if I had to perform this task again.",
    confidence3: "The system's involvement made me question my own judgment less.",

    accuracy1: "I believe the system accurately identified the outlier most of the time.",
    accuracy2: "I found myself agreeing with the system's suggestions even when I wasn't sure they were correct.",
    accuracy3: "I felt pressured to accept the system's choice in this version.",

};

export function Resque({ trialId, automationLevel }: ResqueProps) {
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
            autoTrust4: "",
            confidence1: "",
            confidence2: "",
            confidence3: "",
            accuracy1: "",
            accuracy2: "",
            accuracy3: "",
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
            "confidence1", "confidence2", "confidence3",
            "accuracy1", "accuracy2", "accuracy3",
        ];

        // Add automation-specific fields
        let automationSpecificField = "";
        switch (automationLevel) {
            case AutomationLevel.LOA1:
                automationSpecificField = "autoTrust4";
                break;
            case AutomationLevel.LOA2:
                automationSpecificField = "autoTrust1";
                break;
            case AutomationLevel.LOA3:
                automationSpecificField = "autoTrust2";
                break;
            case AutomationLevel.LOA4_5:
                automationSpecificField = "autoTrust3";
                break;
        }

        if (automationSpecificField) {
            requiredFields.push(automationSpecificField);
        }

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
            automationSpecificField
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

            // Redirect after 3 seconds
            setTimeout(() => {
                router.push("/");
            }, 3000);
        } catch (error) {
            console.error("Error submitting answers:", error);
            toast.error("Error submitting your answers. Please try again.");
        }
    }

    // Helper function to render Likert scale questions
    function renderLikertQuestion(
        name: keyof ResqueFormValues,
        question: string,
        showFor?: AutomationLevel
    ) {
        // If showFor is specified, only show the question for that automation level
        if (showFor !== undefined && automationLevel !== showFor) {
            return null;
        }

        // Determine if this field is required based on automation level
        const isRequired = () => {
            // General fields are always required
            if (name.startsWith('generalTrust') ||
                name.startsWith('confidence') ||
                name.startsWith('accuracy')) {
                return true;
            }

            // Check automation-specific fields
            switch (name) {
                case 'autoTrust1':
                    return automationLevel === AutomationLevel.LOA2;
                case 'autoTrust2':
                    return automationLevel === AutomationLevel.LOA3;
                case 'autoTrust3':
                    return automationLevel === AutomationLevel.LOA4_5;
                case 'autoTrust4':
                    return automationLevel === AutomationLevel.LOA1;
                default:
                    return false;
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
        <div className="max-w-4xl mx-auto p-8">
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
                                        AutomationLevel.LOA2
                                    )}
                                    {renderLikertQuestion(
                                        "autoTrust2",
                                        questionMap.autoTrust2,
                                        AutomationLevel.LOA3
                                    )}
                                    {renderLikertQuestion(
                                        "autoTrust3",
                                        questionMap.autoTrust3,
                                        AutomationLevel.LOA4_5
                                    )}
                                    {renderLikertQuestion(
                                        "autoTrust4",
                                        questionMap.autoTrust4,
                                        AutomationLevel.LOA1
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
                                        "accuracy1",
                                        questionMap.accuracy1
                                    )}
                                    {renderLikertQuestion(
                                        "accuracy2",
                                        questionMap.accuracy2
                                    )}
                                    {renderLikertQuestion(
                                        "accuracy3",
                                        questionMap.accuracy3
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
                <motion.div
                    className="flex flex-col items-center justify-center h-[60vh]"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: easeInOut }}
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
                    <motion.p
                        className="text-slate-400 mt-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.3 }}
                    >
                        Redirecting you to the homepage...
                    </motion.p>
                </motion.div>
            )}
        </div>
    );
}
