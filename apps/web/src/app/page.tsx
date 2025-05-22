"use client";

import { InfoPopover } from "@/components/ui/info-popover";
import { motion, easeInOut } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { automationLevels } from "@/app/data";

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

export default function Main() {
  const router = useRouter();

  const handleTrialRedirect = () => {
    router.push("/trial");
  };

  return (
    <div className="relative max-w-3xl mx-auto p-8 space-y-2 min-h-screen flex flex-col justify-center overflow-hidden h-screen">

      {/* Header Section */}
      <div className="-translate-y-24">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, ease: easeInOut }}
          className="text-center flex flex-col items-center justify-center gap-2 mb-12"
        >
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 py-1">
            Find the Outlier Image
          </h1>
          <p className="text-slate-400 text-xl max-w-2xl mx-auto">
            Click start trial button to begin identifying the outlier emotion among the set of images based on the level of automation.
          </p>
        </motion.div>

        {/* Prominent Trial Button */}
        <div className="sticky top-4 z-10 flex justify-center my-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.2,
              duration: 0.4,
              ease: easeInOut
            }}
          >
            <Button
              onClick={handleTrialRedirect}
              className="bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold px-12 py-6 rounded-md text-xl hover:from-blue-700 hover:to-blue-600 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(59,130,246,0.3)] transition-all duration-300 hover:cursor-pointer hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm"
              size="lg"
            >
              Start Trial →
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Automation Levels Container */}
      {/* <div className="space-y-4 pt-2">
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
              className="group relative bg-white/[0.03] backdrop-blur-sm rounded-xl overflow-hidden border border-slate-800/30 transition-all duration-500"
            >

              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-transparent opacity-0 transition-opacity duration-300" />
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
                  <InfoPopover
                    title={level.popoverContent.title}
                    description={level.popoverContent.description}
                    details={level.popoverContent.details}
                    interaction={level.popoverContent.interaction}
                    emotions={["Anger", "Fear", "Happiness", "Sadness", "Surprise", "Neutral"]}
                  />
                </div>

                <div className="space-y-3">
                  <div
                    className="w-full bg-slate-800/30 text-white text-lg py-6 px-6 rounded-lg transition-all duration-300 text-left"
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
      </div> */}
    </div>
  );
}