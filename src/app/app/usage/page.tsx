"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { UsageMeter } from "@/components/usage-meter";
import { PLAN_LIMITS, OVERAGE_RATES } from "@/lib/constants";
import type { PlanName } from "@/lib/constants";
import { BarChart3 } from "lucide-react";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export default function UsagePage() {
  const user = useQuery(api.users.getCurrent);
  const usage = useQuery(api.usageRecords.getCurrentPeriod);
  const storageUsage = useQuery(api.storage.getCurrentUsage);

  if (!user || !usage) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-zinc-800 rounded-lg" />
        <div className="grid gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-zinc-800/50 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const plan = (user.plan ?? "free") as PlanName;
  const limits = PLAN_LIMITS[plan];
  const breakdown = usage.breakdown;

  const overageChars = Math.max(0, breakdown.translation_text - limits.charactersPerMonth);
  const overageVoice = Math.max(0, breakdown.translation_voice - limits.voiceMinutesPerMonth);
  const overageCost =
    (overageChars / 1000) * OVERAGE_RATES.translation_per_1k_chars +
    overageVoice * OVERAGE_RATES.voice_per_minute +
    Math.max(0, breakdown.ocr_extraction - limits.ocrPagesPerMonth) * OVERAGE_RATES.ocr_per_page +
    breakdown.document_export * OVERAGE_RATES.export_per_export;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Source Serif 4', serif" }}>
          Usage
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Current billing period usage for your <span className="text-zinc-300 font-medium capitalize">{plan}</span> plan.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-6 space-y-5">
        <UsageMeter
          label="Characters Translated"
          current={breakdown.translation_text}
          limit={limits.charactersPerMonth}
          unit="chars"
        />
        <UsageMeter
          label="Voice Minutes"
          current={breakdown.translation_voice}
          limit={limits.voiceMinutesPerMonth}
          unit="min"
        />
        <UsageMeter
          label="OCR Pages"
          current={breakdown.ocr_extraction}
          limit={limits.ocrPagesPerMonth}
          unit="pages"
        />
        <UsageMeter
          label="Document Exports"
          current={breakdown.document_export}
          limit={Infinity}
          unit="exports"
        />
      </div>

      {storageUsage && (
        <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-6 space-y-5">
          <h2 className="text-base font-semibold text-zinc-200">Storage</h2>
          <UsageMeter
            label="Database Storage"
            current={storageUsage.db}
            limit={storageUsage.quotaDb}
            unit=""
            formatValue={formatBytes}
          />
          <UsageMeter
            label="File Storage"
            current={storageUsage.file}
            limit={storageUsage.quotaFile}
            unit=""
            formatValue={formatBytes}
          />
        </div>
      )}

      {overageCost > 0 && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-medium text-amber-300">Overage Estimate</h3>
          </div>
          <p className="text-2xl font-bold text-amber-400">
            £{overageCost.toFixed(4)}
          </p>
          <p className="text-xs text-amber-500/70 mt-1">
            Based on current usage beyond plan limits. Upgrade to reduce costs.
          </p>
        </div>
      )}
    </div>
  );
}
