"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Lightbulb, BookOpen } from "lucide-react";

interface ProblemDescriptionProps {
  challenge: {
    title: string;
    description: string;
    examples: { input: string; output: string; explanation?: string }[];
    constraints: string[];
    hints: string[];
    editorial?: string;
    category: string;
    subcategory: string;
    tags: string[];
    timeLimit: number;
    memoryLimit: number;
    acceptanceRate: number;
    totalSubmissions: number;
    likes: number;
    dislikes: number;
  };
}

export default function ProblemDescription({ challenge }: ProblemDescriptionProps) {
  const [showHints, setShowHints] = useState(false);
  const [revealedHints, setRevealedHints] = useState<Set<number>>(new Set());
  const [showEditorial, setShowEditorial] = useState(false);

  const toggleHint = (index: number) => {
    const next = new Set(revealedHints);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setRevealedHints(next);
  };

  return (
    <div className="h-full overflow-y-auto p-5 space-y-6 custom-scrollbar">
      {/* Description */}
      <div className="prose prose-invert prose-sm max-w-none">
        <div
          className="text-gray-300 leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: challenge.description
              .replace(/## /g, '<h2 class="text-lg font-bold text-white mt-4 mb-2">')
              .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
              .replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 rounded bg-gray-800 text-blue-400 text-xs font-mono">$1</code>')
              .replace(/\n/g, "<br/>"),
          }}
        />
      </div>

      {/* Examples */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-300">Examples</h3>
        {challenge.examples.map((ex, i) => (
          <div key={i} className="rounded-xl bg-gray-800/40 border border-gray-700/40 p-4 space-y-2">
            <div className="text-xs font-medium text-gray-500 mb-2">Example {i + 1}</div>
            <div className="space-y-1">
              <div className="flex gap-2">
                <span className="text-xs text-gray-500 w-14 flex-shrink-0">Input:</span>
                <code className="text-xs text-gray-300 font-mono">{ex.input}</code>
              </div>
              <div className="flex gap-2">
                <span className="text-xs text-gray-500 w-14 flex-shrink-0">Output:</span>
                <code className="text-xs text-emerald-400 font-mono">{ex.output}</code>
              </div>
              {ex.explanation && (
                <div className="flex gap-2 mt-2 pt-2 border-t border-gray-700/30">
                  <span className="text-xs text-gray-500 w-14 flex-shrink-0">Note:</span>
                  <span className="text-xs text-gray-400">{ex.explanation}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Constraints */}
      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-2">Constraints</h3>
        <ul className="space-y-1">
          {challenge.constraints.map((c, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
              <span className="text-blue-500 mt-0.5">•</span>
              <code className="font-mono">{c}</code>
            </li>
          ))}
        </ul>
      </div>

      {/* Meta info */}
      <div className="flex flex-wrap gap-3 text-[11px] text-gray-500">
        <span className="px-2 py-1 rounded-md bg-gray-800/50 border border-gray-700/30">
          ⏱ {challenge.timeLimit / 1000}s
        </span>
        <span className="px-2 py-1 rounded-md bg-gray-800/50 border border-gray-700/30">
          💾 {challenge.memoryLimit}MB
        </span>
        <span className="px-2 py-1 rounded-md bg-gray-800/50 border border-gray-700/30">
          ✅ {challenge.acceptanceRate}%
        </span>
      </div>

      {/* Hints */}
      {challenge.hints.length > 0 && (
        <div>
          <button
            onClick={() => setShowHints(!showHints)}
            className="flex items-center gap-2 text-sm font-medium text-amber-400/80 hover:text-amber-400 transition-colors"
          >
            <Lightbulb className="w-4 h-4" />
            Hints ({challenge.hints.length})
            {showHints ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
          {showHints && (
            <div className="mt-2 space-y-2">
              {challenge.hints.map((hint, i) => (
                <div key={i}>
                  <button
                    onClick={() => toggleHint(i)}
                    className="text-xs text-gray-500 hover:text-gray-400 transition-colors"
                  >
                    {revealedHints.has(i) ? `▾ Hint ${i + 1}` : `▸ Click to reveal Hint ${i + 1}`}
                  </button>
                  {revealedHints.has(i) && (
                    <p className="text-xs text-gray-400 mt-1 pl-3 border-l-2 border-amber-500/30">
                      {hint}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Editorial */}
      {challenge.editorial && (
        <div>
          <button
            onClick={() => setShowEditorial(!showEditorial)}
            className="flex items-center gap-2 text-sm font-medium text-purple-400/80 hover:text-purple-400 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Editorial
            {showEditorial ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
          {showEditorial && (
            <div
              className="mt-3 text-xs text-gray-300 leading-relaxed prose prose-invert prose-sm max-w-none p-4 rounded-xl bg-gray-800/30 border border-gray-700/30"
              dangerouslySetInnerHTML={{
                __html: challenge.editorial
                  .replace(/## (.*?)(\n|$)/g, '<h3 class="text-sm font-semibold text-white mt-3 mb-1">$1</h3>')
                  .replace(/### (.*?)(\n|$)/g, '<h4 class="text-xs font-semibold text-gray-300 mt-2 mb-1">$1</h4>')
                  .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
                  .replace(/`{3}(\w+)?\n([\s\S]*?)`{3}/g, '<pre class="bg-gray-900 rounded-lg p-3 my-2 overflow-x-auto"><code class="text-xs font-mono text-gray-300">$2</code></pre>')
                  .replace(/`(.*?)`/g, '<code class="px-1 py-0.5 rounded bg-gray-800 text-blue-400 text-xs font-mono">$1</code>')
                  .replace(/\n/g, "<br/>"),
              }}
            />
          )}
        </div>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 pt-4 border-t border-gray-800/50">
        {challenge.tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 rounded-md bg-blue-500/8 text-[10px] font-medium text-blue-400/70 border border-blue-500/10"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
