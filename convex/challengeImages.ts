import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Generate upload URL for images (admin only)
export const generateUploadUrl = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("challengeAdmins")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (!admin) {
      throw new Error("Unauthorized: Admin access required");
    }

    return ctx.storage.generateUploadUrl();
  },
});

// Get image URL from storage ID
export const getImageUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return ctx.storage.getUrl(args.storageId);
  },
});

// Get multiple image URLs
export const getImageUrls = query({
  args: { storageIds: v.array(v.id("_storage")) },
  handler: async (ctx, args) => {
    const urls: Record<string, string | null> = {};
    for (const id of args.storageIds) {
      urls[id] = await ctx.storage.getUrl(id);
    }
    return urls;
  },
});

// Delete an image (admin only)
export const deleteImage = mutation({
  args: {
    userId: v.string(),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("challengeAdmins")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (!admin) {
      throw new Error("Unauthorized");
    }

    await ctx.storage.delete(args.storageId);
  },
});
