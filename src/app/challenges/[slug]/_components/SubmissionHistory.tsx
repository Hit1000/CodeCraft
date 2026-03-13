"use client";

import { CheckCircle2, XCircle, Clock, Code2 } from "lucide-react";

interface Submission {
  _id: string;
  _creationTime: number;
  status: string;
  language: string;
  runtime: number;
  memory: number;
  testCasesPassed: number;
  totalTestCases: number;
  code: string;
}

interface SubmissionHistoryProps {
  submissions: Submission[];
  onLoadCode: (code: string, language: string) => void;
}

export default function SubmissionHistory({ submissions, onLoadCode }: SubmissionHistoryProps) {
  if (submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 text-gray-500">
        <Code2 className="w-10 h-10 mb-3 text-gray-700" />
        <p className="text-sm">No submissions yet</p>
        <p className="text-xs text-gray-600 mt-1">Write and submit your solution to see results here</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full">
      <table className="w-full">
        <thead className="sticky top-0 bg-gray-950/95 backdrop-blur-sm">
          <tr className="text-[10px] uppercase tracking-wider text-gray-500 border-b border-gray-800/50">
            <th className="text-left px-4 py-2.5 font-medium">Status</th>
            <th className="text-left px-4 py-2.5 font-medium">Language</th>
            <th className="text-left px-4 py-2.5 font-medium">Runtime</th>
            <th className="text-left px-4 py-2.5 font-medium">Memory</th>
            <th className="text-left px-4 py-2.5 font-medium">Tests</th>
            <th className="text-left px-4 py-2.5 font-medium">Time</th>
            <th className="text-right px-4 py-2.5 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((sub) => (
            <tr
              key={sub._id}
              className="border-b border-gray-800/20 hover:bg-gray-800/20 transition-colors"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  {sub.status === "Accepted" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400" />
                  )}
                  <span
                    className={`text-xs font-medium ${
                      sub.status === "Accepted" ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {sub.status}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="text-xs text-gray-400 capitalize">{sub.language}</span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  {sub.runtime}ms
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="text-xs text-gray-400">{sub.memory.toFixed(1)}MB</span>
              </td>
              <td className="px-4 py-3">
                <span className="text-xs text-gray-400">
                  {sub.testCasesPassed}/{sub.totalTestCases}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="text-xs text-gray-500">
                  {new Date(sub._creationTime).toLocaleDateString()}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => onLoadCode(sub.code, sub.language)}
                  className="text-xs text-blue-400/70 hover:text-blue-400 transition-colors"
                >
                  Load
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
