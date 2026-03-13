import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ===== Any logged-in user can propose a challenge =====
export const propose = mutation({
  args: {
    userId: v.string(),
    userName: v.string(),
    title: v.string(),
    slug: v.string(),
    difficulty: v.union(v.literal("Easy"), v.literal("Medium"), v.literal("Hard")),
    category: v.string(),
    subcategory: v.string(),
    tags: v.array(v.string()),
    description: v.string(),
    examples: v.array(
      v.object({
        input: v.string(),
        output: v.string(),
        explanation: v.optional(v.string()),
      })
    ),
    constraints: v.array(v.string()),
    starterCode: v.object({
      python: v.optional(v.string()),
      javascript: v.optional(v.string()),
      typescript: v.optional(v.string()),
      java: v.optional(v.string()),
      cpp: v.optional(v.string()),
    }),
    driverCode: v.optional(
      v.object({
        python: v.optional(v.string()),
        javascript: v.optional(v.string()),
        typescript: v.optional(v.string()),
        java: v.optional(v.string()),
        cpp: v.optional(v.string()),
      })
    ),
    testCases: v.array(
      v.object({
        id: v.string(),
        input: v.string(),
        expectedOutput: v.string(),
        isHidden: v.boolean(),
      })
    ),
    hints: v.array(v.string()),
    editorial: v.optional(v.string()),
    timeLimit: v.number(),
    memoryLimit: v.number(),
  },
  handler: async (ctx, args) => {
    // Check slug uniqueness against both challenges and proposals
    const existingChallenge = await ctx.db
      .query("challenges")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (existingChallenge) {
      throw new Error(`A challenge with slug "${args.slug}" already exists`);
    }

    const existingProposal = await ctx.db
      .query("challengeProposals")
      .filter((q) => q.eq(q.field("slug"), args.slug))
      .first();

    if (existingProposal && existingProposal.status === "pending") {
      throw new Error(`A pending proposal with slug "${args.slug}" already exists`);
    }

    const { userId, userName, ...proposalData } = args;

    return ctx.db.insert("challengeProposals", {
      ...proposalData,
      status: "pending",
      proposedBy: userId,
      proposerName: userName,
      proposedAt: Date.now(),
    });
  },
});

// ===== User's own proposals =====
export const getUserProposals = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    if (!args.userId) return [];
    return ctx.db
      .query("challengeProposals")
      .withIndex("by_user", (q) => q.eq("proposedBy", args.userId))
      .collect();
  },
});

// ===== Admin: list pending proposals =====
export const listPending = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // Verify admin
    const admin = await ctx.db
      .query("challengeAdmins")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (!admin) return [];

    return ctx.db
      .query("challengeProposals")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
  },
});

// ===== Admin: list all proposals =====
export const listAll = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("challengeAdmins")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (!admin) return [];

    return ctx.db.query("challengeProposals").collect();
  },
});

// ===== Get full proposal =====
export const getProposal = query({
  args: { proposalId: v.id("challengeProposals") },
  handler: async (ctx, args) => {
    return ctx.db.get(args.proposalId);
  },
});

// ===== Admin: approve proposal — creates real challenge =====
export const approve = mutation({
  args: {
    userId: v.string(),
    proposalId: v.id("challengeProposals"),
    reviewNote: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("challengeAdmins")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (!admin) throw new Error("Unauthorized");

    const proposal = await ctx.db.get(args.proposalId);
    if (!proposal) throw new Error("Proposal not found");
    if (proposal.status !== "pending") throw new Error("Proposal already reviewed");

    // Check slug uniqueness again
    const existing = await ctx.db
      .query("challenges")
      .withIndex("by_slug", (q) => q.eq("slug", proposal.slug))
      .unique();

    if (existing) {
      throw new Error(`A challenge with slug "${proposal.slug}" already exists`);
    }

    // Determine order
    const allChallenges = await ctx.db.query("challenges").collect();
    const maxOrder = allChallenges.reduce((max, c) => Math.max(max, c.order), 0);
    const order = args.order ?? maxOrder + 1;

    // Create the real challenge from proposal
    await ctx.db.insert("challenges", {
      title: proposal.title,
      slug: proposal.slug,
      difficulty: proposal.difficulty,
      category: proposal.category,
      subcategory: proposal.subcategory,
      tags: proposal.tags,
      description: proposal.description,
      examples: proposal.examples,
      constraints: proposal.constraints,
      starterCode: proposal.starterCode,
      driverCode: proposal.driverCode,
      testCases: proposal.testCases,
      hints: proposal.hints,
      editorial: proposal.editorial,
      timeLimit: proposal.timeLimit,
      memoryLimit: proposal.memoryLimit,
      order,
      isPremium: proposal.isPremium ?? false,
      acceptanceRate: 0,
      totalSubmissions: 0,
      totalAccepted: 0,
      likes: 0,
      dislikes: 0,
      isPublished: true,
      createdBy: proposal.proposedBy,
    });

    // Mark proposal as approved
    await ctx.db.patch(args.proposalId, {
      status: "approved",
      reviewedBy: args.userId,
      reviewedAt: Date.now(),
      reviewNote: args.reviewNote,
    });

    return { success: true };
  },
});

// ===== Admin: reject proposal =====
export const reject = mutation({
  args: {
    userId: v.string(),
    proposalId: v.id("challengeProposals"),
    reviewNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("challengeAdmins")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (!admin) throw new Error("Unauthorized");

    const proposal = await ctx.db.get(args.proposalId);
    if (!proposal) throw new Error("Proposal not found");
    if (proposal.status !== "pending") throw new Error("Proposal already reviewed");

    await ctx.db.patch(args.proposalId, {
      status: "rejected",
      reviewedBy: args.userId,
      reviewedAt: Date.now(),
      reviewNote: args.reviewNote || "Proposal does not meet requirements.",
    });

    return { success: true };
  },
});
