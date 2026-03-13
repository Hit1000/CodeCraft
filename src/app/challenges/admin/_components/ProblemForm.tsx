"use client";

import { useState, useEffect } from "react";
import TestCaseEditor from "./TestCaseEditor";
import { Save, Eye, EyeOff, Plus, X, ChevronDown, ChevronUp, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

interface Example {
  input: string;
  output: string;
  explanation?: string;
}

interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

interface StarterCode {
  python?: string;
  javascript?: string;
  typescript?: string;
  java?: string;
  cpp?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ChallengeData = Record<string, any>;

interface ProblemFormProps {
  initialData?: ChallengeData;
  onSubmit: (data: ChallengeData) => Promise<void>;
  isLoading?: boolean;
  mode: "create" | "edit";
}

const CATEGORIES = ["DSA", "AI/ML"];
const SUBCATEGORIES: Record<string, string[]> = {
  DSA: ["Arrays & Hashing", "Stacks", "Linked Lists", "Binary Search", "Dynamic Programming", "Trees", "Graphs", "Sorting", "Greedy", "Backtracking"],
  "AI/ML": ["Linear Regression", "Neural Networks", "Classification", "Clustering", "NLP", "Computer Vision", "Reinforcement Learning"],
};
const DIFFICULTIES = ["Easy", "Medium", "Hard"] as const;
const LANGUAGES = ["python", "javascript", "typescript", "java", "cpp"] as const;
const LANGUAGE_LABELS: Record<string, string> = {
  python: "Python",
  javascript: "JavaScript",
  typescript: "TypeScript",
  java: "Java",
  cpp: "C++",
};

export default function ProblemForm({ initialData, onSubmit, isLoading, mode }: ProblemFormProps) {
  // Basic info
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [difficulty, setDifficulty] = useState<string>(initialData?.difficulty ?? "Easy");
  const [category, setCategory] = useState(initialData?.category ?? "DSA");
  const [subcategory, setSubcategory] = useState(initialData?.subcategory ?? "");
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? []);
  const [tagInput, setTagInput] = useState("");

  // Description
  const [description, setDescription] = useState(initialData?.description ?? "");

  // Examples
  const [examples, setExamples] = useState<Example[]>(initialData?.examples ?? [{ input: "", output: "" }]);

  // Constraints
  const [constraints, setConstraints] = useState<string[]>(initialData?.constraints ?? [""]);

  // Starter code
  const [starterCode, setStarterCode] = useState<StarterCode>(initialData?.starterCode ?? { python: "", javascript: "" });
  const [activeStarterLang, setActiveStarterLang] = useState<string>("python");

  // Driver code
  const [driverCode, setDriverCode] = useState<StarterCode>(initialData?.driverCode ?? { python: "", javascript: "" });
  const [activeDriverLang, setActiveDriverLang] = useState<string>("python");

  // Test cases
  const [testCases, setTestCases] = useState<TestCase[]>(initialData?.testCases ?? []);

  // Hints
  const [hints, setHints] = useState<string[]>(initialData?.hints ?? [""]);

  // Editorial
  const [editorial, setEditorial] = useState(initialData?.editorial ?? "");

  // Settings
  const [timeLimit, setTimeLimit] = useState(initialData?.timeLimit ?? 5000);
  const [memoryLimit, setMemoryLimit] = useState(initialData?.memoryLimit ?? 256);
  const [order, setOrder] = useState(initialData?.order ?? 1);
  const [isPremium, setIsPremium] = useState(initialData?.isPremium ?? false);
  const [isPublished, setIsPublished] = useState(initialData?.isPublished ?? false);

  // Section toggles
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    description: true,
    examples: true,
    constraints: true,
    starterCode: true,
    driverCode: false,
    testCases: true,
    hints: false,
    editorial: false,
    settings: false,
  });

  // Auto-generate slug from title
  useEffect(() => {
    if (mode === "create" && title) {
      setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    }
  }, [title, mode]);

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async () => {
    const data: ChallengeData = {
      title,
      slug,
      difficulty,
      category,
      subcategory,
      tags,
      description,
      examples: examples.filter((e) => e.input && e.output),
      constraints: constraints.filter(Boolean),
      starterCode,
      driverCode,
      testCases,
      hints: hints.filter(Boolean),
      editorial: editorial || undefined,
      timeLimit,
      memoryLimit,
      order,
      isPremium,
      isPublished,
    };
    await onSubmit(data);
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const SectionHeader = ({ id, title: sectionTitle, children }: { id: string; title: string; children?: React.ReactNode }) => (
    <button
      onClick={() => toggleSection(id)}
      className="w-full flex items-center justify-between px-4 py-3 bg-gray-800/40 rounded-xl hover:bg-gray-800/60 transition-colors"
    >
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-white">{sectionTitle}</h3>
        {children}
      </div>
      {expandedSections[id] ? (
        <ChevronUp className="w-4 h-4 text-gray-400" />
      ) : (
        <ChevronDown className="w-4 h-4 text-gray-400" />
      )}
    </button>
  );

  return (
    <div className="space-y-4 max-w-5xl">
      {/* ==== Basic Info ==== */}
      <SectionHeader id="basic" title="Basic Information" />
      {expandedSections.basic && (
        <div className="space-y-4 px-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Title *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Two Sum"
                className="w-full bg-gray-900/60 border border-gray-700/50 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Slug *</label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="auto-generated from title"
                className="w-full bg-gray-900/60 border border-gray-700/50 rounded-lg px-3 py-2.5 text-sm text-white font-mono placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Difficulty *</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-gray-900/60 border border-gray-700/50 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Category *</label>
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setSubcategory(""); }}
                className="w-full bg-gray-900/60 border border-gray-700/50 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Subcategory *</label>
              <select
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="w-full bg-gray-900/60 border border-gray-700/50 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              >
                <option value="">Select...</option>
                {(SUBCATEGORIES[category] ?? []).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-2.5 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full"
                >
                  {tag}
                  <button onClick={() => setTags(tags.filter((t) => t !== tag))}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder="Add a tag..."
                className="flex-1 bg-gray-900/60 border border-gray-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              />
              <button onClick={addTag} className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-xs text-white rounded-lg transition-colors">
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==== Description ==== */}
      <SectionHeader id="description" title="Description (Markdown)" />
      {expandedSections.description && (
        <div className="px-1">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write the problem description in Markdown..."
            className="w-full bg-gray-900/60 border border-gray-700/50 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 resize-y"
            rows={10}
          />
        </div>
      )}

      {/* ==== Examples ==== */}
      <SectionHeader id="examples" title="Examples" />
      {expandedSections.examples && (
        <div className="space-y-3 px-1">
          {examples.map((ex, i) => (
            <div key={i} className="border border-gray-700/50 bg-gray-800/20 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400">Example {i + 1}</span>
                {examples.length > 1 && (
                  <button onClick={() => setExamples(examples.filter((_, idx) => idx !== i))} className="text-gray-500 hover:text-red-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Input</label>
                  <input
                    value={ex.input}
                    onChange={(e) => { const u = [...examples]; u[i] = { ...u[i], input: e.target.value }; setExamples(u); }}
                    className="w-full bg-gray-900/60 border border-gray-700/50 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Output</label>
                  <input
                    value={ex.output}
                    onChange={(e) => { const u = [...examples]; u[i] = { ...u[i], output: e.target.value }; setExamples(u); }}
                    className="w-full bg-gray-900/60 border border-gray-700/50 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Explanation (optional)</label>
                <input
                  value={ex.explanation ?? ""}
                  onChange={(e) => { const u = [...examples]; u[i] = { ...u[i], explanation: e.target.value || undefined }; setExamples(u); }}
                  className="w-full bg-gray-900/60 border border-gray-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                />
              </div>
            </div>
          ))}
          <button onClick={() => setExamples([...examples, { input: "", output: "" }])} className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300">
            <Plus className="w-3.5 h-3.5" />
            Add Example
          </button>
        </div>
      )}

      {/* ==== Constraints ==== */}
      <SectionHeader id="constraints" title="Constraints" />
      {expandedSections.constraints && (
        <div className="space-y-2 px-1">
          {constraints.map((c, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={c}
                onChange={(e) => { const u = [...constraints]; u[i] = e.target.value; setConstraints(u); }}
                placeholder="e.g. 1 <= nums.length <= 10^4"
                className="flex-1 bg-gray-900/60 border border-gray-700/50 rounded-lg px-3 py-2 text-sm text-white font-mono placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              />
              {constraints.length > 1 && (
                <button onClick={() => setConstraints(constraints.filter((_, idx) => idx !== i))} className="text-gray-500 hover:text-red-400 px-2">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
          <button onClick={() => setConstraints([...constraints, ""])} className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300">
            <Plus className="w-3.5 h-3.5" />
            Add Constraint
          </button>
        </div>
      )}

      {/* ==== Starter Code ==== */}
      <SectionHeader id="starterCode" title="Starter Code (user sees)" />
      {expandedSections.starterCode && (
        <div className="px-1">
          <div className="flex gap-1 mb-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveStarterLang(lang)}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                  activeStarterLang === lang ? "bg-blue-600 text-white" : "bg-gray-800/50 text-gray-400 hover:text-white"
                }`}
              >
                {LANGUAGE_LABELS[lang]}
              </button>
            ))}
          </div>
          <textarea
            value={starterCode[activeStarterLang as keyof StarterCode] ?? ""}
            onChange={(e) => setStarterCode({ ...starterCode, [activeStarterLang]: e.target.value })}
            placeholder={`Enter starter code for ${LANGUAGE_LABELS[activeStarterLang]}...`}
            className="w-full bg-gray-900/60 border border-gray-700/50 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 resize-y"
            rows={8}
          />
        </div>
      )}

      {/* ==== Driver Code ==== */}
      <SectionHeader id="driverCode" title="Driver Code (hidden test harness)">
        <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-full">Advanced</span>
      </SectionHeader>
      {expandedSections.driverCode && (
        <div className="px-1">
          <p className="text-xs text-gray-500 mb-3">
            Template variables: <code className="text-amber-300">{"{{TEST_INPUT}}"}</code>, <code className="text-amber-300">{"{{EXPECTED_OUTPUT}}"}</code>, <code className="text-amber-300">{"{{TEST_ID}}"}</code>. 
            Output format: <code className="text-green-300">PASS:testId:runtime</code> or <code className="text-red-300">FAIL:testId:expected=X:actual=Y:runtime</code>
          </p>
          <div className="flex gap-1 mb-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveDriverLang(lang)}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                  activeDriverLang === lang ? "bg-amber-600 text-white" : "bg-gray-800/50 text-gray-400 hover:text-white"
                }`}
              >
                {LANGUAGE_LABELS[lang]}
              </button>
            ))}
          </div>
          <textarea
            value={driverCode[activeDriverLang as keyof StarterCode] ?? ""}
            onChange={(e) => setDriverCode({ ...driverCode, [activeDriverLang]: e.target.value })}
            placeholder={`Enter driver code for ${LANGUAGE_LABELS[activeDriverLang]}...\nE.g.:\n_result = solution({{TEST_INPUT}})\nif _result == {{EXPECTED_OUTPUT}}:\n    print(f"PASS:{{TEST_ID}}:0")\nelse:\n    print(f"FAIL:{{TEST_ID}}:expected={{EXPECTED_OUTPUT}}:actual={_result}:0")`}
            className="w-full bg-gray-900/60 border border-amber-600/30 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 resize-y"
            rows={8}
          />
        </div>
      )}

      {/* ==== Test Cases ==== */}
      <SectionHeader id="testCases" title={`Test Cases (${testCases.length})`} />
      {expandedSections.testCases && (
        <div className="px-1">
          <TestCaseEditor testCases={testCases} onChange={setTestCases} />
        </div>
      )}

      {/* ==== Hints ==== */}
      <SectionHeader id="hints" title="Hints" />
      {expandedSections.hints && (
        <div className="space-y-2 px-1">
          {hints.map((h, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={h}
                onChange={(e) => { const u = [...hints]; u[i] = e.target.value; setHints(u); }}
                placeholder={`Hint ${i + 1}...`}
                className="flex-1 bg-gray-900/60 border border-gray-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              />
              {hints.length > 1 && (
                <button onClick={() => setHints(hints.filter((_, idx) => idx !== i))} className="text-gray-500 hover:text-red-400 px-2">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
          <button onClick={() => setHints([...hints, ""])} className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300">
            <Plus className="w-3.5 h-3.5" />
            Add Hint
          </button>
        </div>
      )}

      {/* ==== Editorial ==== */}
      <SectionHeader id="editorial" title="Editorial (optional)" />
      {expandedSections.editorial && (
        <div className="px-1">
          <textarea
            value={editorial}
            onChange={(e) => setEditorial(e.target.value)}
            placeholder="Write the solution editorial in Markdown..."
            className="w-full bg-gray-900/60 border border-gray-700/50 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 resize-y"
            rows={8}
          />
        </div>
      )}

      {/* ==== Settings ==== */}
      <SectionHeader id="settings" title="Settings" />
      {expandedSections.settings && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-1">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Time Limit (ms)</label>
            <input
              type="number"
              value={timeLimit}
              onChange={(e) => setTimeLimit(Number(e.target.value))}
              className="w-full bg-gray-900/60 border border-gray-700/50 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Memory Limit (MB)</label>
            <input
              type="number"
              value={memoryLimit}
              onChange={(e) => setMemoryLimit(Number(e.target.value))}
              className="w-full bg-gray-900/60 border border-gray-700/50 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Display Order</label>
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              className="w-full bg-gray-900/60 border border-gray-700/50 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50"
            />
          </div>
          <div className="flex flex-col gap-3 pt-5">
            <label className="flex items-center gap-2 cursor-pointer">
              <button onClick={() => setIsPremium(!isPremium)} className="text-gray-400 hover:text-white">
                {isPremium ? <ToggleRight className="w-5 h-5 text-amber-400" /> : <ToggleLeft className="w-5 h-5" />}
              </button>
              <span className="text-xs text-gray-400">Premium</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <button onClick={() => setIsPublished(!isPublished)} className="text-gray-400 hover:text-white">
                {isPublished ? <Eye className="w-5 h-5 text-green-400" /> : <EyeOff className="w-5 h-5 text-gray-500" />}
              </button>
              <span className="text-xs text-gray-400">{isPublished ? "Published" : "Draft"}</span>
            </label>
          </div>
        </div>
      )}

      {/* ==== Submit ==== */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-800/50">
        <div className="flex items-center gap-3">
          <span className={`text-xs px-2.5 py-1 rounded-full ${isPublished ? "bg-green-500/20 text-green-300" : "bg-gray-700/50 text-gray-400"}`}>
            {isPublished ? "Will be published" : "Draft — not visible to users"}
          </span>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isLoading || !title || !slug || !subcategory || testCases.length === 0}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <Save className="w-4 h-4" />
          {mode === "create" ? "Create Challenge" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
