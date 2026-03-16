"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { LANGUAGES } from "@/lib/constants";
import { History, FileText, Clock, CheckCircle, XCircle, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const STATUS_CONFIG = {
  pending: { icon: Clock, color: "text-zinc-400", bg: "bg-zinc-500/10", label: "Pending" },
  awaiting_confirmation: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10", label: "Awaiting Confirmation" },
  confirmed: { icon: Clock, color: "text-blue-400", bg: "bg-blue-500/10", label: "Confirmed" },
  processing: { icon: Loader2, color: "text-blue-400", bg: "bg-blue-500/10", label: "Processing" },
  complete: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10", label: "Complete" },
  failed: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10", label: "Failed" },
  cancelled: { icon: XCircle, color: "text-zinc-500", bg: "bg-zinc-500/10", label: "Cancelled" },
};

function getLangName(code: string): string {
  return LANGUAGES.find((l) => l.code === code)?.name ?? code;
}

export default function HistoryPage() {
  const translations = useQuery(api.translations.getByCurrentUser);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Source Serif 4', serif" }}>
          History
        </h1>
        <p className="text-sm text-zinc-500 mt-1">All your translations in one place.</p>
      </div>

      {translations === undefined ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-zinc-800/50 rounded-xl" />)}
        </div>
      ) : translations.length === 0 ? (
        <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/20 p-12 text-center">
          <History className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-sm text-zinc-500">No translations yet. Start translating to see your history here.</p>
          <Link
            href="/app/translate"
            className="inline-block mt-4 px-5 py-2 rounded-lg text-sm font-medium text-white transition-all hover:brightness-110"
            style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}
          >
            Start Translating
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {translations.map((t: any) => {
            const statusCfg = STATUS_CONFIG[t.status as keyof typeof STATUS_CONFIG];
            const StatusIcon = statusCfg.icon;
            const date = new Date(t._creationTime);

            return (
              <div
                key={t._id}
                className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-5 hover:border-zinc-700/60 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-zinc-200">
                        {getLangName(t.sourceLang)} → {getLangName(t.targetLang)}
                      </span>
                      <span className={cn("flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium", statusCfg.bg, statusCfg.color)}>
                        <StatusIcon className={cn("w-3 h-3", t.status === "processing" && "animate-spin")} />
                        {statusCfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 truncate max-w-md">
                      {t.sourceText.slice(0, 120)}{t.sourceText.length > 120 ? "..." : ""}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-zinc-500">{date.toLocaleDateString()}</p>
                    <p className="text-[10px] text-zinc-600 mt-0.5">
                      {t.characterCount.toLocaleString()} chars · {t.mode}
                    </p>
                  </div>
                </div>

                {t.status === "complete" && t.translatedText && (
                  <div className="mt-3 pt-3 border-t border-zinc-800/40">
                    <p className="text-xs text-zinc-400 truncate">
                      {t.translatedText.slice(0, 150)}{t.translatedText.length > 150 ? "..." : ""}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
