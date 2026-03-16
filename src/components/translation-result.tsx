"use client";

import { cn } from "@/lib/utils";
import { Copy, Check, FileDown } from "lucide-react";
import { useState } from "react";

interface TranslationResultProps {
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  onExport: () => void;
}

export function TranslationResult({
  sourceText,
  translatedText,
  sourceLang,
  targetLang,
  onExport,
}: TranslationResultProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/40">
        <h3 className="text-sm font-medium text-zinc-300">Translation Result</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-white font-medium transition-all hover:brightness-110"
            style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}
          >
            <FileDown className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-800/40">
        <div className="p-5">
          <p className="text-xs text-zinc-500 mb-2 font-medium uppercase tracking-wide">{sourceLang}</p>
          <div className="text-sm text-zinc-400 whitespace-pre-wrap leading-relaxed">{sourceText}</div>
        </div>
        <div className="p-5">
          <p className="text-xs text-zinc-500 mb-2 font-medium uppercase tracking-wide">{targetLang}</p>
          <div className="text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed">{translatedText}</div>
        </div>
      </div>
    </div>
  );
}
