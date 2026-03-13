"use client";

import { useChallengeStore } from "@/store/useChallengeStore";
import { ChevronRight, Brain, Code2, FolderOpen, X } from "lucide-react";

interface CategoryData {
  name: string;
  count: number;
  subcategories: string[];
  easy: number;
  medium: number;
  hard: number;
}

interface CategorySidebarProps {
  categories: CategoryData[];
}

const categoryIcons: Record<string, React.ReactNode> = {
  DSA: <Code2 className="w-4 h-4" />,
  "AI/ML": <Brain className="w-4 h-4" />,
};

export default function CategorySidebar({ categories }: CategorySidebarProps) {
  const { filters, setFilter, isSidebarOpen, toggleSidebar } = useChallengeStore();

  return (
    <>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={toggleSidebar} />
      )}

      <aside
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed lg:relative lg:translate-x-0 top-0 left-0 z-50 lg:z-auto
        w-72 h-full lg:h-auto bg-gray-950 lg:bg-transparent border-r border-gray-800/50 lg:border-0 
        transition-transform duration-300 ease-in-out overflow-y-auto`}
      >
        <div className="p-4 lg:p-0 space-y-4">
          {/* Mobile close */}
          <div className="flex items-center justify-between lg:hidden">
            <h3 className="text-sm font-semibold text-gray-300">Categories</h3>
            <button onClick={toggleSidebar} className="p-1 hover:bg-gray-800 rounded-lg">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* All problems */}
          <button
            onClick={() => {
              setFilter("category", null);
              setFilter("subcategory", null);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
              !filters.category
                ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                : "text-gray-400 hover:text-gray-300 hover:bg-gray-800/50 border border-transparent"
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            All Problems
            <span className="ml-auto text-xs opacity-60">
              {categories.reduce((sum, c) => sum + c.count, 0)}
            </span>
          </button>

          {/* Category list */}
          {categories.map((cat) => (
            <div key={cat.name} className="space-y-1">
              <button
                onClick={() => {
                  setFilter("category", filters.category === cat.name ? null : cat.name);
                  setFilter("subcategory", null);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  filters.category === cat.name
                    ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                    : "text-gray-400 hover:text-gray-300 hover:bg-gray-800/50 border border-transparent"
                }`}
              >
                {categoryIcons[cat.name] || <FolderOpen className="w-4 h-4" />}
                {cat.name}
                <span className="ml-auto text-xs opacity-60">{cat.count}</span>
              </button>

              {/* Difficulty breakdown */}
              {filters.category === cat.name && (
                <div className="ml-4 pl-4 border-l border-gray-800/50 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-gray-500 py-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Easy: {cat.easy}
                    <span className="w-2 h-2 rounded-full bg-amber-400 ml-2" />
                    Med: {cat.medium}
                    <span className="w-2 h-2 rounded-full bg-rose-400 ml-2" />
                    Hard: {cat.hard}
                  </div>

                  {/* Subcategories */}
                  {cat.subcategories.map((sub) => (
                    <button
                      key={sub}
                      onClick={() =>
                        setFilter("subcategory", filters.subcategory === sub ? null : sub)
                      }
                      className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all duration-200 ${
                        filters.subcategory === sub
                          ? "text-blue-400 bg-blue-500/10"
                          : "text-gray-500 hover:text-gray-400 hover:bg-gray-800/30"
                      }`}
                    >
                      <ChevronRight className="w-3 h-3" />
                      {sub}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
