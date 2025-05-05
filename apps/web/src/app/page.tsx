"use client";

import {
  UserCircle2,
  CircleDot,
  ListFilter,
  CheckCircle2,
  Timer,
  ChevronLeft,
} from "lucide-react";
import { motion, easeInOut } from "framer-motion";
import { useRouter } from "next/navigation";

export default function Main() {
  const router = useRouter();
  const automationLevels = [
    {
      label: "Level of Automation 1: Fully Manual Classification",
      route: "/loa1",
      description: "Find the outlier emotion independently, without any system assistance.",
      icon: UserCircle2,
      automationLevel: 1,
    },
    {
      label: "Level of Automation 2: Assisted Classification",
      route: "/loa2",
      description: "System recommends possible outliers while you make the final decision.",
      icon: CircleDot,
      automationLevel: 2,
    },
    {
      label: "Level of Automation 3: Ranked Classification",
      route: "/loa3",
      description: "Choose from a system-generated ranked list of potential outliers.",
      icon: ListFilter,
      automationLevel: 3,
    },
    {
      label: "Level of Automation 4-5: Ranked / Validated Classification",
      route: "/loa4-5",
      description: "Review and confirm the system's pre-selected outlier choice.",
      icon: CheckCircle2,
      automationLevel: 4,
    },
    {
      label: "Level of Automation 6: Automated Classification with Veto",
      route: "/loa6",
      description: "System identifies the outlier with option for quick override.",
      icon: Timer,
      automationLevel: 5,
    },
  ];

  const renderAutomationDots = (level: number) => {
    return (
      <div className="flex gap-1.5">
        {[2, 3, 4, 5].map((dot) => (
          <div
            key={dot}
            className={`h-2 w-2 rounded-full ${dot <= level
              ? 'bg-blue-500'
              : 'bg-slate-700'
              }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="relative max-w-3xl mx-auto p-8 space-y-2 mt-8">

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: easeInOut }}
        className="text-center flex flex-col items-center justify-center gap-2"
      >
        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 py-1">
          Find the Outlier Image
        </h1>
        <p className="text-slate-400 text-xl max-w-2xl mx-auto">
          Choose how you'd like to identify the outlier emotion among the image sets based on the level of automation.
        </p>
      </motion.div>

      {/* Automation Levels Container */}
      <div className="space-y-4 pt-8">
        {automationLevels.map((level, index) => {
          const Icon = level.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                delay: 0.15 + index * 0.1,
                duration: 0.35,
                ease: easeInOut
              }}
              className="group relative bg-white/[0.03] backdrop-blur-sm rounded-xl overflow-hidden border border-slate-800/30 hover:border-blue-300/50 transition-all duration-500 hover:cursor-pointer hover:scale-[1.005]"
              onClick={() => router.push(level.route)}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Icon className="h-6 w-6 text-blue-400" />
                    <div className="flex flex-col gap-1">
                      <div className="text-sm font-medium text-slate-400">
                        System Assistance
                      </div>
                      {renderAutomationDots(level.automationLevel)}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div
                    className="w-full bg-slate-800/30 group-hover:bg-slate-700/30 text-white text-lg py-6 px-6 rounded-lg transition-all duration-300 text-left"
                  >
                    {level.label.split(":")[0]}
                    <span className="block text-sm text-slate-400 font-normal mt-1">
                      {level.label.split(":")[1]}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm pl-1">
                    {level.description}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}