"use client";

import { useState, useCallback } from "react";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { LanguageSelector } from "@/components/language-selector";
import { TranslationResult } from "@/components/translation-result";
import { ExportModal } from "@/components/export-modal";
import { ArrowLeftRight, Loader2, Mic, Camera, Type } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseDocument, extractTextSegments, reassemble, renderToHTML } from "@/lib/ast";
import { runSecurityScan } from "@/lib/security-scan";
import { LANGUAGES, PLAN_LIMITS } from "@/lib/constants";
import type { PlanName } from "@/lib/constants";

type InputMode = "text" | "voice" | "image";

export default function TranslatePage() {
  const user = useQuery(api.users.getCurrent);
  const createTranslation = useMutation(api.translations.create);

  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("es");
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [mode, setMode] = useState<InputMode>("text");
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const charCount = sourceText.length;
  const plan = (user?.plan ?? "free") as PlanName;
  const limits = PLAN_LIMITS[plan];

  const swapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    if (translatedText) {
      setSourceText(translatedText);
      setTranslatedText(sourceText);
    }
  };

  const handleTranslate = useCallback(async () => {
    if (!sourceText.trim()) return;
    setError(null);
    setIsTranslating(true);
    setAwaitingConfirmation(false);

    try {
      const ast = parseDocument(sourceText);
      const segments = extractTextSegments(ast);
      const structureMap = { ast: JSON.parse(JSON.stringify(ast)), segments };

      const result = await createTranslation({
        sourceText,
        sourceLang,
        targetLang,
        mode,
        structureMap,
      });

      if (result.requiresConfirmation) {
        setAwaitingConfirmation(true);
        setIsTranslating(false);
        return;
      }

      const sourceLangObj = LANGUAGES.find((l) => l.code === sourceLang);
      const targetLangObj = LANGUAGES.find((l) => l.code === targetLang);

      setTranslatedText(
        `[Translation will be processed server-side for: ${sourceLangObj?.name} → ${targetLangObj?.name}]\n\n` +
        `Translation ID: ${result.id}\nCharacters: ${charCount}\nEstimated cost: £${result.estimatedCost.toFixed(4)}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Translation failed");
    } finally {
      setIsTranslating(false);
    }
  }, [sourceText, sourceLang, targetLang, mode, createTranslation, charCount]);

  const scanResult = translatedText
    ? runSecurityScan(sourceText, translatedText, 100)
    : null;

  const htmlPreview = translatedText
    ? renderToHTML(parseDocument(translatedText))
    : "";

  const handleExport = async (format: "docx" | "pdf" | "html" | "txt") => {
    const content = translatedText;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `translation.${format === "txt" ? "txt" : format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Source Serif 4', serif" }}>
          Translate
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Translate documents with structure preservation across 20+ languages.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {([
          { key: "text" as const, icon: Type, label: "Text", disabled: false },
          { key: "voice" as const, icon: Mic, label: "Voice", disabled: true },
          { key: "image" as const, icon: Camera, label: "Image", disabled: true },
        ]).map((m) => (
          <button
            key={m.key}
            onClick={() => !m.disabled && setMode(m.key)}
            disabled={m.disabled}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors",
              mode === m.key
                ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
                : m.disabled
                  ? "border-zinc-800 text-zinc-600 cursor-not-allowed"
                  : "border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
            )}
          >
            <m.icon className="w-4 h-4" />
            {m.label}
            {m.disabled && <span className="text-[10px] text-zinc-600 ml-1">Soon</span>}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-end gap-3">
        <LanguageSelector
          value={sourceLang}
          onChange={setSourceLang}
          label="From"
          className="flex-1 w-full"
        />
        <button
          onClick={swapLanguages}
          className="p-2.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-colors mb-0.5"
          title="Swap languages"
        >
          <ArrowLeftRight className="w-4 h-4" />
        </button>
        <LanguageSelector
          value={targetLang}
          onChange={setTargetLang}
          label="To"
          className="flex-1 w-full"
        />
      </div>

      <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 overflow-hidden">
        <textarea
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          placeholder="Paste or type your document here. Markdown formatting (headings, tables, lists, bold) will be detected and preserved."
          className="w-full h-48 p-5 bg-transparent text-sm text-zinc-200 placeholder-zinc-600 resize-none outline-none"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        />
        <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-800/40">
          <span className="text-xs text-zinc-600">
            {charCount.toLocaleString()} characters
            {charCount > limits.charactersPerMonth && (
              <span className="text-amber-500 ml-2">
                (exceeds {limits.charactersPerMonth.toLocaleString()} {plan} limit)
              </span>
            )}
          </span>
          <button
            onClick={handleTranslate}
            disabled={!sourceText.trim() || isTranslating}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-all",
              !sourceText.trim() || isTranslating
                ? "bg-zinc-700 cursor-not-allowed opacity-50"
                : "hover:brightness-110 hover:shadow-lg"
            )}
            style={
              sourceText.trim() && !isTranslating
                ? { background: "linear-gradient(135deg, #3b82f6, #6366f1)", boxShadow: "0 4px 24px rgba(59,130,246,0.15)" }
                : {}
            }
          >
            {isTranslating && <Loader2 className="w-4 h-4 animate-spin" />}
            {isTranslating ? "Translating..." : "Translate"}
          </button>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-lg border border-red-500/20 bg-red-500/5 text-sm text-red-400">
          {error}
        </div>
      )}

      {awaitingConfirmation && (
        <div className="px-5 py-4 rounded-lg border border-amber-500/20 bg-amber-500/5">
          <p className="text-sm text-amber-300 font-medium">Confirmation Required</p>
          <p className="text-xs text-amber-400/70 mt-1">
            This translation exceeds your plan threshold. A confirmation email has been sent.
            Please check your inbox and confirm to proceed.
          </p>
        </div>
      )}

      {translatedText && !awaitingConfirmation && (
        <TranslationResult
          sourceText={sourceText}
          translatedText={translatedText}
          sourceLang={LANGUAGES.find((l) => l.code === sourceLang)?.name ?? sourceLang}
          targetLang={LANGUAGES.find((l) => l.code === targetLang)?.name ?? targetLang}
          onExport={() => setExportOpen(true)}
        />
      )}

      {scanResult && (
        <ExportModal
          open={exportOpen}
          onClose={() => setExportOpen(false)}
          scanResult={scanResult}
          htmlPreview={htmlPreview}
          onExport={handleExport}
          allowedFormats={limits.exportFormats as ("docx" | "pdf" | "html" | "txt")[]}
        />
      )}
    </div>
  );
}
