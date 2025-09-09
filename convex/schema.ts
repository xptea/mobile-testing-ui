import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    profilePicture: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_clerk_id", ["clerkId"]),
  
  userPreferences: defineTable({
    userId: v.optional(v.id("users")),
    themeMode: v.union(v.literal("auto"), v.literal("light"), v.literal("dark")),
  }).index("by_user", ["userId"]),
});