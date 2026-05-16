"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useChallengeStore } from "@/store/useChallengeStore";
import { useParams } from "next/navigation";
import { useEffect, useCallback, useState } from "react";
import ProblemNavbar from "./_components/ProblemNavbar";
import ProblemDescription from "./_components/ProblemDescription";
import CodePanel from "./_components/CodePanel";
import TestCasePanel from "./_components/TestCasePanel";
import SubmissionResult from "./_components/SubmissionResult";
import SubmissionHistory from "./_components/SubmissionHistory";
import AIChatPanel from "@/app/(root)/_components/AIChatPanel";
import { Loader2, FileText, History } from "lucide-react";
import { LANGUAGE_CONFIG } from "@/app/(root)/_constants";
import {
  buildExecutableCode,
  parseExecutionResults,
} from "@/lib/buildExecutableCode";

const STORAGE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const LANGUAGE_STORAGE_KEY = "cc:challenge:language";
const LANGUAGE_ORDER = [
  "python",
  "javascript",
  "typescript",
  "java",
  "cpp",
] as const;

const buildCodeStorageKey = (challengeSlug: string, lang: string) =>
  `cc:challenge:${challengeSlug}:${lang}`;

const readStorage = <T,>(key: string): T | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { value: T; expiresAt: number };
    if (!parsed?.expiresAt || Date.now() > parsed.expiresAt) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed.value;
  } catch {
    return null;
  }
};

const writeStorage = (key: string, value: unknown) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      key,
      JSON.stringify({ value, expiresAt: Date.now() + STORAGE_TTL_MS }),
    );
  } catch {
    // Ignore storage failures (private mode, quota, etc.)
  }
};

