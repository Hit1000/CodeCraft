import { query } from "./_generated/server";
import { v } from "convex/values";

export const getLeaderboard = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    const allStats = await ctx.db.query("challengeUserStats").collect();

    // Sort by points descending
    const sorted = allStats.sort((a, b) => b.points - a.points).slice(0, limit);

    return sorted.map((s, i) => ({
      rank: i + 1,
      userId: s.userId,
      totalSolved: s.totalSolved,
      easySolved: s.easySolved,
      mediumSolved: s.mediumSolved,
      hardSolved: s.hardSolved,
      points: s.points,
      title: s.rank,
      currentStreak: s.currentStreak,
      maxStreak: s.maxStreak,
      dsaSolved: s.dsaSolved,
      aimlSolved: s.aimlSolved,
    }));
  },
});

export const getUserStats = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    if (!args.userId) return null;
    return ctx.db
      .query("challengeUserStats")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
  },
});
