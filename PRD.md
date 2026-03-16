# TransLingua PRD v4.0 — Translation-First

<meta>
product_name: TransLingua
version: 4.0
type: document_translation_platform
date: 2026-03-08
status: active_development
owner: David — Solutions Architect
strategy: Launch with translation core. Add intelligence features (summarisation, legal, business analysis) as paid add-ons when validated by customer demand.
</meta>

<purpose>
TransLingua is a document translation platform that translates text, voice, and images between any supported language pair — not limited to English-centric routes. Russian to Bulgarian, Hungarian to Czech, Arabic to Japanese. The core differentiator is full document structure preservation: headings, tables, lists, footers, and formatting survive the translation process intact. All billable operations above plan thresholds require transactional email confirmation via Resend before execution. Storage and usage are metered via Stripe+Metronome.
</purpose>

---

## TECH_STACK

<stack>
| Layer | Technology | Purpose |
|-------|-----------|---------|
| framework | Next.js 15 | App Router, SSR for SEO/GEO, server components |
| ui | React 19 | Component architecture |
| styling | Tailwind CSS 4 | Utility-first CSS |
| backend_db | Convex | Reactive real-time database, file storage, server functions, scheduling |
| auth_primary | Clerk | Consumer auth: social login, MFA, organisations |
| auth_enterprise | WorkOS | Enterprise SSO (SAML/OIDC), SCIM — add when first enterprise customer signs |
| payments_metering | Stripe (with Metronome) | Unified billing: subscriptions + usage-based metering |
| email | Resend + React Email | Transactional: confirmations, receipts, alerts |
| translation | DeepL API + Google Cloud Translation v3 | Neural machine translation with structure preservation |
| voice | Whisper API (OpenAI) | Multi-language speech-to-text |
| ocr | Google Cloud Vision | Document layout analysis, table detection, OCR |
| document_export | docx-js + jsPDF + html2canvas | DOCX, PDF, HTML, TXT with structure mirroring |
| hosting | Vercel | Edge deployment, preview deploys |
| repo | GitHub | Source control, CI/CD via Vercel |
| monitoring | Sentry + Convex Dashboard | Error tracking, function analytics |
</stack>

---

## LAUNCH_SCOPE (v1)

<scope>
### In Scope — Translation Core
- Text translation: paste/type with markdown structure detection
- Voice translation: browser recording → Whisper transcription → translate
- Image/OCR translation: upload image → Google Vision extraction → translate
- Any-to-any language pairs across 20+ languages
- Document structure preservation via AST pipeline (headings, tables, lists, rules, bold/italic, footers)
- Export to DOCX, PDF, HTML, TXT with formatting mirrored
- 6-point pre-export security scan + visual preview modal
- Email confirmation gate for operations above threshold (via Resend)
- Storage billing: database + file storage metered per GB-month
- Usage billing: characters, voice minutes, OCR pages, exports metered via Stripe+Metronome
- Custom glossaries for terminology overrides
- Real-time usage dashboard via Convex reactive queries

### Out of Scope — Future Paid Add-ons (Roadmap)
- Document summarisation (configurable depth) → Pro/Team add-on
- Legal interpretation (jurisdiction-aware US/UK/EU) → Team/Enterprise add-on
- Business document analysis (T&Cs, contracts, SLAs) → Team/Enterprise add-on
- Translation memory per organisation → Enterprise
- API access for programmatic translation → Enterprise
- Marketplace for third-party translation providers → Future
</scope>

---

## LANGUAGES

<languages>
Supported (20): English, Russian, Bulgarian, Hungarian, Spanish, French, German, Italian, Portuguese, Chinese (Simplified), Japanese, Korean, Arabic, Hindi, Polish, Czech, Romanian, Ukrainian, Turkish, Dutch

All pairwise combinations supported. Not English-centric — direct routes like:
- Russian ↔ Bulgarian
- Hungarian ↔ Czech
- Arabic ↔ Japanese
- Turkish ↔ Romanian
- Ukrainian ↔ Polish
</languages>

---

## CONVEX_SCHEMA

