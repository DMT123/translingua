# TransLingua

**Translate documents in 20+ languages with perfect formatting.**

Any-to-any language pairs — Russian to Bulgarian, Hungarian to Czech, Arabic to Japanese. Text, voice, or image input. Headings, tables, footers, and formatting preserved. Export to DOCX, PDF, HTML, TXT.

## Tech Stack

- **Framework**: Next.js 15 (App Router, SSR)
- **Database**: Convex (reactive, real-time)
- **Auth**: Clerk / WorkOS (enterprise)
- **Payments**: Stripe + Metronome (usage-based)
- **Email**: Resend + React Email
- **Translation**: DeepL / Google Cloud Translation
- **Voice**: Whisper API (OpenAI)
- **OCR**: Google Cloud Vision
- **Export**: docx-js, jsPDF, html2canvas
- **Hosting**: Vercel

## Quick Start

```bash
npm install
npm run dev
```

## PRD

Full product spec in `PRD.md` — structured for LLM/coding agent consumption.

## Roadmap

- **v1 (now)**: Translation core — text, voice, image, structure preservation, export, billing
- **v2**: Summarisation add-on (Pro+)
- **v3**: Legal interpretation add-on (Team+) — US/UK/EU jurisdiction-aware
- **v4**: Business document analysis add-on (Team+) — T&Cs, contracts, SLAs
