import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ========== QUERIES ==========

export const list = query({
  args: {
    category: v.optional(v.string()),
    subcategory: v.optional(v.string()),
    difficulty: v.optional(v.string()),
    search: v.optional(v.string()),
    status: v.optional(v.string()),
    tag: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let challenges;

    if (args.category && args.difficulty) {
      challenges = await ctx.db
        .query("challenges")
        .withIndex("by_category", (q) =>
          q.eq("category", args.category!).eq("difficulty", args.difficulty as "Easy" | "Medium" | "Hard")
        )
        .collect();
    } else if (args.difficulty) {
      challenges = await ctx.db
        .query("challenges")
        .withIndex("by_difficulty", (q) => q.eq("difficulty", args.difficulty as "Easy" | "Medium" | "Hard"))
        .collect();
    } else if (args.category) {
      challenges = await ctx.db
        .query("challenges")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .collect();
    } else {
      challenges = await ctx.db
        .query("challenges")
        .withIndex("by_order")
        .collect();
    }

    // Only show published challenges (treat missing isPublished as published for old data)
    challenges = challenges.filter((c) => c.isPublished !== false);

    // Apply search filter
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      challenges = challenges.filter(
        (c) =>
          c.title.toLowerCase().includes(searchLower) ||
          c.tags.some((t) => t.toLowerCase().includes(searchLower)) ||
          c.category.toLowerCase().includes(searchLower)
      );
    }

    // Apply tag filter
    if (args.tag) {
      challenges = challenges.filter((c) =>
        c.tags.some((t) => t.toLowerCase() === args.tag!.toLowerCase())
      );
    }

    // Apply subcategory filter
    if (args.subcategory) {
      challenges = challenges.filter((c) => c.subcategory === args.subcategory);
    }

    // Return without test case solutions or driver code (security)
    return challenges.map((c) => ({
      _id: c._id,
      title: c.title,
      slug: c.slug,
      difficulty: c.difficulty,
      category: c.category,
      subcategory: c.subcategory,
      tags: c.tags,
      acceptanceRate: c.acceptanceRate,
      totalSubmissions: c.totalSubmissions,
      likes: c.likes,
      order: c.order,
      isPremium: c.isPremium,
    }));
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const challenge = await ctx.db
      .query("challenges")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!challenge || challenge.isPublished === false) return null;

    // Sanitize hidden test cases; do NOT expose driverCode to client
    return {
      _id: challenge._id,
      title: challenge.title,
      slug: challenge.slug,
      difficulty: challenge.difficulty,
      category: challenge.category,
      subcategory: challenge.subcategory,
      tags: challenge.tags,
      description: challenge.description,
      descriptionImages: challenge.descriptionImages,
      examples: challenge.examples,
      constraints: challenge.constraints,
      starterCode: challenge.starterCode,
      testCases: challenge.testCases.map((tc) => ({
        id: tc.id,
        input: tc.isHidden ? "Hidden" : tc.input,
        expectedOutput: tc.isHidden ? "Hidden" : tc.expectedOutput,
        isHidden: tc.isHidden,
      })),
      hints: challenge.hints,
      editorial: challenge.editorial,
      editorialImages: challenge.editorialImages,
      timeLimit: challenge.timeLimit,
      memoryLimit: challenge.memoryLimit,
      acceptanceRate: challenge.acceptanceRate,
      totalSubmissions: challenge.totalSubmissions,
      likes: challenge.likes,
      dislikes: challenge.dislikes,
      isPremium: challenge.isPremium,
      order: challenge.order,
    };
  },
});

// Get driver code + all test cases for execution (called by solver page)
export const getDriverCode = query({
  args: { challengeId: v.id("challenges") },
  handler: async (ctx, args) => {
    const challenge = await ctx.db.get(args.challengeId);
    if (!challenge) return null;
    return {
      driverCode: challenge.driverCode ?? {},
      testCases: challenge.testCases,
      timeLimit: challenge.timeLimit,
    };
  },
});

export const getFullTestCases = query({
  args: { challengeId: v.id("challenges") },
  handler: async (ctx, args) => {
    const challenge = await ctx.db.get(args.challengeId);
    if (!challenge) return null;
    return challenge.testCases;
  },
});

export const getCategories = query({
  handler: async (ctx) => {
    const challenges = await ctx.db.query("challenges").collect();
    const published = challenges.filter((c) => c.isPublished !== false);

    const categoryMap: Record<
      string,
      { count: number; subcategories: Set<string>; easy: number; medium: number; hard: number }
    > = {};

    for (const c of published) {
      if (!categoryMap[c.category]) {
        categoryMap[c.category] = {
          count: 0,
          subcategories: new Set(),
          easy: 0,
          medium: 0,
          hard: 0,
        };
      }
      categoryMap[c.category].count++;
      categoryMap[c.category].subcategories.add(c.subcategory);
      if (c.difficulty === "Easy") categoryMap[c.category].easy++;
      if (c.difficulty === "Medium") categoryMap[c.category].medium++;
      if (c.difficulty === "Hard") categoryMap[c.category].hard++;
    }

    return Object.entries(categoryMap)
      .map(([name, data]) => ({
        name,
        count: data.count,
        subcategories: Array.from(data.subcategories),
        easy: data.easy,
        medium: data.medium,
        hard: data.hard,
      }))
      .sort((a, b) => b.count - a.count);
  },
});

export const getUserProgress = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    if (!args.userId) return [];
    return ctx.db
      .query("challengeProgress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const getUserChallengeProgress = query({
  args: { userId: v.string(), challengeId: v.id("challenges") },
  handler: async (ctx, args) => {
    if (!args.userId) return null;
    return ctx.db
      .query("challengeProgress")
      .withIndex("by_user_challenge", (q) =>
        q.eq("userId", args.userId).eq("challengeId", args.challengeId)
      )
      .unique();
  },
});

export const saveProgress = mutation({
  args: {
    userId: v.string(),
    challengeId: v.id("challenges"),
    code: v.string(),
    language: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("challengeProgress")
      .withIndex("by_user_challenge", (q) =>
        q.eq("userId", args.userId).eq("challengeId", args.challengeId)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        lastCode: args.code,
        language: args.language,
      });
    } else {
      await ctx.db.insert("challengeProgress", {
        userId: args.userId,
        challengeId: args.challengeId,
        status: "attempted",
        lastCode: args.code,
        language: args.language,
      });
    }
  },
});

export const toggleBookmark = mutation({
  args: {
    userId: v.string(),
    challengeId: v.id("challenges"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("challengeProgress")
      .withIndex("by_user_challenge", (q) =>
        q.eq("userId", args.userId).eq("challengeId", args.challengeId)
      )
      .unique();

    if (existing) {
      if (existing.status === "bookmarked") {
        await ctx.db.delete(existing._id);
        return false;
      } else {
        if (existing.status !== "solved") {
          await ctx.db.patch(existing._id, { status: "bookmarked" });
        }
        return true;
      }
    } else {
      await ctx.db.insert("challengeProgress", {
        userId: args.userId,
        challengeId: args.challengeId,
        status: "bookmarked",
      });
      return true;
    }
  },
});
