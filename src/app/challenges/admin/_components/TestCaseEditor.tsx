"use client";

import { useState } from "react";
import { Trash2, Plus, ToggleLeft, ToggleRight } from "lucide-react";

interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

interface TestCaseEditorProps {
  testCases: TestCase[];
  onChange: (testCases: TestCase[]) => void;
}

export default function TestCaseEditor({ testCases, onChange }: TestCaseEditorProps) {
  const addTestCase = () => {
    const newId = `tc${testCases.length + 1}`;
    onChange([
      ...testCases,
      { id: newId, input: "", expectedOutput: "", isHidden: false },
    ]);
  };

  const removeTestCase = (index: number) => {
    onChange(testCases.filter((_, i) => i !== index));
  };

  const updateTestCase = (index: number, field: keyof TestCase, value: string | boolean) => {
    const updated = [...testCases];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Test Cases ({testCases.length})</h3>
        <button
          onClick={addTestCase}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Test Case
        </button>
      </div>

      <div className="space-y-3">
        {testCases.map((tc, index) => (
          <div
            key={tc.id}
            className={`rounded-xl border p-4 space-y-3 ${
              tc.isHidden
                ? "border-amber-500/30 bg-amber-500/5"
                : "border-gray-700/50 bg-gray-800/30"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-gray-400">{tc.id}</span>
                <button
                  onClick={() => updateTestCase(index, "isHidden", !tc.isHidden)}
                  className="flex items-center gap-1.5 text-xs"
                >
                  {tc.isHidden ? (
                    <>
                      <ToggleRight className="w-4 h-4 text-amber-400" />
                      <span className="text-amber-400">Hidden</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-500">Visible</span>
                    </>
                  )}
                </button>
              </div>
              <button
                onClick={() => removeTestCase(index)}
                className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Input
                </label>
                <textarea
                  value={tc.input}
                  onChange={(e) => updateTestCase(index, "input", e.target.value)}
                  placeholder='e.g. [2,7,11,15], 9 (comma-separated args)'
                  className="w-full bg-gray-900/60 border border-gray-700/50 rounded-lg px-3 py-2 text-sm text-white font-mono placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 resize-none"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Expected Output
                </label>
                <textarea
                  value={tc.expectedOutput}
                  onChange={(e) => updateTestCase(index, "expectedOutput", e.target.value)}
                  placeholder='e.g. [0,1]'
                  className="w-full bg-gray-900/60 border border-gray-700/50 rounded-lg px-3 py-2 text-sm text-white font-mono placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 resize-none"
                  rows={2}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {testCases.length === 0 && (
        <div className="text-center py-8 text-gray-500 text-sm">
          No test cases yet. Click &quot;Add Test Case&quot; to create one.
        </div>
      )}
    </div>
  );
}