<schema>
table: users
fields:
  - clerkId: string (indexed)
  - email: string
  - name: string
  - plan: "free" | "pro" | "team" | "enterprise"
  - stripeCustomerId: string
  - storageQuota: { db: number, file: number }
  - storageUsed: { db: number, file: number }
  - preferences: { defaultSourceLang: string, defaultTargetLang: string }

table: translations
fields:
  - userId: Id<"users">
  - sourceText: string
  - translatedText: string | null
  - sourceLang: string
  - targetLang: string
  - mode: "text" | "voice" | "image"
  - status: "pending" | "awaiting_confirmation" | "confirmed" | "processing" | "complete" | "failed" | "cancelled"
  - characterCount: number
  - sizeBytes: number
  - structureMap: object | null
  - estimatedCost: number
  - confirmationCode: string | null
  - confirmationToken: string | null
  - confirmedAt: number | null
  - completedAt: number | null
  - expiresAt: number

table: documents
fields:
  - translationId: Id<"translations">
  - format: "docx" | "pdf" | "html" | "txt"
  - securityScanResult: { checks: Array<{ name: string, status: "pass" | "warn" | "fail" }>, overall: string }
  - fileStorageId: string
  - sizeBytes: number
  - downloadUrl: string | null
  - expiresAt: number

table: emailEvents
fields:
  - translationId: Id<"translations"> | null
  - emailType: "confirmation" | "receipt" | "quota_warning" | "storage_alert" | "export_ready" | "cancellation"
  - resendMessageId: string
  - status: "sent" | "delivered" | "opened" | "bounced" | "failed"
  - deliveredAt: number | null
  - openedAt: number | null

table: storageSnapshots
fields:
  - userId: Id<"users">
  - dbSizeBytes: number
  - fileSizeBytes: number
  - totalBytes: number
  - snapshotDate: string
  - emittedToStripe: boolean

table: usageRecords
fields:
  - userId: Id<"users">
  - eventType: "translation_text" | "translation_voice" | "ocr_extraction" | "document_export" | "storage_db_gb" | "storage_file_gb" | "bandwidth_gb"
  - quantity: number
  - unit: string
  - timestamp: number
  - stripeMeterId: string | null

table: subscriptions
fields:
  - userId: Id<"users">
  - stripeSubscriptionId: string
  - plan: string
  - status: "active" | "past_due" | "cancelled"
  - currentPeriodEnd: number
  - storageDbQuota: number
  - storageFileQuota: number

table: glossaries
fields:
  - userId: Id<"users">
  - name: string
  - entries: Array<{ source: string, target: string }>
  - sourceLang: string
  - targetLang: string
  - sizeBytes: number
</schema>

---

## CONVEX_FUNCTIONS

<functions>
### Queries
- translations.getByUser(userId) → all translations, ordered by date
- translations.getById(id) → single translation with result
- translations.getPending(userId) → translations awaiting email confirmation
- storage.getCurrentUsage(userId) → { db, file, total, quotaDb, quotaFile }
- subscriptions.getCurrent(userId) → active subscription
- emailEvents.getByTranslation(translationId) → email delivery status
- usageRecords.getCurrentPeriod(userId) → usage breakdown for billing period
- glossaries.getByUser(userId) → all user glossaries

### Mutations
- translations.create(input) → creates translation, checks threshold, returns { id, requiresConfirmation }
- translations.confirm(id, code) → validates code/token, sets confirmed
- translations.cancel(id) → cancels pending
- documents.createExport(translationId, format) → creates export after security scan
- storageSnapshots.record(userId, dbSize, fileSize) → daily snapshot
- glossaries.create(name, sourceLang, targetLang, entries) → create glossary
- glossaries.update(id, entries) → update entries

### Actions
- translation.execute(translationId) → calls DeepL/Google with structure preservation
- email.sendConfirmation(translationId) → Resend: cost estimate email
- email.sendReceipt(translationId) → Resend: completion receipt
- email.sendQuotaWarning(userId, metricType) → Resend: 80%/95% alert
- billing.emitUsageEvent(userId, eventType, quantity) → Stripe+Metronome
- billing.emitStorageEvent(userId, dbGB, fileGB) → daily storage to Stripe
- export.generateDocument(translationId, format) → generate DOCX/PDF/HTML/TXT

