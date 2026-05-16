import { create } from "zustand";

interface ChallengeFilters {
  search: string;
  difficulty: string | null;
  category: string | null;
  subcategory: string | null;
  status: string | null;
  tag: string | null;
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

interface ChallengeContext {
  title: string;
  description: string;
  examples: Array<{ input: string; output: string; explanation?: string }>;
  constraints: string[];
}

interface ChallengeState {
  // Filters
  filters: ChallengeFilters;
  setFilter: (key: keyof ChallengeFilters, value: string | null) => void;
  resetFilters: () => void;

  // Sidebar
  isSidebarOpen: boolean;
  toggleSidebar: () => void;

  // Problem solving page
  activeLanguage: string;
  setActiveLanguage: (lang: string) => void;
  code: string;
  setCode: (code: string) => void;

  // Current challenge context (for AI prompts)
  challengeContext: ChallengeContext | null;
  setChallengeContext: (context: ChallengeContext | null) => void;

  // Active tab in problem page
  activeTab: "description" | "editorial" | "submissions";
  setActiveTab: (tab: "description" | "editorial" | "submissions") => void;

  // Test results
  testResults: TestResult[];
  setTestResults: (results: TestResult[]) => void;
  clearTestResults: () => void;

  // Submission state
  isSubmitting: boolean;
  setIsSubmitting: (val: boolean) => void;
  isRunningTests: boolean;
  setIsRunningTests: (val: boolean) => void;

  // Result panel
  showResult: boolean;
  setShowResult: (val: boolean) => void;
  submissionStatus: string | null;
  setSubmissionStatus: (status: string | null) => void;
}

const defaultFilters: ChallengeFilters = {
  search: "",
  difficulty: null,
  category: null,
  subcategory: null,
  status: null,
  tag: null,
};

export const useChallengeStore = create<ChallengeState>((set) => ({
  // Filters
  filters: { ...defaultFilters },
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),
  resetFilters: () => set({ filters: { ...defaultFilters } }),

  // Sidebar
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  // Problem solving
  activeLanguage: "javascript",
  setActiveLanguage: (lang) => set({ activeLanguage: lang }),
  code: "",
  setCode: (code) => set({ code }),

  // Challenge context
  challengeContext: null,
  setChallengeContext: (context) => set({ challengeContext: context }),

  // Active tab
  activeTab: "description",
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Test results
  testResults: [],
  setTestResults: (results) => set({ testResults: results }),
  clearTestResults: () => set({ testResults: [] }),

  // Submission
  isSubmitting: false,
  setIsSubmitting: (val) => set({ isSubmitting: val }),
  isRunningTests: false,
  setIsRunningTests: (val) => set({ isRunningTests: val }),

  // Result panel
  showResult: false,
  setShowResult: (val) => set({ showResult: val }),
  submissionStatus: null,
  setSubmissionStatus: (status) => set({ submissionStatus: status }),
}));
