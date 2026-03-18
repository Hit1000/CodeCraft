import { query } from "./_generated/server";
import { v } from "convex/values";

export const getLeaderboard = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    const sorted = await ctx.db
      .query("challengeUserStats")
      .withIndex("by_points")
      .order("desc")
      .take(limit);

    const users = await ctx.db.query("users").collect();
    const userMap = new Map(users.map((u) => [u.userId, u]));

    return sorted.map((s, i) => {
      const user = userMap.get(s.userId);
      return {
        rank: i + 1,
        userId: s.userId,
        userName: user?.name ?? user?.email ?? "Unknown",
        userEmail: user?.email,
        totalSolved: s.totalSolved,
        easySolved: s.easySolved,
        mediumSolved: s.mediumSolved,
        hardSolved: s.hardSolved,
        points: s.points,
        currentStreak: s.currentStreak,
        maxStreak: s.maxStreak,
        dsaSolved: s.dsaSolved,
        aimlSolved: s.aimlSolved,
      };
    });
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
