"use client";

import React from "react";
import { InfoIcon } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "./popover";

interface InfoPopoverProps {
    title: string;
    description: string;
    details?: string[];
    interaction?: string[];
    emotions?: string[];
}

export function InfoPopover({
    title,
    description,
    details,
    interaction,
    emotions,
}: InfoPopoverProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <button className="rounded-full flex items-center justify-center bg-black/20 hover:bg-black/30 p-2 transition-colors hover:cursor-pointer">
                    <InfoIcon className="h-4 w-4 text-blue-400" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-[350px] bg-slate-900 border border-slate-700 p-4 text-white shadow-md">
                <div className="space-y-3">
                    <h3 className="font-medium text-lg text-blue-300">{title}</h3>
                    <p className="text-sm text-slate-300">{description}</p>

                    {details && details.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="font-medium text-sm text-blue-200">Details</h4>
                            <ul className="space-y-1 text-xs text-slate-400">
                                {details.map((detail, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <span className="text-blue-400 mt-0.5">•</span>
                                        <span>{detail}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {interaction && interaction.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="font-medium text-sm text-blue-200">How to interact</h4>
                            <ul className="space-y-1 text-xs text-slate-400">
                                {interaction.map((step, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <span className="text-blue-400 mt-0.5">{index + 1}.</span>
                                        <span>{step}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {emotions && emotions.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="font-medium text-sm text-blue-200">Potential Emotions</h4>
                            <div className="flex flex-wrap gap-1">
                                {emotions.map((emotion, index) => (
                                    <span
                                        key={index}
                                        className="text-xs px-2 py-1 rounded-full bg-slate-700 text-slate-300"
                                    >
                                        {emotion}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
} 