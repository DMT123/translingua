import { v } from "convex/values";
import { query, internalMutation } from "./_generated/server";

export const getByTranslation = query({
  args: { translationId: v.id("translations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("emailEvents")
      .withIndex("by_translationId", (q) =>
        q.eq("translationId", args.translationId)
      )
      .collect();
  },
});

export const create = internalMutation({
  args: {
    translationId: v.optional(v.id("translations")),
    userId: v.optional(v.id("users")),
    emailType: v.union(
      v.literal("confirmation"),
      v.literal("receipt"),
      v.literal("quota_warning"),
      v.literal("storage_alert"),
      v.literal("export_ready"),
      v.literal("cancellation")
    ),
    resendMessageId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("emailEvents", {
      translationId: args.translationId,
      userId: args.userId,
      emailType: args.emailType,
      resendMessageId: args.resendMessageId,
      status: "sent",
    });
  },
});

export const updateStatus = internalMutation({
  args: {
    resendMessageId: v.string(),
    status: v.union(
      v.literal("delivered"),
      v.literal("opened"),
      v.literal("bounced"),
      v.literal("failed")
    ),
    deliveredAt: v.optional(v.number()),
    openedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db
      .query("emailEvents")
      .filter((q) =>
        q.eq(q.field("resendMessageId"), args.resendMessageId)
      )
      .first();

    if (event) {
      await ctx.db.patch(event._id, {
        status: args.status,
        deliveredAt: args.deliveredAt,
        openedAt: args.openedAt,
      });
    }
  },
});

export const retryFailed = internalMutation({
  args: {},
  handler: async (ctx) => {
    const failed = await ctx.db
      .query("emailEvents")
      .filter((q) => q.eq(q.field("status"), "failed"))
      .order("desc")
      .take(50);

    for (const event of failed) {
      await ctx.db.patch(event._id, { status: "sent" });
    }

    return failed.length;
  },
});
