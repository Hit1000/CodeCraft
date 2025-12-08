"use client";

import { useEffect } from "react";
import { getExecutionResult, useCodeEditorStore } from "@/store/useCodeEditorStore";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import toast from "react-hot-toast";

export default function KeyboardShortcuts() {
  const { user } = useUser();
  const { runCode, language, isRunning } = useCodeEditorStore();
  const saveExecution = useMutation(api.codeExecutions.saveExecution);

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // Check for Ctrl+Enter (or Cmd+Enter on Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (!isRunning) {
          // Execute the same logic as RunButton's handleRun
          await runCode();
          const result = getExecutionResult();

          // Show toast notification
          if (result) {
            if (result.error) {
              toast.error("Error executing code", {
                duration: 4000,
                style: {
                  background: '#1e1e2e',
                  color: '#fff',
                  border: '1px solid #ef4444',
                },
              });
            } else {
              toast.success("Code executed successfully!", {
                duration: 3000,
                style: {
                  background: '#1e1e2e',
                  color: '#fff',
                  border: '1px solid #10b981',
                },
              });
            }
          }

          if (user && result) {
            await saveExecution({
              language,
              code: result.code,
              output: result.output || undefined,
              error: result.error || undefined,
            });
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRunning, runCode, language, user, saveExecution]);

  return null; // This component doesn't render anything
}
