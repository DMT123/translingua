import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getByUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return [];

    return await ctx.db
      .query("glossaries")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("glossaries") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    sourceLang: v.string(),
    targetLang: v.string(),
    entries: v.array(v.object({ source: v.string(), target: v.string() })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    const existingGlossaries = await ctx.db
      .query("glossaries")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const limits: Record<string, number> = {
      free: 1,
      pro: 10,
      team: Infinity,
      enterprise: Infinity,
    };

    if (existingGlossaries.length >= (limits[user.plan] ?? 1)) {
      throw new Error(`Glossary limit reached for ${user.plan} plan`);
    }

    const sizeBytes = new TextEncoder().encode(JSON.stringify(args.entries)).length;

    return await ctx.db.insert("glossaries", {
      userId: user._id,
      name: args.name,
      sourceLang: args.sourceLang,
      targetLang: args.targetLang,
      entries: args.entries,
      sizeBytes,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("glossaries"),
    name: v.optional(v.string()),
    entries: v.optional(
      v.array(v.object({ source: v.string(), target: v.string() }))
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const glossary = await ctx.db.get(args.id);
    if (!glossary) throw new Error("Glossary not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || glossary.userId !== user._id) throw new Error("Unauthorized");

    const updates: Record<string, unknown> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.entries !== undefined) {
      updates.entries = args.entries;
      updates.sizeBytes = new TextEncoder().encode(
        JSON.stringify(args.entries)
      ).length;
    }

    await ctx.db.patch(args.id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("glossaries") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const glossary = await ctx.db.get(args.id);
    if (!glossary) throw new Error("Glossary not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || glossary.userId !== user._id) throw new Error("Unauthorized");

    await ctx.db.delete(args.id);
  },
});
