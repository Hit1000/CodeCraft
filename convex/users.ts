import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Require the caller to be an admin user.
 * Throws "Forbidden" if the caller is not an admin.
 */
export const requireAdmin = async (ctx: any) => {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Unauthenticated");
  }

  const caller = await ctx.db
    .query("users")
    .withIndex("by_user_id", (q: any) => q.eq("userId", identity.subject))
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

