"use client";

import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import NavigationHeader from "@/components/NavigationHeader";
import ChallengeFilters from "./_components/ChallengeFilters";
import ChallengeCard from "./_components/ChallengeCard";
import CategorySidebar from "./_components/CategorySidebar";
import StatsOverview from "./_components/StatsOverview";
import { useChallengeStore } from "@/store/useChallengeStore";
import { Code2, Loader2 } from "lucide-react";

export default function ChallengesPage() {
  const { user } = useUser();
  const { filters } = useChallengeStore();

  const challenges = useQuery(api.challenges.list, {
    category: filters.category ?? undefined,
    subcategory: filters.subcategory ?? undefined,
    difficulty: filters.difficulty ?? undefined,
    search: filters.search || undefined,
    tag: filters.tag ?? undefined,
  });

  const categories = useQuery(api.challenges.getCategories);
  const userProgress = useQuery(
    api.challenges.getUserProgress,
    user?.id ? { userId: user.id } : "skip"
  );
  const userStats = useQuery(
    api.challengeLeaderboard.getUserStats,
    user?.id ? { userId: user.id } : "skip"
  );

  // Build progress map
  const progressMap = new Map<string, string>();
  if (userProgress) {
    for (const p of userProgress) {
      progressMap.set(p.challengeId, p.status);
    }
  }

  // Filter by status if set
  let filteredChallenges = challenges;
  if (filters.status && filteredChallenges) {
    if (filters.status === "todo") {
      filteredChallenges = filteredChallenges.filter((c) => !progressMap.has(c._id));
    } else {
      filteredChallenges = filteredChallenges.filter(
        (c) => progressMap.get(c._id) === filters.status
      );
    }
  }

  const totalChallenges = categories?.reduce((sum, c) => sum + c.count, 0) ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950">
      <NavigationHeader />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20">
            <Code2 className="w-7 h-7 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Challenges</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Practice DSA & AI/ML problems to sharpen your skills
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        {user && (
          <StatsOverview stats={userStats ?? null} totalChallenges={totalChallenges} />
        )}

        {/* Filters */}
        <ChallengeFilters />

        {/* Main Content */}
        <div className="flex gap-6 mt-6">
          {/* Sidebar */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            <CategorySidebar categories={categories ?? []} />
          </div>

          {/* Challenge Grid */}
          <div className="flex-1 min-w-0">
            {!challenges ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
              </div>
            ) : filteredChallenges && filteredChallenges.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-800/50 border border-gray-700/50 flex items-center justify-center mb-4">
                  <Code2 className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-400 mb-2">No challenges found</h3>
                <p className="text-sm text-gray-500">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredChallenges?.map((challenge) => (
                  <ChallengeCard
                    key={challenge._id}
                    challenge={challenge}
                    status={
                      (progressMap.get(challenge._id) as
                        | "solved"
                        | "attempted"
                        | "bookmarked"
                        | undefined) ?? null
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
