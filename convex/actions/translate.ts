"use node";

import { v } from "convex/values";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";

const DEEPL_LANGUAGES = new Set([
  "BG", "CS", "DA", "DE", "EL", "EN", "ES", "ET", "FI", "FR",
  "HU", "ID", "IT", "JA", "KO", "LT", "LV", "NB", "NL", "PL",
  "PT-PT", "PT-BR", "RO", "RU", "SK", "SL", "SV", "TR", "UK", "ZH", "AR",
]);

const LANG_TO_DEEPL: Record<string, string> = {
  en: "EN", ru: "RU", bg: "BG", hu: "HU", es: "ES", fr: "FR",
  de: "DE", it: "IT", pt: "PT-PT", zh: "ZH", ja: "JA", ko: "KO",
  ar: "AR", pl: "PL", cs: "CS", ro: "RO", uk: "UK", tr: "TR", nl: "NL",
};

const LANG_TO_GOOGLE: Record<string, string> = {
  en: "en", ru: "ru", bg: "bg", hu: "hu", es: "es", fr: "fr",
  de: "de", it: "it", pt: "pt", zh: "zh-CN", ja: "ja", ko: "ko",
  ar: "ar", hi: "hi", pl: "pl", cs: "cs", ro: "ro", uk: "uk",
  tr: "tr", nl: "nl",
};

export const execute = action({
  args: {
    translationId: v.id("translations"),
  },
  handler: async (ctx, args) => {
    const translation = await ctx.runQuery(
      internal.translations.internalGetById as any,
      { id: args.translationId }
    );

    if (!translation) throw new Error("Translation not found");
    if (translation.status !== "confirmed") {
      throw new Error("Translation must be confirmed before execution");
    }

    await ctx.runMutation(internal.translations.markProcessing, {
      id: args.translationId,
    });

    try {
      const segments = translation.sourceText.split("\n").filter((s: string) => s.trim());
      const sourceLang = translation.sourceLang;
      const targetLang = translation.targetLang;

      let translatedSegments: string[];

      const deeplSource = LANG_TO_DEEPL[sourceLang];
      const deeplTarget = LANG_TO_DEEPL[targetLang];
      const canUseDeepL = deeplSource && deeplTarget &&
        DEEPL_LANGUAGES.has(deeplSource) && DEEPL_LANGUAGES.has(deeplTarget);

      if (canUseDeepL && process.env.DEEPL_API_KEY) {
        translatedSegments = await translateWithDeepL(
          segments, deeplSource, deeplTarget
        );
      } else {
        translatedSegments = await translateWithGoogle(
          segments,
          LANG_TO_GOOGLE[sourceLang] ?? sourceLang,
          LANG_TO_GOOGLE[targetLang] ?? targetLang
        );
      }

      const translatedText = translatedSegments.join("\n");

      await ctx.runMutation(internal.translations.markComplete, {
        id: args.translationId,
        translatedText,
      });

      await ctx.runMutation(internal.usageRecords.record, {
        userId: translation.userId,
        eventType: "translation_text",
        quantity: translation.characterCount,
        unit: "characters",
      });

      return { success: true, translatedText };
    } catch (error) {
      await ctx.runMutation(internal.translations.markFailed, {
        id: args.translationId,
      });
      throw error;
    }
  },
});

async function translateWithDeepL(
  texts: string[],
  sourceLang: string,
  targetLang: string
): Promise<string[]> {
  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey) throw new Error("DEEPL_API_KEY not configured");

  const baseUrl = apiKey.endsWith(":fx")
    ? "https://api-free.deepl.com"
    : "https://api.deepl.com";

  const response = await fetch(`${baseUrl}/v2/translate`, {
    method: "POST",
    headers: {
      Authorization: `DeepL-Auth-Key ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: texts,
      source_lang: sourceLang,
      target_lang: targetLang,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepL API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return data.translations.map((t: { text: string }) => t.text);
}

async function translateWithGoogle(
  texts: string[],
  sourceLang: string,
  targetLang: string
): Promise<string[]> {
  const credentials = process.env.GOOGLE_CLOUD_CREDENTIALS;
  if (!credentials) {
    throw new Error(
      "Neither DEEPL_API_KEY nor GOOGLE_CLOUD_CREDENTIALS configured"
    );
  }

  const creds = JSON.parse(credentials);
  const projectId = creds.project_id;

  const response = await fetch(
    `https://translation.googleapis.com/v3/projects/${projectId}/locations/global:translateText`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${creds.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: texts,
        sourceLanguageCode: sourceLang,
        targetLanguageCode: targetLang,
        mimeType: "text/plain",
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Translation API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return data.translations.map((t: { translatedText: string }) => t.translatedText);
}
