"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import NavigationHeader from "@/components/NavigationHeader";
import { Trophy, Medal, Flame, Target, Crown, Award, Star } from "lucide-react";

const rankConfig: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
  Beginner: { color: "text-gray-400", bg: "bg-gray-500/10", icon: <Star className="w-4 h-4" /> },
  Intermediate: { color: "text-blue-400", bg: "bg-blue-500/10", icon: <Award className="w-4 h-4" /> },
  Advanced: { color: "text-purple-400", bg: "bg-purple-500/10", icon: <Award className="w-4 h-4" /> },
  Expert: { color: "text-amber-400", bg: "bg-amber-500/10", icon: <Trophy className="w-4 h-4" /> },
  Master: { color: "text-orange-400", bg: "bg-orange-500/10", icon: <Crown className="w-4 h-4" /> },
  Grandmaster: { color: "text-rose-400", bg: "bg-rose-500/10", icon: <Crown className="w-4 h-4" /> },
};

const topRankColors = ["text-amber-400", "text-gray-300", "text-amber-600"];

export default function LeaderboardPage() {
  const leaderboard = useQuery(api.challengeLeaderboard.getLeaderboard, { limit: 100 });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950">
      <NavigationHeader />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20">
            <Trophy className="w-7 h-7 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Top coders ranked by challenge points
            </p>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="rounded-xl border border-gray-800/60 bg-gradient-to-br from-gray-900/80 to-gray-950/80 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-gray-500 bg-gray-900/50">
                <th className="text-left px-5 py-3.5 font-medium w-16">#</th>
                <th className="text-left px-5 py-3.5 font-medium">User</th>
                <th className="text-center px-5 py-3.5 font-medium">Solved</th>
                <th className="text-center px-5 py-3.5 font-medium">
                  <span className="text-emerald-500">E</span> / <span className="text-amber-500">M</span> / <span className="text-rose-500">H</span>
                </th>
                <th className="text-center px-5 py-3.5 font-medium">Points</th>
                <th className="text-center px-5 py-3.5 font-medium">Streak</th>
                <th className="text-center px-5 py-3.5 font-medium">Rank</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard?.map((entry, i) => {
                const rankTitle =
                  entry.points >= 5000 ? "Grandmaster" :
                  entry.points >= 2500 ? "Master" :
                  entry.points >= 1500 ? "Expert" :
                  entry.points >= 800 ? "Advanced" :
                  entry.points >= 300 ? "Intermediate" :
                  "Beginner";
                const rc = rankConfig[rankTitle] ?? rankConfig["Beginner"];
                return (
                  <tr
                    key={entry.userId}
                    className={`border-t border-gray-800/30 hover:bg-gray-800/20 transition-colors ${
                      i < 3 ? "bg-gradient-to-r from-gray-800/10 to-transparent" : ""
                    }`}
                  >
                    {/* Rank */}
                    <td className="px-5 py-3.5">
                      {i < 3 ? (
                        <div className={`flex items-center justify-center w-7 h-7 rounded-full ${
                          i === 0 ? "bg-amber-500/20" : i === 1 ? "bg-gray-400/20" : "bg-amber-700/20"
                        }`}>
                          <Medal className={`w-4 h-4 ${topRankColors[i]}`} />
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 font-mono pl-1.5">{entry.rank}</span>
                      )}
                    </td>

                    {/* User */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 border border-gray-700/50 flex items-center justify-center">
                          <span className="text-xs font-bold text-blue-400">
                            {entry.userName.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-300">
                            {entry.userName}
                          </div>
                          {entry.userEmail && (
                            <div className="text-xs text-gray-500">
                              {entry.userEmail}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Total Solved */}
                    <td className="px-5 py-3.5 text-center">
                      <span className="text-sm font-semibold text-white">{entry.totalSolved}</span>
                    </td>

                    {/* E / M / H */}
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-2 text-xs">
                        <span className="text-emerald-400">{entry.easySolved}</span>
                        <span className="text-gray-700">/</span>
                        <span className="text-amber-400">{entry.mediumSolved}</span>
                        <span className="text-gray-700">/</span>
                        <span className="text-rose-400">{entry.hardSolved}</span>
                      </div>
                    </td>

                    {/* Points */}
                    <td className="px-5 py-3.5 text-center">
                      <span className="text-sm font-bold text-amber-400">{entry.points}</span>
                    </td>

                    {/* Streak */}
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-orange-400" />
                        <span className="text-xs text-gray-400">{entry.currentStreak}</span>
                        <span className="text-[10px] text-gray-600 ml-0.5">
                          <Target className="w-3 h-3 inline" /> {entry.maxStreak}
                        </span>
                      </div>
                    </td>

                    {/* Rank Title */}
                    <td className="px-5 py-3.5 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${rc.color} ${rc.bg} border border-current/20`}>
                        {rc.icon}
                        {rankTitle}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {(!leaderboard || leaderboard.length === 0) && (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-gray-500">
                    <Trophy className="w-10 h-10 mx-auto mb-3 text-gray-700" />
                    <p className="text-sm">No entries yet</p>
                    <p className="text-xs text-gray-600 mt-1">Be the first to solve a challenge!</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
