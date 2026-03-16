import { v } from "convex/values";
import { query, mutation, internalMutation, internalQuery } from "./_generated/server";

export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("translations")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const getByCurrentUser = query({
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
      .query("translations")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("translations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getPending = query({
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
      .query("translations")
      .withIndex("by_userId_status", (q) =>
        q.eq("userId", user._id).eq("status", "awaiting_confirmation")
      )
      .collect();
  },
});

export const create = mutation({
  args: {
    sourceText: v.string(),
    sourceLang: v.string(),
    targetLang: v.string(),
    mode: v.union(v.literal("text"), v.literal("voice"), v.literal("image")),
    structureMap: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    const characterCount = args.sourceText.length;
    const sizeBytes = new TextEncoder().encode(args.sourceText).length;
    const estimatedCost = (characterCount / 1000) * 0.002;

    const thresholds: Record<string, number> = {
      free: 500,
      pro: 10_000,
      team: 50_000,
      enterprise: Infinity,
    };

    const threshold = thresholds[user.plan] ?? 500;
    const requiresConfirmation = characterCount > threshold;

    const confirmationCode = requiresConfirmation
      ? Math.random().toString(36).substring(2, 8).toUpperCase()
      : undefined;
    const confirmationToken = requiresConfirmation
      ? crypto.randomUUID()
      : undefined;

    const expiresAt = Date.now() + 30 * 60 * 1000;

    const id = await ctx.db.insert("translations", {
      userId: user._id,
      sourceText: args.sourceText,
      sourceLang: args.sourceLang,
      targetLang: args.targetLang,
      mode: args.mode,
      status: requiresConfirmation ? "awaiting_confirmation" : "confirmed",
      characterCount,
      sizeBytes,
      structureMap: args.structureMap,
      estimatedCost,
      confirmationCode,
      confirmationToken,
      expiresAt,
    });

    return { id, requiresConfirmation, estimatedCost, confirmationCode };
  },
});

export const confirm = mutation({
  args: {
    id: v.id("translations"),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const translation = await ctx.db.get(args.id);
    if (!translation) throw new Error("Translation not found");
    if (translation.status !== "awaiting_confirmation") {
      throw new Error("Translation is not awaiting confirmation");
    }
    if (translation.confirmationToken !== args.token) {
      throw new Error("Invalid confirmation token");
    }
    if (Date.now() > translation.expiresAt) {
      await ctx.db.patch(args.id, { status: "cancelled" });
      throw new Error("Confirmation expired");
    }

    await ctx.db.patch(args.id, {
      status: "confirmed",
      confirmedAt: Date.now(),
    });

    return { success: true };
  },
});

export const cancel = mutation({
  args: { id: v.id("translations") },
  handler: async (ctx, args) => {
    const translation = await ctx.db.get(args.id);
    if (!translation) throw new Error("Translation not found");

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || translation.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    if (
      translation.status === "complete" ||
      translation.status === "cancelled"
    ) {
      throw new Error("Cannot cancel a completed or already cancelled translation");
    }

    await ctx.db.patch(args.id, { status: "cancelled" });
  },
});

export const internalGetById = internalQuery({
  args: { id: v.id("translations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const markProcessing = internalMutation({
  args: { id: v.id("translations") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: "processing" });
  },
});

export const markComplete = internalMutation({
  args: {
    id: v.id("translations"),
    translatedText: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "complete",
      translatedText: args.translatedText,
      completedAt: Date.now(),
    });
  },
});

export const markFailed = internalMutation({
  args: { id: v.id("translations") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: "failed" });
  },
});

export const expireStale = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const stale = await ctx.db
      .query("translations")
      .withIndex("by_status", (q) => q.eq("status", "awaiting_confirmation"))
      .collect();

    for (const t of stale) {
      if (now > t.expiresAt) {
        await ctx.db.patch(t._id, { status: "cancelled" });
      }
    }
  },
});
