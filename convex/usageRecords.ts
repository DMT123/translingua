import { v } from "convex/values";
import { query, internalMutation } from "./_generated/server";

export const getCurrentPeriod = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return null;

    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .first();

    const periodStart = sub
      ? sub.currentPeriodEnd - 30 * 24 * 60 * 60 * 1000
      : Date.now() - 30 * 24 * 60 * 60 * 1000;

    const records = await ctx.db
      .query("usageRecords")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const filtered = records.filter((r) => r.timestamp >= periodStart);

    const breakdown = {
      translation_text: 0,
      translation_voice: 0,
      ocr_extraction: 0,
      document_export: 0,
      storage_db_gb: 0,
      storage_file_gb: 0,
      bandwidth_gb: 0,
    };

    for (const record of filtered) {
      breakdown[record.eventType] += record.quantity;
    }

    return {
      periodStart,
      periodEnd: sub?.currentPeriodEnd ?? Date.now() + 30 * 24 * 60 * 60 * 1000,
      breakdown,
      plan: user.plan,
    };
  },
});

export const record = internalMutation({
  args: {
    userId: v.id("users"),
    eventType: v.union(
      v.literal("translation_text"),
      v.literal("translation_voice"),
      v.literal("ocr_extraction"),
      v.literal("document_export"),
      v.literal("storage_db_gb"),
      v.literal("storage_file_gb"),
      v.literal("bandwidth_gb")
    ),
    quantity: v.number(),
    unit: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("usageRecords", {
      userId: args.userId,
      eventType: args.eventType,
      quantity: args.quantity,
      unit: args.unit,
      timestamp: Date.now(),
    });
  },
});
