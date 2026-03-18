import { v } from "convex/values";
import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";

/**
 * Require the caller to be an admin user.
 * Throws "Forbidden" if the caller is not an admin.
 */
export const requireAdmin = async (ctx: QueryCtx | MutationCtx) => {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Unauthenticated");
  }

  const caller = await ctx.db
    .query("users")
    .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
    .first();

  if (!caller) {
    throw new Error("User not found");
  }

  if (caller.role !== "admin") {
    throw new Error("Forbidden");
  }
};

export const syncUser = mutation({
  args: {
    userId: v.string(),
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    if (!existingUser) {
      await ctx.db.insert("users", {
        userId: args.userId,
        email: args.email,
        name: args.name,
        isPro: false,
        isCheater: false,
      });
    }
  },
});

export const getUser = query({
  args: { userId: v.string() },

  handler: async (ctx, args) => {
    if (!args.userId) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    if (!user) return null;

    if (!user.isCheater) {
      user.isCheater = false;
    }

    return user;
  },
});

export const upgradeToPro = mutation({
  args: {
    email: v.string(),
    lemonSqueezyCustomerId: v.optional(v.string()),
    lemonSqueezyOrderId: v.optional(v.string()),
    amount: v.optional(v.number()),
    isCheater: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Require admin privileges
    await requireAdmin(ctx);

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, {
      isPro: true,
      proSince: Date.now(),
      lemonSqueezyCustomerId: args.lemonSqueezyCustomerId,
      lemonSqueezyOrderId: args.lemonSqueezyOrderId,
      isCheater: args.isCheater ?? user.isCheater ?? false,
    });

    return { success: true };
  },
});

export const setUserRole = mutation({
  args: {
    targetUserId: v.string(),
    role: v.union(v.literal("user"), v.literal("moderator"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    // Require admin privileges
    await requireAdmin(ctx);

    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", args.targetUserId))
      .first();

    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, {
      role: args.role,
    });

    return { success: true };
  },
});

// Ensure user exists in Convex — called on app load to backfill missing users
export const ensureUser = mutation({
  args: {
    userId: v.string(),
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .unique();

    if (existing) {
      // Update name/email if changed in Clerk
      if (existing.email !== args.email || existing.name !== args.name) {
        await ctx.db.patch(existing._id, {
          email: args.email,
          name: args.name,
        });
      }
      return existing._id;
    }

    // Create new user
    return ctx.db.insert("users", {
      userId: args.userId,
      email: args.email,
      name: args.name,
      isPro: false,
      isCheater: false,
    });
  },
});

// List all users (for admin panel)
export const listAllUsers = query({
  handler: async (ctx) => {
    // Require admin privileges
    await requireAdmin(ctx);

    return ctx.db.query("users").collect();
  },
});

// Block/unblock a user (sets isCheater field)
export const blockUser = mutation({
  args: {
    adminId: v.string(),
    targetUserId: v.string(),
    blocked: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Verify adminId is a true admin
    const admin = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", args.adminId))
      .first();

    if (!admin || admin.role !== "admin") {
      throw new Error("Only platform admins can block/unblock users");
    }

    const targetUser = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", args.targetUserId))
      .first();

    if (!targetUser) throw new Error("User not found");

    await ctx.db.patch(targetUser._id, { isCheater: args.blocked });
    return { success: true };
  },
});

// Get user's full role info (both systems)
export const getUserRoles = query({
  args: { targetUserId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", args.targetUserId))
      .first();

    const challengeAdmin = await ctx.db
      .query("challengeAdmins")
      .withIndex("by_user", (q) => q.eq("userId", args.targetUserId))
      .unique();

    return {
      userRole: user?.role ?? "user",
      challengeRole: challengeAdmin?.role ?? null,
      isBlocked: user?.isCheater ?? false,
    };
  },
});

// Set user's platform role (admin only)
export const setUserPlatformRole = mutation({
  args: {
    adminId: v.string(),
    targetUserId: v.string(),
    role: v.union(v.literal("user"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    // Verify adminId is a true admin
    const admin = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", args.adminId))
      .first();

    if (!admin || admin.role !== "admin") {
      throw new Error("Only platform admins can change platform roles");
    }

    const targetUser = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", args.targetUserId))
      .first();

    if (!targetUser) throw new Error("User not found");

    await ctx.db.patch(targetUser._id, { role: args.role });
    return { success: true };
  },
});

// Toggle Pro status for a user (admin only)
export const setUserPro = mutation({
  args: {
    adminId: v.string(),
    targetUserId: v.string(),
    isPro: v.boolean(),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", args.adminId))
      .first();

    if (!admin || admin.role !== "admin") {
      throw new Error("Only platform admins can change Pro status");
    }

    const targetUser = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", args.targetUserId))
      .first();

    if (!targetUser) throw new Error("User not found");

    await ctx.db.patch(targetUser._id, {
      isPro: args.isPro,
      proSince: args.isPro ? Date.now() : undefined,
    });
    return { success: true };
  },
});

// List all users with their roles (admin only)
export const listAllUsersWithRoles = query({
  args: { adminId: v.string() },
  handler: async (ctx, args) => {
    // Verify adminId is a true admin
    const admin = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", args.adminId))
      .first();

    if (!admin || admin.role !== "admin") {
      return [];
    }

    const users = await ctx.db.query("users").collect();
    const challengeAdmins = await ctx.db.query("challengeAdmins").collect();

    // Build a map of userId -> challengeAdmin role
    const challengeRoleMap = new Map<string, string>();
    for (const ca of challengeAdmins) {
      challengeRoleMap.set(ca.userId, ca.role);
    }

    return users.map((u) => ({
      ...u,
      challengeRole: challengeRoleMap.get(u.userId) ?? null,
    }));
  },
});

