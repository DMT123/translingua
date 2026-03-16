"use client";

import { useState } from "react";
import { X, Download, Shield, AlertTriangle, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScanResult } from "@/lib/security-scan";

type ExportFormat = "docx" | "pdf" | "html" | "txt";

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  scanResult: ScanResult;
  htmlPreview: string;
  onExport: (format: ExportFormat) => Promise<void>;
  allowedFormats: ExportFormat[];
}

const FORMAT_LABELS: Record<ExportFormat, string> = {
  docx: "DOCX (Word)",
  pdf: "PDF",
  html: "HTML",
  txt: "Plain Text",
};

export function ExportModal({
  open,
  onClose,
  scanResult,
  htmlPreview,
  onExport,
  allowedFormats,
}: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>(allowedFormats[0] ?? "pdf");
  const [exporting, setExporting] = useState(false);

  if (!open) return null;

  const isBlocked = scanResult.overall === "blocked";

  const handleExport = async () => {
    setExporting(true);
    try {
      await onExport(selectedFormat);
      onClose();
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/60">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Export Document</h2>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-zinc-300 mb-3">Security Scan Results</h3>
            <div className="space-y-2">
              {scanResult.checks.map((check, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-center justify-between px-4 py-2.5 rounded-lg border",
                    check.status === "pass" && "border-emerald-500/20 bg-emerald-500/5",
                    check.status === "warn" && "border-amber-500/20 bg-amber-500/5",
                    check.status === "fail" && "border-red-500/20 bg-red-500/5"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    {check.status === "pass" && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                    {check.status === "warn" && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                    {check.status === "fail" && <XCircle className="w-4 h-4 text-red-400" />}
                    <span className="text-sm text-zinc-200">{check.name}</span>
                  </div>
                  <span className="text-xs text-zinc-500">{check.detail}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-zinc-300 mb-3">Preview</h3>
            <div
              className="rounded-lg border border-zinc-800 bg-white p-6 max-h-64 overflow-y-auto prose prose-sm"
              dangerouslySetInnerHTML={{ __html: htmlPreview }}
            />
          </div>

          <div>
            <h3 className="text-sm font-medium text-zinc-300 mb-3">Format</h3>
            <div className="flex flex-wrap gap-2">
              {(["docx", "pdf", "html", "txt"] as ExportFormat[]).map((fmt) => {
                const allowed = allowedFormats.includes(fmt);
                return (
                  <button
                    key={fmt}
                    type="button"
                    disabled={!allowed}
                    onClick={() => setSelectedFormat(fmt)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium border transition-colors",
                      selectedFormat === fmt && allowed
                        ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
                        : allowed
                          ? "border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                          : "border-zinc-800 text-zinc-600 cursor-not-allowed opacity-50"
                    )}
                  >
                    {FORMAT_LABELS[fmt]}
                    {!allowed && " (Upgrade)"}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-800/60">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isBlocked || exporting}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-all",
              isBlocked
                ? "bg-zinc-700 cursor-not-allowed opacity-50"
                : "hover:brightness-110"
            )}
            style={isBlocked ? {} : { background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}
          >
            {exporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {isBlocked ? "Export Blocked" : exporting ? "Generating..." : "Download"}
          </button>
        </div>
      </div>
    </div>
  );
}
