"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Eye, EyeOff, Clock } from "lucide-react";

interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

interface TestResult {
  id: string;
  passed: boolean;
  input: string;
  expected: string;
  actual: string;
  runtime: number;
  isHidden: boolean;
}

interface TestCasePanelProps {
  testCases: TestCase[];
  testResults: TestResult[];
  isRunning: boolean;
}

export default function TestCasePanel({ testCases, testResults, isRunning }: TestCasePanelProps) {
  const [activeTestCase, setActiveTestCase] = useState(0);

  const visibleTests = testCases.filter((tc) => !tc.isHidden);
  const current = visibleTests[activeTestCase];
  const currentResult = testResults.find((r) => r.id === current?.id);

  const passedCount = testResults.filter((r) => r.passed).length;
  const totalTests = testResults.length;

  return (
    <div className="flex flex-col h-full bg-gray-950/50">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800/50">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="font-medium">Test Cases</span>
          {testResults.length > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
              passedCount === totalTests
                ? "bg-emerald-500/15 text-emerald-400"
                : "bg-rose-500/15 text-rose-400"
            }`}>
              {passedCount}/{totalTests} passed
            </span>
          )}
        </div>
        {isRunning && (
          <div className="flex items-center gap-1.5 text-xs text-amber-400">
            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
            Running tests...
          </div>
        )}
      </div>

      {/* Test case tabs */}
      <div className="flex items-center gap-1 px-3 py-1.5 border-b border-gray-800/30 overflow-x-auto">
        {visibleTests.map((tc, i) => {
          const result = testResults.find((r) => r.id === tc.id);
          return (
            <button
              key={tc.id}
              onClick={() => setActiveTestCase(i)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeTestCase === i
                  ? "bg-gray-800/70 text-white border border-gray-700/50"
                  : "text-gray-500 hover:text-gray-300 hover:bg-gray-800/30 border border-transparent"
              }`}
            >
              {result ? (
                result.passed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                )
              ) : null}
              Case {i + 1}
            </button>
          );
        })}
      </div>

      {/* Test case content */}
      {current && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Input */}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-gray-500 font-medium mb-1 block">
              Input
            </label>
            <div className="bg-gray-900/80 rounded-lg p-3 border border-gray-800/30">
              {current.isHidden ? (
                <div className="flex items-center gap-2 text-gray-600 text-xs">
                  <EyeOff className="w-3.5 h-3.5" />
                  Hidden
                </div>
              ) : (
                <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap">{current.input}</pre>
              )}
            </div>
          </div>

          {/* Expected Output */}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-gray-500 font-medium mb-1 block">
              Expected Output
            </label>
            <div className="bg-gray-900/80 rounded-lg p-3 border border-gray-800/30">
              {current.isHidden ? (
                <div className="flex items-center gap-2 text-gray-600 text-xs">
                  <EyeOff className="w-3.5 h-3.5" />
                  Hidden
                </div>
              ) : (
                <pre className="text-xs text-emerald-400 font-mono whitespace-pre-wrap">{current.expectedOutput}</pre>
              )}
            </div>
          </div>

          {/* Actual Output (if result exists) */}
          {currentResult && (
            <>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-gray-500 font-medium mb-1 block">
                  Your Output
                </label>
                <div className={`bg-gray-900/80 rounded-lg p-3 border ${
                  currentResult.passed ? "border-emerald-500/20" : "border-rose-500/20"
                }`}>
                  {currentResult.isHidden ? (
                    <div className="flex items-center gap-2 text-gray-600 text-xs">
                      <Eye className="w-3.5 h-3.5" />
                      {currentResult.passed ? "✓ Passed" : "✗ Failed"}
                    </div>
                  ) : (
                    <pre className={`text-xs font-mono whitespace-pre-wrap ${
                      currentResult.passed ? "text-emerald-400" : "text-rose-400"
                    }`}>
                      {currentResult.actual}
                    </pre>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-gray-500">
                <Clock className="w-3 h-3" />
                {currentResult.runtime}ms
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
