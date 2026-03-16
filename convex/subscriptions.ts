import { v } from "convex/values";
import { query, internalMutation } from "./_generated/server";

export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return null;

    return await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .first();
  },
});

export const handleWebhook = internalMutation({
  args: {
    payload: v.string(),
    signature: v.string(),
  },
  handler: async (ctx, args) => {
    const event = JSON.parse(args.payload);
    const type = event.type as string;

    if (type === "customer.subscription.created" || type === "customer.subscription.updated") {
      const sub = event.data.object;
      const stripeCustomerId = sub.customer as string;

      const user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("stripeCustomerId"), stripeCustomerId))
        .first();

      if (!user) return;

      const existing = await ctx.db
        .query("subscriptions")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .first();

      const planMap: Record<string, string> = {};
      const plan = planMap[sub.items?.data?.[0]?.price?.id] ?? "pro";

      const subData = {
        userId: user._id,
        stripeSubscriptionId: sub.id,
        plan,
        status: sub.status === "active" ? "active" as const
          : sub.status === "past_due" ? "past_due" as const
          : "cancelled" as const,
        currentPeriodEnd: sub.current_period_end * 1000,
        storageDbQuota: plan === "team" ? 10 * 1024 * 1024 * 1024
          : plan === "enterprise" ? Infinity
          : 2 * 1024 * 1024 * 1024,
        storageFileQuota: plan === "team" ? 25 * 1024 * 1024 * 1024
          : plan === "enterprise" ? Infinity
          : 5 * 1024 * 1024 * 1024,
      };

      if (existing) {
        await ctx.db.patch(existing._id, subData);
      } else {
        await ctx.db.insert("subscriptions", subData);
      }

      await ctx.db.patch(user._id, { plan: plan as "free" | "pro" | "team" | "enterprise" });
    }

    if (type === "customer.subscription.deleted") {
      const sub = event.data.object;
      const stripeCustomerId = sub.customer as string;

      const user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("stripeCustomerId"), stripeCustomerId))
        .first();

      if (!user) return;

      const existing = await ctx.db
        .query("subscriptions")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, { status: "cancelled" });
      }

      await ctx.db.patch(user._id, {
        plan: "free",
        storageQuota: { db: 100 * 1024 * 1024, file: 500 * 1024 * 1024 },
      });
    }
  },
});
