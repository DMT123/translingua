"use node";

import { v } from "convex/values";
import { action } from "../_generated/server";

export const emitUsageEvent = action({
  args: {
    userId: v.id("users"),
    eventType: v.string(),
    quantity: v.number(),
    stripeCustomerId: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      console.warn("STRIPE_SECRET_KEY not configured, skipping usage emit");
      return;
    }

    const response = await fetch("https://api.stripe.com/v1/billing/meter_events", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        event_name: args.eventType,
        "payload[stripe_customer_id]": args.stripeCustomerId,
        "payload[value]": args.quantity.toString(),
        timestamp: Math.floor(Date.now() / 1000).toString(),
      }).toString(),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Stripe meter event error:", err);
    }
  },
});

export const emitStorageEvent = action({
  args: {
    userId: v.id("users"),
    dbGB: v.number(),
    fileGB: v.number(),
    stripeCustomerId: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      console.warn("STRIPE_SECRET_KEY not configured, skipping storage emit");
      return;
    }

    for (const [type, value] of [
      ["storage_db_gb", args.dbGB],
      ["storage_file_gb", args.fileGB],
    ] as const) {
      if (value <= 0) continue;

      await fetch("https://api.stripe.com/v1/billing/meter_events", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          event_name: type,
          "payload[stripe_customer_id]": args.stripeCustomerId,
          "payload[value]": value.toString(),
          timestamp: Math.floor(Date.now() / 1000).toString(),
        }).toString(),
      });
    }
  },
});
