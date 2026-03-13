"use client";

import { useChallengeStore } from "@/store/useChallengeStore";
import { Search, X, SlidersHorizontal } from "lucide-react";

const difficulties = ["Easy", "Medium", "Hard"];
const statuses = ["solved", "attempted", "todo"];

export default function ChallengeFilters() {
  const { filters, setFilter, resetFilters, toggleSidebar } = useChallengeStore();

  const hasActiveFilters = filters.difficulty || filters.status || filters.search;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2.5 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:border-blue-500/50 
            hover:bg-gray-800 transition-all duration-300"
        >
          <SlidersHorizontal className="w-4 h-4 text-gray-400" />
        </button>
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search challenges..."
            value={filters.search}
            onChange={(e) => setFilter("search", e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-800/50 border border-gray-700/50 
              text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 
              focus:ring-1 focus:ring-blue-500/25 transition-all duration-300 text-sm"
          />
          {filters.search && (
            <button
              onClick={() => setFilter("search", "")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-gray-700/50"
            >
              <X className="w-3.5 h-3.5 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Difficulty:</span>
        {difficulties.map((d) => (
          <button
            key={d}
            onClick={() => setFilter("difficulty", filters.difficulty === d ? null : d)}
            className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all duration-300 ${
              filters.difficulty === d
                ? d === "Easy"
                  ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                  : d === "Medium"
                    ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                    : "bg-rose-500/20 border-rose-500/50 text-rose-400"
                : "bg-gray-800/50 border-gray-700/50 text-gray-400 hover:border-gray-600"
            }`}
          >
            {d}
          </button>
        ))}

        <span className="text-gray-700 mx-1">|</span>
        <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Status:</span>
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setFilter("status", filters.status === s ? null : s)}
            className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all duration-300 capitalize ${
              filters.status === s
                ? "bg-blue-500/20 border-blue-500/50 text-blue-400"
                : "bg-gray-800/50 border-gray-700/50 text-gray-400 hover:border-gray-600"
            }`}
          >
            {s}
          </button>
        ))}

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="ml-2 px-3 py-1 rounded-lg text-xs font-medium bg-gray-800/50 border border-gray-700/50 
              text-gray-400 hover:text-white hover:border-red-500/50 hover:bg-red-500/10 transition-all duration-300"
          >
            Clear All
          </button>
        )}
      </div>
    </div>
  );
}