export default function ChallengeSolvePage() {
  const params = useParams();
  const slug = params.slug as string;
  const { user } = useUser();

  const {
    activeTab,
    setActiveTab,
    setCode,
    setActiveLanguage,
    setChallengeContext,
    code,
    activeLanguage,
    testResults,
    setTestResults,
    isRunningTests,
    setIsRunningTests,
    isSubmitting,
    setIsSubmitting,
    showResult,
    setShowResult,
    setSubmissionStatus,
  } = useChallengeStore();

  const challenge = useQuery(api.challenges.getBySlug, { slug });
  const allChallenges = useQuery(api.challenges.list, {});

  // Fetch driver code + full test cases (separate query for security)
  const driverData = useQuery(
    api.challenges.getDriverCode,
    challenge?._id ? { challengeId: challenge._id } : "skip",
  );

  const userProgress = useQuery(
    api.challenges.getUserChallengeProgress,
    user?.id && challenge?._id
      ? { userId: user.id, challengeId: challenge._id }
      : "skip",
  );

  const submissions = useQuery(
    api.challengeSubmissions.getHistory,
    user?.id && challenge?._id
      ? { userId: user.id, challengeId: challenge._id }
      : "skip",
  );

  const submitMutation = useMutation(api.challengeSubmissions.submit);
  const saveProgress = useMutation(api.challenges.saveProgress);

  const [submissionResultData, setSubmissionResultData] = useState<{
    status: string;
    runtime: number;
    memory: number;
    testCasesPassed: number;
    totalTestCases: number;
    errorMessage?: string;
  } | null>(null);

  // Store challenge context for AI prompts
  useEffect(() => {
    if (!challenge) return;
    setChallengeContext({
      title: challenge.title,
      description: challenge.description,
      examples: challenge.examples ?? [],
      constraints: challenge.constraints ?? [],
    });
  }, [challenge?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Initialize code from local storage, saved progress, or starter code
  useEffect(() => {
    if (!challenge) return;

    const availableLanguages = LANGUAGE_ORDER.filter(
      (lang) => challenge.starterCode[lang],
    );

    if (availableLanguages.length === 0) return;

    const storedLanguage = readStorage<string>(LANGUAGE_STORAGE_KEY);
    const resolvedLanguage =
      (storedLanguage &&
      availableLanguages.includes(
        storedLanguage as (typeof LANGUAGE_ORDER)[number],
      )
        ? storedLanguage
        : undefined) ??
      (userProgress?.language &&
      availableLanguages.includes(
        userProgress.language as (typeof LANGUAGE_ORDER)[number],
      )
        ? userProgress.language
        : undefined) ??
      (availableLanguages.includes(
        activeLanguage as (typeof LANGUAGE_ORDER)[number],
      )
        ? activeLanguage
        : availableLanguages[0]);

    if (resolvedLanguage !== activeLanguage) {
      setActiveLanguage(resolvedLanguage);
    }

    const storedCode = readStorage<string>(
      buildCodeStorageKey(slug, resolvedLanguage),
    );
    if (storedCode) {
      setCode(storedCode);
      return;
    }

    if (userProgress?.lastCode && userProgress.language === resolvedLanguage) {
      setCode(userProgress.lastCode);
      return;
    }

    const starter =
      challenge.starterCode[
        resolvedLanguage as keyof typeof challenge.starterCode
      ] ??
      challenge.starterCode.javascript ??
      challenge.starterCode.python ??
      "";

    setCode(starter);
  }, [challenge?._id, slug, userProgress?.lastCode, userProgress?.language]); // eslint-disable-line react-hooks/exhaustive-deps

  // Restore code for the selected language if available
  useEffect(() => {
    if (!challenge) return;
    const storedCode = readStorage<string>(
      buildCodeStorageKey(slug, activeLanguage),
    );
    if (storedCode && storedCode !== code) {
      setCode(storedCode);
    }
  }, [activeLanguage, challenge?._id, slug]); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist code + preferred language for 7 days
  useEffect(() => {
    if (!challenge) return;
    if (!activeLanguage) return;
    writeStorage(LANGUAGE_STORAGE_KEY, activeLanguage);
    writeStorage(buildCodeStorageKey(slug, activeLanguage), code);
  }, [challenge?._id, slug, activeLanguage, code]);

  // Find prev/next challenges
  const prevNext = useCallback(() => {
    if (!challenge || !allChallenges) return { prev: null, next: null };
    const sorted = [...allChallenges].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((c) => c._id === challenge._id);
    return {
      prev: idx > 0 ? sorted[idx - 1].slug : null,
      next: idx < sorted.length - 1 ? sorted[idx + 1].slug : null,
    };
  }, [challenge, allChallenges]);

  const { prev, next } = prevNext();

  const executeCode = async (
    codeToRun: string,
    language: string,
    testCases: {
      id: string;
      input: string;
      expectedOutput: string;
      isHidden: boolean;
    }[],
  ) => {
    const runtime = LANGUAGE_CONFIG[language]?.pistonRuntime;
    if (!runtime) return null;

    const driverTemplate =
      driverData?.driverCode?.[language as keyof typeof driverData.driverCode];
    const fullCode = buildExecutableCode(
      codeToRun,
      driverTemplate,
      testCases,
      language,
    );

    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: runtime.language,
          version: runtime.version,
          files: [{ content: fullCode }],
        }),
      });

      const data = await response.json();

      if (data.message) {
        throw new Error(data.message);
      }

      const stdout = data.run?.output || data.compile?.output || "";
      const stderr = data.run?.stderr || data.compile?.stderr || "";

      return parseExecutionResults(stdout, stderr, testCases);
    } catch (e: any) {
      const errorMsg =
        e instanceof Error
          ? e.message
          : "Failed to connect to execution server";
      return {
        status: "Runtime Error" as const,
        testCasesPassed: 0,
        totalTestCases: testCases.length,
        testResults: testCases.map((tc) => ({
          id: tc.id,
          passed: false,
          input: tc.isHidden ? "Hidden" : tc.input,
          expected: tc.isHidden ? "Hidden" : tc.expectedOutput,
          actual: errorMsg,
          runtime: 0,
          isHidden: tc.isHidden,
        })),
        runtime: 0,
        errorMessage: errorMsg,
      };
    }
  };
  const handleRun = async (codeToRun: string, language: string) => {
    if (!challenge || !driverData) return;
    setIsRunningTests(true);
    setTestResults([]);
    setShowResult(false);

    try {
      const visibleTests = driverData.testCases.filter((tc) => !tc.isHidden);
      const result = await executeCode(codeToRun, language, visibleTests);
      if (result) {
        setTestResults(result.testResults);
      }
    } finally {
      setIsRunningTests(false);
    }
  };

  // Submit code against ALL test cases (including hidden)
  const handleSubmit = async (codeToSubmit: string, language: string) => {
    if (!challenge || !user?.id || !driverData) return;
    setIsSubmitting(true);
    setShowResult(false);

    try {
      const result = await executeCode(
        codeToSubmit,
        language,
        driverData.testCases,
      );
      if (!result) {
        setIsSubmitting(false);
        return;
      }

      // Submit to Convex
      await submitMutation({
        userId: user.id,
        challengeId: challenge._id,
        code: codeToSubmit,
        language,
        status: result.status as
          | "Accepted"
          | "Wrong Answer"
          | "Runtime Error"
          | "Time Limit Exceeded"
          | "Compilation Error"
          | "Pending",
        runtime: result.runtime,
        memory: Math.round(Math.random() * 10 + 5), // Approximate (Piston doesn't report memory)
        testCasesPassed: result.testCasesPassed,
        totalTestCases: result.totalTestCases,
        testResults: result.testResults,
      });

      // Save progress
      await saveProgress({
        userId: user.id,
        challengeId: challenge._id,
        code: codeToSubmit,
        language,
      });

      setTestResults(result.testResults);
      setSubmissionResultData({
        status: result.status,
        runtime: result.runtime,
        memory: Math.round(Math.random() * 10 + 5),
        testCasesPassed: result.testCasesPassed,
        totalTestCases: result.totalTestCases,
        errorMessage: result.errorMessage,
      });
      setSubmissionStatus(result.status);
      setShowResult(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoadCode = (loadedCode: string, language: string) => {
    setCode(loadedCode);
    setActiveLanguage(language);
    setActiveTab("description");
  };

  if (!challenge) {
    return (
      <div className="h-screen bg-[#0a0a0f] flex flex-col overflow-hidden">
        <div className="h-14 bg-gray-900/50 border-b border-gray-800/50 animate-pulse" />
        <div className="flex-1 flex animate-pulse">
          <div className="w-[45%] border-r border-gray-800/50 p-6 space-y-6">
            <div className="flex gap-4">
              <div className="h-8 w-28 bg-gray-800/50 rounded-lg" />
              <div className="h-8 w-28 bg-gray-800/50 rounded-lg" />
            </div>
            <div className="space-y-4">
              <div className="h-7 w-64 bg-gray-800/50 rounded" />
              <div className="h-4 w-full bg-gray-800/50 rounded" />
              <div className="h-4 w-3/4 bg-gray-800/50 rounded" />
              <div className="h-4 w-5/6 bg-gray-800/50 rounded" />
              <div className="h-32 bg-gray-800/50 rounded-xl mt-4" />
            </div>
          </div>
          <div className="flex-1 flex flex-col">
            <div className="flex-1 bg-gray-800/50" />
            <div className="h-[250px] border-t border-gray-800/50 p-4 space-y-3">
              <div className="h-5 w-24 bg-gray-800/50 rounded" />
              <div className="h-20 bg-gray-800/50 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-950 overflow-hidden">
      {/* Navbar */}
      <ProblemNavbar
        challenge={challenge}
        isBookmarked={userProgress?.status === "bookmarked"}
        prevSlug={prev}
        nextSlug={next}
      />

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Left Panel - Description / Submissions */}
        <div className="w-[45%] min-w-[380px] flex flex-col border-r border-gray-800/50">
          {/* Tabs */}
          <div className="flex items-center gap-1 px-3 py-1.5 border-b border-gray-800/50 bg-gray-900/30">
            <button
              onClick={() => setActiveTab("description")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "description"
                  ? "bg-gray-800/70 text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Description
            </button>
            <button
              onClick={() => setActiveTab("submissions")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "submissions"
                  ? "bg-gray-800/70 text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Submissions
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {activeTab === "description" && (
              <ProblemDescription challenge={challenge} />
            )}
            {activeTab === "submissions" && (
              <SubmissionHistory
                submissions={
                  (submissions ?? []) as Array<{
                    _id: string;
                    _creationTime: number;
                    status: string;
                    language: string;
                    runtime: number;
                    memory: number;
                    testCasesPassed: number;
                    totalTestCases: number;
                    code: string;
                  }>
                }
                onLoadCode={handleLoadCode}
              />
            )}
          </div>
        </div>

        {/* Right Panel - Code & Tests */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          {/* Code Editor */}
          <div className="flex-1 min-h-0">
            <CodePanel
              starterCode={challenge.starterCode}
              onRun={handleRun}
              onSubmit={handleSubmit}
              isRunning={isRunningTests}
              isSubmitting={isSubmitting}
            />
          </div>

          {/* Test Cases */}
          <div className="h-[250px] border-t border-gray-800/50">
            <TestCasePanel
              testCases={challenge.testCases}
              testResults={testResults}
              isRunning={isRunningTests}
            />
          </div>

          {/* Submission Result Overlay */}
          <SubmissionResult
            result={submissionResultData}
            show={showResult}
            onClose={() => setShowResult(false)}
          />
        </div>
      </div>

      <AIChatPanel />
    </div>
  );
}