### Scheduled
- storage.dailySnapshot → 00:00 UTC, per-user storage calc, emit to Stripe
- translations.expireStale → every 5 min, cancel unconfirmed >30 min
- email.retryFailed → every 10 min, retry failed sends (max 3)
- documents.autoPurge → daily, delete expired exports per plan retention
</functions>

---

## STRUCTURE_PRESERVATION

<structure>
### Pipeline
1. PARSE: Source text → AST of nodes (Heading, Paragraph, Table, TableRow, TableCell, List, ListItem, HorizontalRule, Footer, Bold, Italic)
2. EXTRACT: Text content from leaf nodes → flat array
3. TRANSLATE: Flat array → translation API (segment boundaries preserved)
4. REASSEMBLE: Translated segments → back into original AST
5. RENDER: AST → target format (DOCX/PDF/HTML/TXT)

### Supported Elements
| Element | Detection | Preservation |
|---------|-----------|-------------|
| Headings H1-H6 | # markdown / HTML | Level + text |
| Tables | Pipe delimiters / HTML | Row/col + alignment |
| Horizontal Rules | --- / <hr> | Position |
| Bold / Italic | ** / * / HTML | Inline formatting |
| Ordered Lists | 1. 2. 3. / <ol> | Numbering + nesting |
| Unordered Lists | bullet / <ul> | Style + nesting |
| Footers | marker / position | Footer placement |
| Page Breaks | markers | Break position |
</structure>

---

## BILLING

<billing>
### Pricing
| Feature | Free | Pro £15/mo | Team £49/mo | Enterprise |
|---------|------|-----------|-------------|------------|
| Characters/month | 10,000 | 500,000 | 2,000,000 | Unlimited |
| Voice minutes/month | 5 | 60 | 300 | Unlimited |
| OCR pages/month | 10 | 200 | 1,000 | Unlimited |
| DB storage | 100 MB | 2 GB | 10 GB | Unlimited |
| File storage | 500 MB | 5 GB | 25 GB | Unlimited |
| Exports | PDF only | All formats | All + batch | All + API |
| Glossaries | 1 | 10 | Unlimited | Unlimited |
| Future add-ons | — | Summarisation | +Legal +Business | All |

### Overage Rates
| Metric | Unit | Rate |
|--------|------|------|
| Translation | Per 1k chars | £0.002 |
| Voice | Per minute | £0.05 |
| OCR | Per page | £0.03 |
| Export | Per export | £0.01 |
| DB Storage | Per GB-month | £0.15 |
| File Storage | Per GB-month | £0.10 |
| Bandwidth | Per GB | £0.05 |

### Email Confirmation Thresholds
| Action | Free | Pro | Team |
|--------|------|-----|------|
| Text | >500 chars | >10k chars | >50k chars |
| Voice | >1 min | >10 min | >30 min |
| OCR | >2 pages | >20 pages | >50 pages |
| Export | Always | DOCX/PDF | Batch only |
</billing>

---

## SECURITY

<security>
### Pre-Export Scan (6-Point)
1. PII Detection → warn + redact
2. UTF-8 Encoding Validation → block
3. Structure Integrity (AST diff) → warn
4. SHA-256 Content Hash → block if mismatch
5. Completeness (coverage %) → warn if <90%
6. Format Compatibility → suggest alt
</security>

---

## ROADMAP

<roadmap>
Phase 1 — Translation Core (Weeks 1-6) ← NOW
Phase 2 — Multi-Modal: voice + OCR + glossaries (Weeks 7-10)
Phase 3 — Intelligence Add-ons: summarisation, legal, business as PAID features (Weeks 11-16)
Phase 4 — Enterprise: WorkOS SSO, translation memory, API (Weeks 17-22)
Phase 5 — Scale: multi-region, PWA, marketplace (Future)
</roadmap>

---

## ENV_VARS

<env>
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
RESEND_WEBHOOK_SECRET=
DEEPL_API_KEY=
OPENAI_API_KEY=
GOOGLE_CLOUD_CREDENTIALS=
NEXT_PUBLIC_APP_URL=https://translingua.app
</env>
