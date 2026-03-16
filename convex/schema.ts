import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    plan: v.union(
      v.literal("free"),
      v.literal("pro"),
      v.literal("team"),
      v.literal("enterprise")
    ),
    stripeCustomerId: v.optional(v.string()),
    storageQuota: v.object({ db: v.number(), file: v.number() }),
    storageUsed: v.object({ db: v.number(), file: v.number() }),
    preferences: v.object({
      defaultSourceLang: v.string(),
      defaultTargetLang: v.string(),
    }),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"]),

  translations: defineTable({
    userId: v.id("users"),
    sourceText: v.string(),
    translatedText: v.optional(v.string()),
    sourceLang: v.string(),
    targetLang: v.string(),
    mode: v.union(v.literal("text"), v.literal("voice"), v.literal("image")),
    status: v.union(
      v.literal("pending"),
      v.literal("awaiting_confirmation"),
      v.literal("confirmed"),
      v.literal("processing"),
      v.literal("complete"),
      v.literal("failed"),
      v.literal("cancelled")
    ),
    characterCount: v.number(),
    sizeBytes: v.number(),
    structureMap: v.optional(v.any()),
    estimatedCost: v.number(),
    confirmationCode: v.optional(v.string()),
    confirmationToken: v.optional(v.string()),
    confirmedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    expiresAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"])
    .index("by_userId_status", ["userId", "status"]),

  documents: defineTable({
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
    fileStorageId: v.optional(v.string()),
    sizeBytes: v.number(),
    downloadUrl: v.optional(v.string()),
    expiresAt: v.number(),
  }).index("by_translationId", ["translationId"]),

  emailEvents: defineTable({
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
    status: v.union(
      v.literal("sent"),
      v.literal("delivered"),
      v.literal("opened"),
      v.literal("bounced"),
      v.literal("failed")
    ),
    deliveredAt: v.optional(v.number()),
    openedAt: v.optional(v.number()),
  })
    .index("by_translationId", ["translationId"])
    .index("by_userId", ["userId"]),

  storageSnapshots: defineTable({
    userId: v.id("users"),
    dbSizeBytes: v.number(),
    fileSizeBytes: v.number(),
    totalBytes: v.number(),
    snapshotDate: v.string(),
    emittedToStripe: v.boolean(),
  }).index("by_userId_snapshotDate", ["userId", "snapshotDate"]),

  usageRecords: defineTable({
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
    timestamp: v.number(),
    stripeMeterId: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_eventType", ["userId", "eventType"]),

  subscriptions: defineTable({
    userId: v.id("users"),
    stripeSubscriptionId: v.string(),
    plan: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("past_due"),
      v.literal("cancelled")
    ),
    currentPeriodEnd: v.number(),
    storageDbQuota: v.number(),
    storageFileQuota: v.number(),
  }).index("by_userId", ["userId"]),

  glossaries: defineTable({
    userId: v.id("users"),
    name: v.string(),
    entries: v.array(
      v.object({ source: v.string(), target: v.string() })
    ),
    sourceLang: v.string(),
    targetLang: v.string(),
    sizeBytes: v.number(),
  }).index("by_userId", ["userId"]),
});
