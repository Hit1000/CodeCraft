import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const submit = mutation({
  args: {
    userId: v.string(),
    challengeId: v.id("challenges"),
    code: v.string(),
    language: v.string(),
    status: v.union(
      v.literal("Accepted"),
      v.literal("Wrong Answer"),
      v.literal("Runtime Error"),
      v.literal("Time Limit Exceeded"),
      v.literal("Compilation Error"),
      v.literal("Pending")
    ),
    runtime: v.number(),
    memory: v.number(),
    testCasesPassed: v.number(),
    totalTestCases: v.number(),
    output: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    testResults: v.optional(
      v.array(
        v.object({
          id: v.string(),
          passed: v.boolean(),
          input: v.string(),
          expected: v.string(),
          actual: v.string(),
          runtime: v.number(),
          isHidden: v.boolean(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    // Create submission
    const submissionId = await ctx.db.insert("challengeSubmissions", {
      ...args,
    });

    // Update challenge stats
    const challenge = await ctx.db.get(args.challengeId);
    if (challenge) {
      const newTotal = challenge.totalSubmissions + 1;
      const newAccepted =
        challenge.totalAccepted + (args.status === "Accepted" ? 1 : 0);
      await ctx.db.patch(args.challengeId, {
        totalSubmissions: newTotal,
        totalAccepted: newAccepted,
        acceptanceRate: Math.round((newAccepted / newTotal) * 1000) / 10,
      });
    }

    // Update user progress if accepted
    if (args.status === "Accepted") {
      const existing = await ctx.db
        .query("challengeProgress")
        .withIndex("by_user_challenge", (q) =>
          q.eq("userId", args.userId).eq("challengeId", args.challengeId)
        )
        .unique();

      const isFirstSolve = !existing || existing.status !== "solved";

      if (existing) {
        const updates: Record<string, unknown> = {
          status: "solved" as const,
          solvedAt: Date.now(),
          language: args.language,
          lastCode: args.code,
        };
        if (!existing.bestRuntime || args.runtime < existing.bestRuntime) {
          updates.bestRuntime = args.runtime;
        }
        if (!existing.bestMemory || args.memory < existing.bestMemory) {
          updates.bestMemory = args.memory;
        }
        await ctx.db.patch(existing._id, updates);
      } else {
        await ctx.db.insert("challengeProgress", {
          userId: args.userId,
          challengeId: args.challengeId,
          status: "solved",
          bestRuntime: args.runtime,
          bestMemory: args.memory,
          solvedAt: Date.now(),
          language: args.language,
          lastCode: args.code,
        });
      }

      // Only recalculate stats on first solve, not on every resubmission
      if (isFirstSolve) {
        await updateUserStats(ctx, args.userId, args.challengeId);
      }
    }

    return submissionId;
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function updateUserStats(ctx: any, userId: string, challengeId: any) {
  const challenge = await ctx.db.get(challengeId);
  if (!challenge) return;

  const existingStats = await ctx.db
    .query("challengeUserStats")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .unique();

  const allProgress = await ctx.db
    .query("challengeProgress")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .collect();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const solvedSet = new Set(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    allProgress.filter((p: any) => p.status === "solved").map((p: any) => p.challengeId)
  );

  const solvedChallenges = await Promise.all(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Array.from(solvedSet).map((id: any) => ctx.db.get(id))
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const easySolved = solvedChallenges.filter((c: any) => c?.difficulty === "Easy").length;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mediumSolved = solvedChallenges.filter((c: any) => c?.difficulty === "Medium").length;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hardSolved = solvedChallenges.filter((c: any) => c?.difficulty === "Hard").length;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dsaSolved = solvedChallenges.filter((c: any) => c?.category === "DSA").length;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const aimlSolved = solvedChallenges.filter((c: any) => c?.category === "AI/ML").length;
  const totalSolved = solvedSet.size;

  const points = easySolved * 10 + mediumSolved * 25 + hardSolved * 50;

  let rank = "Beginner";
  if (points >= 2000) rank = "Grandmaster";
  else if (points >= 1000) rank = "Master";
  else if (points >= 500) rank = "Expert";
  else if (points >= 200) rank = "Advanced";
  else if (points >= 50) rank = "Intermediate";

  const today = new Date().toISOString().split("T")[0];

  if (existingStats) {
    let currentStreak = existingStats.currentStreak;
    let maxStreak = existingStats.maxStreak;
    const lastDate = existingStats.lastSolvedDate;

    if (lastDate) {
      const lastD = new Date(lastDate);
      const todayD = new Date(today);
      const diff = Math.floor(
        (todayD.getTime() - lastD.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diff === 1) {
        currentStreak += 1;
      } else if (diff > 1) {
        currentStreak = 1;
      }
    } else {
      currentStreak = 1;
    }
    maxStreak = Math.max(maxStreak, currentStreak);

    await ctx.db.patch(existingStats._id, {
      totalSolved,
      easySolved,
      mediumSolved,
      hardSolved,
      points,
      rank,
      currentStreak,
      maxStreak,
      lastSolvedDate: today,
      dsaSolved,
      aimlSolved,
      totalSubmissions: existingStats.totalSubmissions + 1,
      acceptedSubmissions: existingStats.acceptedSubmissions + 1,
    });
  } else {
    await ctx.db.insert("challengeUserStats", {
      userId,
      totalSolved,
      easySolved,
      mediumSolved,
      hardSolved,
      totalSubmissions: 1,
      acceptedSubmissions: 1,
      points,
      rank,
      currentStreak: 1,
      maxStreak: 1,
      lastSolvedDate: today,
      dsaSolved,
      aimlSolved,
    });
  }
}

export const getHistory = query({
  args: {
    userId: v.string(),
    challengeId: v.id("challenges"),
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query("challengeSubmissions")
      .withIndex("by_user_challenge", (q) =>
        q.eq("userId", args.userId).eq("challengeId", args.challengeId)
      )
      .order("desc")
      .take(50);
  },
});

export const getRecentSubmissions = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const submissions = await ctx.db
      .query("challengeSubmissions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(20);

    // Deduplicate challenge lookups
    const challengeIds = [...new Set(submissions.map((s) => s.challengeId))];
    const challenges = await Promise.all(challengeIds.map((id) => ctx.db.get(id)));
    const challengeMap = new Map(challenges.filter(Boolean).map((c) => [c!._id, c!]));

    return submissions.map((s) => {
      const challenge = challengeMap.get(s.challengeId);
      return {
        ...s,
        challengeTitle: challenge?.title ?? "Unknown",
        challengeSlug: challenge?.slug ?? "",
        challengeDifficulty: challenge?.difficulty ?? "Easy",
      };
    });
  },
});
