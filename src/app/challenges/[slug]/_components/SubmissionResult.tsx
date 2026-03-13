"use client";

import { CheckCircle2, XCircle, Clock, Cpu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SubmissionResultProps {
  result: {
    status: string;
    runtime: number;
    memory: number;
    testCasesPassed: number;
    totalTestCases: number;
    errorMessage?: string;
  } | null;
  show: boolean;
  onClose: () => void;
}

const statusConfig: Record<string, { color: string; bg: string; icon: "check" | "x" }> = {
  Accepted: { color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/30", icon: "check" },
  "Wrong Answer": { color: "text-rose-400", bg: "bg-rose-500/15 border-rose-500/30", icon: "x" },
  "Runtime Error": { color: "text-orange-400", bg: "bg-orange-500/15 border-orange-500/30", icon: "x" },
  "Time Limit Exceeded": { color: "text-amber-400", bg: "bg-amber-500/15 border-amber-500/30", icon: "x" },
  "Compilation Error": { color: "text-red-400", bg: "bg-red-500/15 border-red-500/30", icon: "x" },
};

export default function SubmissionResult({ result, show, onClose }: SubmissionResultProps) {
  if (!result) return null;

  const config = statusConfig[result.status] ?? statusConfig["Wrong Answer"];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className={`absolute bottom-0 left-0 right-0 z-20 border-t ${config.bg} backdrop-blur-xl rounded-t-xl`}
        >
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {config.icon === "check" ? (
                  <CheckCircle2 className={`w-6 h-6 ${config.color}`} />
                ) : (
                  <XCircle className={`w-6 h-6 ${config.color}`} />
                )}
                <div>
                  <h3 className={`text-lg font-bold ${config.color}`}>{result.status}</h3>
                  <p className="text-xs text-gray-500">
                    {result.testCasesPassed}/{result.totalTestCases} test cases passed
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-gray-800/50 text-gray-500 hover:text-gray-300 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stats */}
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <div>
                  <span className="text-sm font-medium text-gray-300">{result.runtime}ms</span>
                  <span className="text-[10px] text-gray-600 ml-1">Runtime</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-gray-500" />
                <div>
                  <span className="text-sm font-medium text-gray-300">{result.memory.toFixed(1)}MB</span>
                  <span className="text-[10px] text-gray-600 ml-1">Memory</span>
                </div>
              </div>
            </div>

            {/* Error message */}
            {result.errorMessage && (
              <div className="mt-3 p-3 rounded-lg bg-gray-900/50 border border-gray-800/50">
                <pre className="text-xs text-rose-400 font-mono whitespace-pre-wrap">{result.errorMessage}</pre>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
