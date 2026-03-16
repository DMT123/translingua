export const LANGUAGES = [
  { code: "en", name: "English", flag: "🇬🇧", deeplCode: "EN" },
  { code: "ru", name: "Russian", flag: "🇷🇺", deeplCode: "RU" },
  { code: "bg", name: "Bulgarian", flag: "🇧🇬", deeplCode: "BG" },
  { code: "hu", name: "Hungarian", flag: "🇭🇺", deeplCode: "HU" },
  { code: "es", name: "Spanish", flag: "🇪🇸", deeplCode: "ES" },
  { code: "fr", name: "French", flag: "🇫🇷", deeplCode: "FR" },
  { code: "de", name: "German", flag: "🇩🇪", deeplCode: "DE" },
  { code: "it", name: "Italian", flag: "🇮🇹", deeplCode: "IT" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹", deeplCode: "PT-PT" },
  { code: "zh", name: "Chinese", flag: "🇨🇳", deeplCode: "ZH" },
  { code: "ja", name: "Japanese", flag: "🇯🇵", deeplCode: "JA" },
  { code: "ko", name: "Korean", flag: "🇰🇷", deeplCode: "KO" },
  { code: "ar", name: "Arabic", flag: "🇸🇦", deeplCode: "AR" },
  { code: "hi", name: "Hindi", flag: "🇮🇳", deeplCode: null },
  { code: "pl", name: "Polish", flag: "🇵🇱", deeplCode: "PL" },
  { code: "cs", name: "Czech", flag: "🇨🇿", deeplCode: "CS" },
  { code: "ro", name: "Romanian", flag: "🇷🇴", deeplCode: "RO" },
  { code: "uk", name: "Ukrainian", flag: "🇺🇦", deeplCode: "UK" },
  { code: "tr", name: "Turkish", flag: "🇹🇷", deeplCode: "TR" },
  { code: "nl", name: "Dutch", flag: "🇳🇱", deeplCode: "NL" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

export const PLAN_LIMITS = {
  free: {
    charactersPerMonth: 10_000,
    voiceMinutesPerMonth: 5,
    ocrPagesPerMonth: 10,
    dbStorageBytes: 100 * 1024 * 1024,
    fileStorageBytes: 500 * 1024 * 1024,
    maxGlossaries: 1,
    exportFormats: ["pdf"] as string[],
  },
  pro: {
    charactersPerMonth: 500_000,
    voiceMinutesPerMonth: 60,
    ocrPagesPerMonth: 200,
    dbStorageBytes: 2 * 1024 * 1024 * 1024,
    fileStorageBytes: 5 * 1024 * 1024 * 1024,
    maxGlossaries: 10,
    exportFormats: ["pdf", "docx", "html", "txt"] as string[],
  },
  team: {
    charactersPerMonth: 2_000_000,
    voiceMinutesPerMonth: 300,
    ocrPagesPerMonth: 1_000,
    dbStorageBytes: 10 * 1024 * 1024 * 1024,
    fileStorageBytes: 25 * 1024 * 1024 * 1024,
    maxGlossaries: Infinity,
    exportFormats: ["pdf", "docx", "html", "txt"] as string[],
  },
  enterprise: {
    charactersPerMonth: Infinity,
    voiceMinutesPerMonth: Infinity,
    ocrPagesPerMonth: Infinity,
    dbStorageBytes: Infinity,
    fileStorageBytes: Infinity,
    maxGlossaries: Infinity,
    exportFormats: ["pdf", "docx", "html", "txt"] as string[],
  },
} as const;

export type PlanName = keyof typeof PLAN_LIMITS;

export const CONFIRMATION_THRESHOLDS = {
  free: { textChars: 500, voiceMinutes: 1, ocrPages: 2, exportAlways: true },
  pro: { textChars: 10_000, voiceMinutes: 10, ocrPages: 20, exportAlways: false },
  team: { textChars: 50_000, voiceMinutes: 30, ocrPages: 50, exportAlways: false },
  enterprise: { textChars: Infinity, voiceMinutes: Infinity, ocrPages: Infinity, exportAlways: false },
} as const;

export const OVERAGE_RATES = {
  translation_per_1k_chars: 0.002,
  voice_per_minute: 0.05,
  ocr_per_page: 0.03,
  export_per_export: 0.01,
  db_storage_per_gb_month: 0.15,
  file_storage_per_gb_month: 0.10,
  bandwidth_per_gb: 0.05,
} as const;

export const CONFIRMATION_EXPIRY_MS = 30 * 60 * 1000;
