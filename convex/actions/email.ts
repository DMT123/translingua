"use node";

import { v } from "convex/values";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";

export const sendConfirmation = action({
  args: { translationId: v.id("translations") },
  handler: async (ctx, args): Promise<{ messageId: string }> => {
    const translation: any = await ctx.runQuery(
      internal.translations.internalGetById as any,
      { id: args.translationId }
    );
    if (!translation) throw new Error("Translation not found");

    const user: any = await ctx.runQuery(internal.users.internalGetById as any, {
      id: translation.userId,
    });
    if (!user) throw new Error("User not found");

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const confirmUrl = `${appUrl}/confirm/${translation.confirmationToken}?id=${args.translationId}`;
    const cancelUrl = `${appUrl}/confirm/${translation.confirmationToken}?id=${args.translationId}&action=cancel`;

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error("RESEND_API_KEY not configured");

    const response: Response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "TransLingua <noreply@translingua.app>",
        to: [user.email],
        subject: `Confirm Translation — Estimated Cost: £${translation.estimatedCost.toFixed(4)}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 0;">
            <div style="background: linear-gradient(135deg, #3b82f6, #6366f1); padding: 2px; border-radius: 12px;">
              <div style="background: #0f1219; border-radius: 10px; padding: 32px;">
                <h1 style="color: #fff; font-size: 20px; margin: 0 0 16px;">Translation Confirmation</h1>
                <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6; margin: 0 0 8px;">
                  You requested a translation of <strong style="color: #e4e4e7;">${translation.characterCount.toLocaleString()} characters</strong>
                  from <strong style="color: #e4e4e7;">${translation.sourceLang}</strong>
                  to <strong style="color: #e4e4e7;">${translation.targetLang}</strong>.
                </p>
                <p style="color: #a1a1aa; font-size: 14px; margin: 0 0 24px;">
                  Estimated cost: <strong style="color: #60a5fa; font-size: 18px;">£${translation.estimatedCost.toFixed(4)}</strong>
                </p>
                ${translation.confirmationCode ? `<p style="color: #71717a; font-size: 12px; margin: 0 0 24px;">Confirmation code: <code style="color: #e4e4e7; background: #27272a; padding: 2px 6px; border-radius: 4px;">${translation.confirmationCode}</code></p>` : ""}
                <div style="margin: 24px 0;">
                  <a href="${confirmUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #6366f1); color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                    Confirm Translation
                  </a>
                  <a href="${cancelUrl}" style="display: inline-block; color: #71717a; padding: 12px 20px; text-decoration: none; font-size: 13px; margin-left: 8px;">
                    Cancel
                  </a>
                </div>
                <p style="color: #52525b; font-size: 12px; margin: 24px 0 0;">This confirmation expires in 30 minutes.</p>
              </div>
            </div>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Resend error: ${err}`);
    }

    const data: any = await response.json();

    await ctx.runMutation(internal.emailEvents.create, {
      translationId: args.translationId,
      userId: translation.userId,
      emailType: "confirmation",
      resendMessageId: data.id,
    });

    return { messageId: data.id };
  },
});

export const sendReceipt = action({
  args: { translationId: v.id("translations") },
  handler: async (ctx, args) => {
    const translation = await ctx.runQuery(
      internal.translations.internalGetById as any,
      { id: args.translationId }
    );
    if (!translation) throw new Error("Translation not found");

    const user = await ctx.runQuery(internal.users.internalGetById as any, {
      id: translation.userId,
    });
    if (!user) throw new Error("User not found");

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error("RESEND_API_KEY not configured");

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "TransLingua <noreply@translingua.app>",
        to: [user.email],
        subject: "Translation Complete — Receipt",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 0;">
            <div style="background: #0f1219; border: 1px solid #27272a; border-radius: 12px; padding: 32px;">
              <h1 style="color: #fff; font-size: 20px; margin: 0 0 16px;">Translation Complete</h1>
              <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6;">
                Your translation of ${translation.characterCount.toLocaleString()} characters
                (${translation.sourceLang} → ${translation.targetLang}) has completed.
              </p>
              <p style="color: #a1a1aa; font-size: 14px;">
                Actual cost: <strong style="color: #34d399;">£${translation.estimatedCost.toFixed(4)}</strong>
              </p>
            </div>
          </div>
        `,
      }),
    });

    if (!response.ok) throw new Error("Failed to send receipt email");

    const data = await response.json();
    await ctx.runMutation(internal.emailEvents.create, {
      translationId: args.translationId,
      userId: translation.userId,
      emailType: "receipt",
      resendMessageId: data.id,
    });
  },
});

export const sendQuotaWarning = action({
  args: {
    userId: v.id("users"),
    metricType: v.string(),
    usagePercent: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.internalGetById as any, {
      id: args.userId,
    });
    if (!user) throw new Error("User not found");

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error("RESEND_API_KEY not configured");

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "TransLingua <noreply@translingua.app>",
        to: [user.email],
        subject: `Usage Alert: ${args.metricType} at ${args.usagePercent.toFixed(0)}%`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 0;">
            <div style="background: #0f1219; border: 1px solid ${args.usagePercent >= 95 ? "#ef4444" : "#f59e0b"}33; border-radius: 12px; padding: 32px;">
              <h1 style="color: #fff; font-size: 20px; margin: 0 0 16px;">Usage Alert</h1>
              <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6;">
                Your <strong style="color: #e4e4e7;">${args.metricType}</strong> usage has reached
                <strong style="color: ${args.usagePercent >= 95 ? "#ef4444" : "#f59e0b"};">${args.usagePercent.toFixed(0)}%</strong>
                of your ${user.plan} plan limit.
              </p>
              <p style="color: #71717a; font-size: 13px; margin-top: 16px;">
                Upgrade your plan to increase limits and avoid overages.
              </p>
            </div>
          </div>
        `,
      }),
    });

    if (!response.ok) throw new Error("Failed to send quota warning");

    const data = await response.json();
    await ctx.runMutation(internal.emailEvents.create, {
      userId: args.userId,
      emailType: "quota_warning",
      resendMessageId: data.id,
    });
  },
});
