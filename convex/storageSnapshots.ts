import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

export const record = internalMutation({
  args: {
    userId: v.id("users"),
    dbSizeBytes: v.number(),
    fileSizeBytes: v.number(),
  },
  handler: async (ctx, args) => {
    const totalBytes = args.dbSizeBytes + args.fileSizeBytes;
    const snapshotDate = new Date().toISOString().split("T")[0];

    const existing = await ctx.db
      .query("storageSnapshots")
      .withIndex("by_userId_snapshotDate", (q) =>
        q.eq("userId", args.userId).eq("snapshotDate", snapshotDate)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        dbSizeBytes: args.dbSizeBytes,
        fileSizeBytes: args.fileSizeBytes,
        totalBytes,
        emittedToStripe: false,
      });
      return existing._id;
    }

    return await ctx.db.insert("storageSnapshots", {
      userId: args.userId,
      dbSizeBytes: args.dbSizeBytes,
      fileSizeBytes: args.fileSizeBytes,
      totalBytes,
      snapshotDate,
      emittedToStripe: false,
    });
  },
});

export const dailySnapshotAll = internalMutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    for (const user of users) {
      const snapshotDate = new Date().toISOString().split("T")[0];
      const existing = await ctx.db
        .query("storageSnapshots")
        .withIndex("by_userId_snapshotDate", (q) =>
          q.eq("userId", user._id).eq("snapshotDate", snapshotDate)
        )
        .unique();

      if (!existing) {
        await ctx.db.insert("storageSnapshots", {
          userId: user._id,
          dbSizeBytes: user.storageUsed.db,
          fileSizeBytes: user.storageUsed.file,
          totalBytes: user.storageUsed.db + user.storageUsed.file,
          snapshotDate,
          emittedToStripe: false,
        });
      }
    }
  },
});

export const getUnemitted = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("storageSnapshots")
      .filter((q) => q.eq(q.field("emittedToStripe"), false))
      .collect();
  },
});

export const markEmitted = internalMutation({
  args: { id: v.id("storageSnapshots") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { emittedToStripe: true });
  },
});
