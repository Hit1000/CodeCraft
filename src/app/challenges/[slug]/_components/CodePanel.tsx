"use client";

import { useChallengeStore } from "@/store/useChallengeStore";
import dynamic from "next/dynamic";
import { Play, Send, RotateCcw, ChevronDown } from "lucide-react";
import { useState, useRef } from "react";

const Editor = dynamic(() => import("@monaco-editor/react").then((mod) => mod.Editor), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-[#1e1e2e]/50">
      <div className="text-gray-500 text-sm">Loading editor...</div>
    </div>
  ),
});

interface CodePanelProps {
  starterCode: {
    python?: string;
    javascript?: string;
    typescript?: string;
    java?: string;
    cpp?: string;
  };
  onRun: (code: string, language: string) => void;
  onSubmit: (code: string, language: string) => void;
  isRunning: boolean;
  isSubmitting: boolean;
}

const languageOptions = [
  { id: "javascript", label: "JavaScript", monacoId: "javascript" },
  { id: "python", label: "Python", monacoId: "python" },
  { id: "typescript", label: "TypeScript", monacoId: "typescript" },
  { id: "java", label: "Java", monacoId: "java" },
  { id: "cpp", label: "C++", monacoId: "cpp" },
];

const MONACO_OPTIONS = {
  fontSize: 14,
  fontFamily: "var(--font-geist-mono), 'Fira Code', monospace",
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  padding: { top: 16, bottom: 16 },
  lineNumbersMinChars: 3,
  renderLineHighlight: "line" as const,
  cursorBlinking: "smooth" as const,
  smoothScrolling: true,
  contextmenu: true,
  automaticLayout: true,
  tabSize: 2,
  wordWrap: "on" as const,
};

export default function CodePanel({ starterCode, onRun, onSubmit, isRunning, isSubmitting }: CodePanelProps) {
  const { activeLanguage, setActiveLanguage, code, setCode } = useChallengeStore();
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const editorRef = useRef<unknown>(null);

  const availableLanguages = languageOptions.filter(
    (l) => starterCode[l.id as keyof typeof starterCode]
  );

  const currentLang = availableLanguages.find((l) => l.id === activeLanguage) ?? availableLanguages[0];

  const handleEditorMount = (editor: unknown) => {
    editorRef.current = editor;
    // Set initial code if empty
    if (!code) {
      const initial = starterCode[currentLang.id as keyof typeof starterCode] ?? "";
      setCode(initial);
    }
  };

  const handleLanguageChange = (langId: string) => {
    setActiveLanguage(langId);
    const newCode = starterCode[langId as keyof typeof starterCode] ?? "";
    setCode(newCode);
    setShowLangDropdown(false);
  };

  const handleReset = () => {
    const resetCode = starterCode[activeLanguage as keyof typeof starterCode] ?? "";
    setCode(resetCode);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800/50 bg-gray-900/50">
        {/* Language selector */}
        <div className="relative">
          <button
            onClick={() => setShowLangDropdown(!showLangDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/50 border border-gray-700/50 
              text-sm text-gray-300 hover:border-gray-600 transition-all"
          >
            {currentLang.label}
            <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
          </button>
          {showLangDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowLangDropdown(false)} />
              <div className="absolute top-full left-0 mt-1 z-20 bg-gray-900 border border-gray-700/50 rounded-lg shadow-xl overflow-hidden min-w-[140px]">
                {availableLanguages.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => handleLanguageChange(lang.id)}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                      lang.id === activeLanguage
                        ? "bg-blue-500/15 text-blue-400"
                        : "text-gray-400 hover:bg-gray-800 hover:text-gray-300"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800/50 transition-all"
            title="Reset to starter code"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => onRun(code, activeLanguage)}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800/50 border border-gray-700/50
              text-sm text-gray-300 hover:border-emerald-500/50 hover:text-emerald-400 hover:bg-emerald-500/10 
              transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-3.5 h-3.5" />
            {isRunning ? "Running..." : "Run"}
          </button>
          <button
            onClick={() => onSubmit(code, activeLanguage)}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 
              text-sm font-medium text-white hover:from-blue-500 hover:to-blue-400 
              transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" />
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={currentLang.monacoId}
          value={code}
          onChange={(val) => setCode(val ?? "")}
          onMount={handleEditorMount}
          theme="vs-dark"
          options={MONACO_OPTIONS}
        />
      </div>
    </div>
  );
}
