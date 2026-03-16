import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";

export const getByTranslation = query({
  args: { translationId: v.id("translations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("documents")
      .withIndex("by_translationId", (q) =>
        q.eq("translationId", args.translationId)
      )
      .collect();
  },
});

export const createExport = mutation({
  args: {
    translationId: v.id("translations"),
    format: v.union(
      v.literal("docx"),
      v.literal("pdf"),
      v.literal("html"),
      v.literal("txt")
    ),
    securityScanResult: v.object({
      checks: v.array(
        v.object({
          name: v.string(),
          status: v.union(
            v.literal("pass"),
            v.literal("warn"),
            v.literal("fail")
          ),
        })
      ),
      overall: v.string(),
    }),
    sizeBytes: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const translation = await ctx.db.get(args.translationId);
    if (!translation) throw new Error("Translation not found");
    if (translation.status !== "complete") {
      throw new Error("Translation must be complete before export");
    }

    const hasBlockingFail = args.securityScanResult.checks.some(
      (c) => c.status === "fail"
    );
    if (hasBlockingFail) {
      throw new Error("Security scan has blocking failures");
    }

    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

    const id = await ctx.db.insert("documents", {
      translationId: args.translationId,
      format: args.format,
      securityScanResult: args.securityScanResult,
      sizeBytes: args.sizeBytes,
      expiresAt,
    });

    return id;
  },
});

export const autoPurge = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expired = await ctx.db
      .query("documents")
      .filter((q) => q.lt(q.field("expiresAt"), now))
      .collect();

    for (const doc of expired) {
      if (doc.fileStorageId) {
        try {
          await ctx.storage.delete(doc.fileStorageId as any);
        } catch {
          // Storage may already be cleaned up
        }
      }
      await ctx.db.delete(doc._id);
    }

    return expired.length;
  },
});
