"use client";

import { Trophy, Flame, Target, Award } from "lucide-react";

interface StatsOverviewProps {
  stats: {
    totalSolved: number;
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
    points: number;
    rank: string;
    currentStreak: number;
    maxStreak: number;
  } | null;
  totalChallenges: number;
}

export default function StatsOverview({ stats, totalChallenges }: StatsOverviewProps) {
  const totalSolved = stats?.totalSolved ?? 0;
  const progress = totalChallenges > 0 ? Math.round((totalSolved / totalChallenges) * 100) : 0;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const rankColors: Record<string, string> = {
    Beginner: "text-gray-400",
    Intermediate: "text-blue-400",
    Advanced: "text-purple-400",
    Expert: "text-amber-400",
    Master: "text-orange-400",
    Grandmaster: "text-rose-400",
  };

  return (
    <div className="rounded-xl border border-gray-800/60 bg-gradient-to-br from-gray-900/80 to-gray-950/80 p-5 mb-6">
      <div className="flex flex-wrap items-center gap-8">
        {/* Progress Ring */}
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="6" fill="none" className="text-gray-800" />
            <circle
              cx="50" cy="50" r="40"
              stroke="url(#progressGradient)" strokeWidth="6" fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-white">{totalSolved}</span>
            <span className="text-[10px] text-gray-500">/ {totalChallenges}</span>
          </div>
        </div>

        {/* Difficulty Breakdown */}
        <div className="flex-1 min-w-[200px] space-y-2">
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Progress</h4>
          <div className="flex items-center gap-3">
            <span className="text-xs text-emerald-400 w-14">Easy</span>
            <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-700"
                style={{ width: `${stats?.easySolved ? (stats.easySolved / Math.max(totalChallenges, 1)) * 100 : 0}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 w-8 text-right">{stats?.easySolved ?? 0}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-amber-400 w-14">Medium</span>
            <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-700"
                style={{ width: `${stats?.mediumSolved ? (stats.mediumSolved / Math.max(totalChallenges, 1)) * 100 : 0}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 w-8 text-right">{stats?.mediumSolved ?? 0}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-rose-400 w-14">Hard</span>
            <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full transition-all duration-700"
                style={{ width: `${stats?.hardSolved ? (stats.hardSolved / Math.max(totalChallenges, 1)) * 100 : 0}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 w-8 text-right">{stats?.hardSolved ?? 0}</span>
          </div>
        </div>

        {/* Stats cards */}
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl bg-gray-800/30 border border-gray-800/50">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-lg font-bold text-white">{stats?.points ?? 0}</span>
            <span className="text-[10px] text-gray-500">Points</span>
          </div>
          <div className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl bg-gray-800/30 border border-gray-800/50">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-lg font-bold text-white">{stats?.currentStreak ?? 0}</span>
            <span className="text-[10px] text-gray-500">Streak</span>
          </div>
          <div className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl bg-gray-800/30 border border-gray-800/50">
            <Target className="w-4 h-4 text-blue-400" />
            <span className="text-lg font-bold text-white">{stats?.maxStreak ?? 0}</span>
            <span className="text-[10px] text-gray-500">Best</span>
          </div>
          <div className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl bg-gray-800/30 border border-gray-800/50">
            <Award className="w-4 h-4 text-purple-400" />
            <span className={`text-sm font-bold ${rankColors[stats?.rank ?? "Beginner"] ?? "text-gray-400"}`}>
              {stats?.rank ?? "Beginner"}
            </span>
            <span className="text-[10px] text-gray-500">Rank</span>
          </div>
        </div>
      </div>
    </div>
  );
}
