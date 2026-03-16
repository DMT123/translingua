import { v } from "convex/values";
import { query, mutation, internalMutation, internalQuery } from "./_generated/server";

export const getByClerkId = query({
  args: { clerkId: v.string() },
  returns: v.union(v.null(), v.object({
    _id: v.id("users"),
    _creationTime: v.number(),
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    plan: v.union(v.literal("free"), v.literal("pro"), v.literal("team"), v.literal("enterprise")),
    stripeCustomerId: v.optional(v.string()),
    storageQuota: v.object({ db: v.number(), file: v.number() }),
    storageUsed: v.object({ db: v.number(), file: v.number() }),
    preferences: v.object({ defaultSourceLang: v.string(), defaultTargetLang: v.string() }),
  })),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});

export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});

export const internalGetById = internalQuery({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const syncUser = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: args.email,
        name: args.name,
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      plan: "free",
      storageQuota: { db: 100 * 1024 * 1024, file: 500 * 1024 * 1024 },
      storageUsed: { db: 0, file: 0 },
      preferences: { defaultSourceLang: "en", defaultTargetLang: "es" },
    });
  },
});

export const updatePreferences = mutation({
  args: {
    defaultSourceLang: v.string(),
    defaultTargetLang: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, {
      preferences: {
        defaultSourceLang: args.defaultSourceLang,
        defaultTargetLang: args.defaultTargetLang,
      },
    });
  },
});
