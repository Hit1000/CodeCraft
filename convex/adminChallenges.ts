import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ===== Check if user is admin =====
export const isAdmin = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    if (!args.userId) return false;
    const admin = await ctx.db
      .query("challengeAdmins")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
    return !!admin;
  },
});

export const getAdminRole = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    if (!args.userId) return null;
    return ctx.db
      .query("challengeAdmins")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
  },
});

// ===== Bootstrap first admin (run once when no admins exist) =====
export const bootstrapAdmin = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const anyAdmin = await ctx.db.query("challengeAdmins").first();
    if (anyAdmin) {
      throw new Error("Admin already exists. Use grantAdmin instead.");
    }

    return ctx.db.insert("challengeAdmins", {
      userId: args.userId,
      role: "admin",
      grantedBy: "system",
      grantedAt: Date.now(),
    });
  },
});

// ===== Grant admin role (only existing admins can) =====
export const grantAdmin = mutation({
  args: {
    granterId: v.string(),
    targetUserId: v.string(),
    role: v.union(v.literal("admin"), v.literal("moderator")),
  },
  handler: async (ctx, args) => {
    const granter = await ctx.db
      .query("challengeAdmins")
      .withIndex("by_user", (q) => q.eq("userId", args.granterId))
      .unique();

    if (!granter || granter.role !== "admin") {
      throw new Error("Only admins can grant roles");
    }

    const existing = await ctx.db
      .query("challengeAdmins")
      .withIndex("by_user", (q) => q.eq("userId", args.targetUserId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { role: args.role });
      return existing._id;
    }

    return ctx.db.insert("challengeAdmins", {
      userId: args.targetUserId,
      role: args.role,
      grantedBy: args.granterId,
      grantedAt: Date.now(),
    });
  },
});

// ===== Create Problem =====
export const createChallenge = mutation({
  args: {
    userId: v.string(),
    title: v.string(),
    slug: v.string(),
    difficulty: v.union(v.literal("Easy"), v.literal("Medium"), v.literal("Hard")),
    category: v.string(),
    subcategory: v.string(),
    tags: v.array(v.string()),
    description: v.string(),
    descriptionImages: v.optional(v.array(v.id("_storage"))),
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
    driverCode: v.object({
      python: v.optional(v.string()),
      javascript: v.optional(v.string()),
      typescript: v.optional(v.string()),
      java: v.optional(v.string()),
      cpp: v.optional(v.string()),
    }),
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
    editorialImages: v.optional(v.array(v.id("_storage"))),
    timeLimit: v.number(),
    memoryLimit: v.number(),
    order: v.number(),
    isPremium: v.boolean(),
    isPublished: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Verify admin
    const admin = await ctx.db
      .query("challengeAdmins")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (!admin) {
      throw new Error("Unauthorized: Admin access required");
    }

    // Check slug uniqueness
    const existing = await ctx.db
      .query("challenges")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (existing) {
      throw new Error(`A challenge with slug "${args.slug}" already exists`);
    }

    const { userId, ...challengeData } = args;

    return ctx.db.insert("challenges", {
      ...challengeData,
      acceptanceRate: 0,
      totalSubmissions: 0,
      totalAccepted: 0,
      likes: 0,
      dislikes: 0,
      createdBy: userId,
    });
  },
});

// ===== Update Problem =====
export const updateChallenge = mutation({
  args: {
    userId: v.string(),
    challengeId: v.id("challenges"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    difficulty: v.optional(v.union(v.literal("Easy"), v.literal("Medium"), v.literal("Hard"))),
    category: v.optional(v.string()),
    subcategory: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    description: v.optional(v.string()),
    descriptionImages: v.optional(v.array(v.id("_storage"))),
    examples: v.optional(
      v.array(
        v.object({
          input: v.string(),
          output: v.string(),
          explanation: v.optional(v.string()),
        })
      )
    ),
    constraints: v.optional(v.array(v.string())),
    starterCode: v.optional(
      v.object({
        python: v.optional(v.string()),
        javascript: v.optional(v.string()),
        typescript: v.optional(v.string()),
        java: v.optional(v.string()),
        cpp: v.optional(v.string()),
      })
    ),
    driverCode: v.optional(
      v.object({
        python: v.optional(v.string()),
        javascript: v.optional(v.string()),
        typescript: v.optional(v.string()),
        java: v.optional(v.string()),
        cpp: v.optional(v.string()),
      })
    ),
    testCases: v.optional(
      v.array(
        v.object({
          id: v.string(),
          input: v.string(),
          expectedOutput: v.string(),
          isHidden: v.boolean(),
        })
      )
    ),
    hints: v.optional(v.array(v.string())),
    editorial: v.optional(v.string()),
    editorialImages: v.optional(v.array(v.id("_storage"))),
    timeLimit: v.optional(v.number()),
    memoryLimit: v.optional(v.number()),
    order: v.optional(v.number()),
    isPremium: v.optional(v.boolean()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("challengeAdmins")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (!admin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const { userId, challengeId, ...updates } = args;

    // Filter out undefined values
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cleanUpdates: Record<string, any> = { updatedBy: userId };
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    }

    await ctx.db.patch(challengeId, cleanUpdates);
    return challengeId;
  },
});

// ===== Delete Problem =====
export const deleteChallenge = mutation({
  args: {
    userId: v.string(),
    challengeId: v.id("challenges"),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("challengeAdmins")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Only admins can delete challenges");
    }

    // Delete associated submissions
    const submissions = await ctx.db
      .query("challengeSubmissions")
      .withIndex("by_challenge", (q) => q.eq("challengeId", args.challengeId))
      .collect();

    for (const sub of submissions) {
      await ctx.db.delete(sub._id);
    }

    // Delete associated progress
    const progress = await ctx.db.query("challengeProgress").collect();
    for (const p of progress) {
      if (p.challengeId === args.challengeId) {
        await ctx.db.delete(p._id);
      }
    }

    await ctx.db.delete(args.challengeId);
  },
});

// ===== List all problems (admin view - includes unpublished) =====
export const listAll = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("challengeAdmins")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (!admin) return [];

    return ctx.db
      .query("challenges")
      .withIndex("by_order")
      .collect();
  },
});

// ===== Get single problem with full data (admin view) =====
export const getFullChallenge = query({
  args: {
    userId: v.string(),
    challengeId: v.id("challenges"),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("challengeAdmins")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (!admin) throw new Error("Unauthorized");

    return ctx.db.get(args.challengeId);
  },
});

// ===== Revoke admin role =====
export const revokeAdmin = mutation({
  args: {
    granterId: v.string(),
    targetUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const granter = await ctx.db
      .query("challengeAdmins")
      .withIndex("by_user", (q) => q.eq("userId", args.granterId))
      .unique();

    if (!granter || granter.role !== "admin") {
      throw new Error("Only admins can revoke roles");
    }

    // Prevent self-revocation
    if (args.granterId === args.targetUserId) {
      throw new Error("Cannot revoke your own admin role");
    }

    const target = await ctx.db
      .query("challengeAdmins")
      .withIndex("by_user", (q) => q.eq("userId", args.targetUserId))
      .unique();

    if (!target) throw new Error("User is not an admin");

    await ctx.db.delete(target._id);
    return { success: true };
  },
});

// ===== List all admins =====
export const listAdmins = query({
  handler: async (ctx) => {
    return ctx.db.query("challengeAdmins").collect();
  },
});
