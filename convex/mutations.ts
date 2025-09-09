import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// User management mutations
export const createOrUpdateUser = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    profilePicture: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    const now = Date.now();

    if (existing) {
      // Update existing user
      await ctx.db.patch(existing._id, {
        name: args.name,
        email: args.email,
        profilePicture: args.profilePicture,
        updatedAt: now,
      });
      return existing._id;
    } else {
      // Create new user
      const userId = await ctx.db.insert("users", {
        clerkId: args.clerkId,
        name: args.name,
        email: args.email,
        profilePicture: args.profilePicture,
        createdAt: now,
        updatedAt: now,
      });
      return userId;
    }
  },
});

export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

export const saveThemeMode = mutation({
  args: {
    userId: v.optional(v.id("users")),
    themeMode: v.union(v.literal("auto"), v.literal("light"), v.literal("dark")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { themeMode: args.themeMode });
    } else {
      await ctx.db.insert("userPreferences", {
        userId: args.userId,
        themeMode: args.themeMode,
      });
    }
  },
});

export const getThemeMode = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    const pref = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
    return pref?.themeMode || null;
  },
});
