import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    const eventType = body.type as string;

    if (eventType === "user.created" || eventType === "user.updated") {
      const { id, email_addresses, first_name, last_name } = body.data;
      const primaryEmail = email_addresses?.[0]?.email_address ?? "";
      const name = [first_name, last_name].filter(Boolean).join(" ") || "User";

      await ctx.runMutation(internal.users.syncUser, {
        clerkId: id,
        email: primaryEmail,
        name,
      });
    }

    return new Response("OK", { status: 200 });
  }),
});

http.route({
  path: "/stripe-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.text();
    const sig = request.headers.get("stripe-signature");

    if (!sig) {
      return new Response("Missing stripe-signature", { status: 400 });
    }

    await ctx.runMutation(internal.subscriptions.handleWebhook, {
      payload: body,
      signature: sig,
    });

    return new Response("OK", { status: 200 });
  }),
});

http.route({
  path: "/resend-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    const eventType = body.type as string;
    const messageId = body.data?.email_id as string;

    if (messageId) {
      await ctx.runMutation(internal.emailEvents.updateStatus, {
        resendMessageId: messageId,
        status: eventType === "email.delivered"
          ? "delivered"
          : eventType === "email.opened"
            ? "opened"
            : eventType === "email.bounced"
              ? "bounced"
              : "failed",
        deliveredAt: eventType === "email.delivered" ? Date.now() : undefined,
        openedAt: eventType === "email.opened" ? Date.now() : undefined,
      });
    }

    return new Response("OK", { status: 200 });
  }),
});

export default http;
