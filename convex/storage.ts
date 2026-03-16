import { query } from "./_generated/server";

export const getCurrentUsage = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return null;

    return {
      db: user.storageUsed.db,
      file: user.storageUsed.file,
      total: user.storageUsed.db + user.storageUsed.file,
      quotaDb: user.storageQuota.db,
      quotaFile: user.storageQuota.file,
      quotaTotal: user.storageQuota.db + user.storageQuota.file,
    };
  },
});
