import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TransLingua — Translate Documents in 20+ Languages with Perfect Formatting",
  description:
    "Translate text, voice, and images between any language pair — Russian to Bulgarian, Hungarian to Czech, Arabic to Japanese. Full document structure preservation: headings, tables, footers. Export to DOCX, PDF, HTML.",
  alternates: { canonical: "https://translingua.app" },
};

const LANGUAGES = [
  { name: "English", flag: "🇬🇧" }, { name: "Russian", flag: "🇷🇺" },
  { name: "Bulgarian", flag: "🇧🇬" }, { name: "Hungarian", flag: "🇭🇺" },
  { name: "Spanish", flag: "🇪🇸" }, { name: "French", flag: "🇫🇷" },
  { name: "German", flag: "🇩🇪" }, { name: "Italian", flag: "🇮🇹" },
  { name: "Portuguese", flag: "🇵🇹" }, { name: "Chinese", flag: "🇨🇳" },
  { name: "Japanese", flag: "🇯🇵" }, { name: "Korean", flag: "🇰🇷" },
  { name: "Arabic", flag: "🇸🇦" }, { name: "Hindi", flag: "🇮🇳" },
  { name: "Polish", flag: "🇵🇱" }, { name: "Czech", flag: "🇨🇿" },
  { name: "Romanian", flag: "🇷🇴" }, { name: "Ukrainian", flag: "🇺🇦" },
  { name: "Turkish", flag: "🇹🇷" }, { name: "Dutch", flag: "🇳🇱" },
];

const PAIRS = [
  "Russian → Bulgarian", "Hungarian → Czech", "Arabic → Japanese",
  "Turkish → Romanian", "Ukrainian → Polish", "Korean → Portuguese",
];

const FAQS = [
  {
    q: "Can I translate between any two languages, not just to/from English?",
    a: "Yes. TransLingua supports any-to-any language pairs across 20+ languages. Translate directly from Russian to Bulgarian, Hungarian to Czech, Arabic to Japanese — no English intermediary.",
  },
  {
    q: "Does TransLingua preserve my document's formatting?",
    a: "Yes. Our AST-based pipeline preserves headings (H1-H6), tables with cell alignment, ordered and unordered lists, horizontal rules, bold/italic formatting, footers, and page breaks. Exported documents mirror the original structure.",
  },
  {
    q: "What input types are supported?",
    a: "Three modes: type or paste text directly, record voice for transcription and translation, or upload images for OCR text extraction and translation. All modes preserve document structure where applicable.",
  },
  {
    q: "What export formats are available?",
    a: "DOCX (Word), PDF, HTML, and plain text. All formats preserve document structure including headings, tables, and footers. Every export passes a 6-point security scan and requires your approval via a visual preview.",
  },
  {
    q: "How does billing work?",
    a: "Usage-based billing via Stripe. You pay for characters translated, voice minutes, OCR pages, and storage used. Each plan includes generous allocations. Operations above your threshold require email confirmation with the estimated cost before execution — no surprise charges.",
  },
  {
    q: "What about document intelligence features like legal analysis?",
    a: "Document summarisation, jurisdiction-aware legal interpretation, and business document analysis are on our roadmap as paid add-on features for Pro and Team plans. Sign up for updates.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen" style={{ fontFamily: "'Instrument Sans', sans-serif", background: "#060a13" }}>
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b border-white/5" style={{ background: "rgba(6,10,19,0.88)" }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}>T</div>
            <span className="text-white font-semibold tracking-tight text-lg">TransLingua</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#languages" className="hover:text-white transition-colors">Languages</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <a href="/sign-in" className="text-sm text-zinc-400 hover:text-white transition-colors px-4 py-2">Sign In</a>
            <a href="/sign-up" className="text-sm text-white px-5 py-2 rounded-lg font-medium transition-all hover:brightness-110" style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}>Start Free</a>
          </div>
        </div>
      </nav>

      {/* HERO — One clear message */}
      <section className="relative pt-36 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-32 left-1/3 w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.07]" style={{ background: "#3b82f6" }} />
          <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] rounded-full blur-[100px] opacity-[0.05]" style={{ background: "#8b5cf6" }} />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-[4.2rem] font-bold text-white leading-[1.08] tracking-tight mb-6" style={{ fontFamily: "'Source Serif 4', serif" }}>
            Translate documents in 20+ languages.
            <br />
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #60a5fa, #a78bfa)" }}>
              Keep every table, heading, and footer.
            </span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Any language pair — Russian to Bulgarian, Hungarian to Czech, Arabic to Japanese.
            Text, voice, or image input. Your document&apos;s structure comes through perfectly.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/sign-up" className="w-full sm:w-auto px-8 py-3.5 text-white rounded-xl font-semibold text-base transition-all hover:shadow-lg hover:brightness-110 text-center" style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)", boxShadow: "0 4px 24px rgba(59,130,246,0.2)" }}>
              Start Translating — Free
            </a>
            <a href="#pricing" className="w-full sm:w-auto px-8 py-3.5 border border-zinc-700 hover:border-zinc-500 text-zinc-300 rounded-xl font-medium text-base transition-colors text-center">
              See Pricing
            </a>
          </div>
          <p className="text-xs text-zinc-600 mt-6">10,000 characters/month free · No credit card · Export to DOCX, PDF, HTML</p>
        </div>
      </section>

      {/* LANGUAGE PAIRS — The unique selling point */}
      <section id="languages" className="py-20 px-6 border-t border-zinc-800/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Source Serif 4', serif" }}>Any Language to Any Language</h2>
            <p className="text-zinc-400 text-lg max-w-xl mx-auto">Not English-centric. Translate directly between any pair — no routing through English first.</p>
          </div>

          {/* Example pairs */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {PAIRS.map((pair) => (
              <span key={pair} className="px-4 py-2.5 rounded-xl border border-zinc-700/60 text-zinc-300 text-sm font-medium" style={{ background: "rgba(59,130,246,0.04)" }}>
                {pair}
              </span>
            ))}
          </div>

          {/* All languages */}
          <div className="flex flex-wrap justify-center gap-2.5">
            {LANGUAGES.map((l) => (
              <span key={l.name} className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-zinc-800/60 bg-zinc-900/40 text-zinc-400 text-sm hover:border-zinc-600 hover:text-zinc-200 transition-colors cursor-default">
                <span className="text-base">{l.flag}</span> {l.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — Three input modes + structure preservation */}
      <section id="how-it-works" className="py-20 px-6 border-t border-zinc-800/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Source Serif 4', serif" }}>Three Ways In. Perfect Structure Out.</h2>
            <p className="text-zinc-400 text-lg max-w-xl mx-auto">However you input your document, the translation preserves every structural element.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {[
              { icon: "✍️", title: "Text", desc: "Paste or type directly. Markdown structure detected automatically — headings, tables, lists, and formatting all preserved through translation." },
              { icon: "🎙️", title: "Voice", desc: "Record in the browser. Whisper AI transcribes your speech in any supported language, then translates the transcript with punctuation intact." },
              { icon: "📷", title: "Image / OCR", desc: "Upload a photo of a document. Google Vision extracts text with layout analysis — tables, columns, and headings detected and preserved." },
            ].map((mode) => (
              <div key={mode.title} className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-7">
                <div className="text-3xl mb-4">{mode.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{mode.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{mode.desc}</p>
              </div>
            ))}
          </div>

          {/* Structure preservation callout */}
          <div className="rounded-2xl border border-blue-500/15 p-8 md:p-10" style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.04), rgba(99,102,241,0.03))" }}>
            <div className="md:flex items-start gap-8">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-3">Structure Preservation Pipeline</h3>
                <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                  Most translation tools destroy your formatting. TransLingua parses your document into an abstract syntax tree, extracts text for translation while preserving the tree structure, then reassembles everything. Tables stay as tables. Headings keep their levels. Footers stay in the footer.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Headings H1–H6", "Tables", "Lists", "Bold / Italic", "Horizontal Rules", "Footers", "Page Breaks"].map((el) => (
                    <span key={el} className="text-xs px-3 py-1.5 rounded-md bg-zinc-800/60 text-zinc-400 border border-zinc-700/40">{el}</span>
                  ))}
                </div>
              </div>
              <div className="mt-6 md:mt-0 flex-shrink-0 md:w-64">
                <div className="text-xs font-mono text-zinc-500 space-y-1.5 bg-zinc-900/60 rounded-xl p-5 border border-zinc-800/60">
                  <div className="text-blue-400">1. Parse → AST</div>
                  <div className="text-zinc-600 pl-3">↓</div>
                  <div className="text-emerald-400">2. Extract text nodes</div>
                  <div className="text-zinc-600 pl-3">↓</div>
                  <div className="text-amber-400">3. Translate (DeepL)</div>
                  <div className="text-zinc-600 pl-3">↓</div>
                  <div className="text-violet-400">4. Reassemble into AST</div>
                  <div className="text-zinc-600 pl-3">↓</div>
                  <div className="text-rose-400">5. Render to format</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECURITY + BILLING TRUST */}
      <section className="py-20 px-6 border-t border-zinc-800/40">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-8">
            <div className="text-2xl mb-3">🔒</div>
            <h3 className="text-lg font-bold text-white mb-3">Security Scan Before Every Export</h3>
            <p className="text-sm text-zinc-400 leading-relaxed mb-5">No document leaves without passing a 6-point check. You review the formatted preview and explicitly approve before any file is generated.</p>
            <div className="space-y-2">
              {["PII detection & redaction", "UTF-8 encoding validation", "Structure integrity (AST diff)", "SHA-256 content hash", "Translation completeness", "Format compatibility"].map((c, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs text-zinc-500">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-[9px]">✓</span>
                  {c}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-8">
            <div className="text-2xl mb-3">📧</div>
            <h3 className="text-lg font-bold text-white mb-3">Know the Cost Before You Commit</h3>
            <p className="text-sm text-zinc-400 leading-relaxed mb-5">Operations above your plan threshold send a confirmation email with the estimated cost. Click to confirm, or it cancels automatically. No surprise bills.</p>
            <div className="space-y-2">
              {["Estimated cost before execution", "One-click email confirmation", "Auto-cancel after 30 minutes", "Completion receipt with actual usage", "Real-time quota dashboard", "Alerts at 80% and 95% usage"].map((c, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs text-zinc-500">
                  <span className="w-4 h-4 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center text-[9px]">✓</span>
                  {c}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-20 px-6 border-t border-zinc-800/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Source Serif 4', serif" }}>Simple, Transparent Pricing</h2>
            <p className="text-zinc-400 text-lg">Pay for what you use. Storage included. No hidden fees.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-5">
            {[
              { name: "Free", price: "£0", period: "/mo", chars: "10,000", voice: "5 min", storage: "600 MB", exports: "PDF only", hl: false },
              { name: "Pro", price: "£15", period: "/mo", chars: "500,000", voice: "60 min", storage: "7 GB", exports: "All formats", hl: true },
              { name: "Team", price: "£49", period: "/mo", chars: "2,000,000", voice: "300 min", storage: "35 GB", exports: "All + batch", hl: false },
              { name: "Enterprise", price: "Custom", period: "", chars: "Unlimited", voice: "Unlimited", storage: "Unlimited", exports: "All + API", hl: false },
            ].map((plan) => (
              <div key={plan.name} className={`rounded-2xl border p-7 ${plan.hl ? "border-blue-500/30 ring-1 ring-blue-500/15" : "border-zinc-800/60"}`} style={plan.hl ? { background: "rgba(59,130,246,0.03)" } : { background: "rgba(24,24,27,0.3)" }}>
                <h3 className="text-base font-bold text-white mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-0.5 mb-6">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  <span className="text-zinc-500 text-sm">{plan.period}</span>
                </div>
                <div className="space-y-3 text-sm">
                  {[
                    ["Characters", plan.chars],
                    ["Voice", plan.voice],
                    ["Storage", plan.storage],
                    ["Exports", plan.exports],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-zinc-500">{label}</span>
                      <span className="text-zinc-300 font-medium text-right">{value}</span>
                    </div>
                  ))}
                </div>
                <button className={`w-full mt-6 py-2.5 rounded-lg text-sm font-medium transition-all ${plan.hl ? "text-white hover:brightness-110" : "border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-zinc-200"}`} style={plan.hl ? { background: "linear-gradient(135deg, #3b82f6, #6366f1)" } : {}}>
                  {plan.name === "Enterprise" ? "Contact Sales" : "Get Started"}
                </button>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-zinc-600 mt-8">Coming soon: document summarisation, legal interpretation, and business analysis as paid add-ons for Pro and Team plans.</p>
        </div>
      </section>

      {/* FAQ — SEO/GEO critical */}
      <section id="faq" className="py-20 px-6 border-t border-zinc-800/40">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center" style={{ fontFamily: "'Source Serif 4', serif" }}>Frequently Asked Questions</h2>
          <div className="space-y-5">
            {FAQS.map((faq, i) => (
              <div key={i} className="border border-zinc-800/60 rounded-xl bg-zinc-900/30 p-6">
                <h3 className="text-[15px] font-semibold text-white mb-2.5">{faq.q}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: FAQS.map((f) => ({
                  "@type": "Question",
                  name: f.q,
                  acceptedAnswer: { "@type": "Answer", text: f.a },
                })),
              }),
            }}
          />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-14 px-6 border-t border-zinc-800/40">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-bold" style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}>T</div>
            <span className="text-zinc-400 text-sm">TransLingua — Document translation with structure preservation.</span>
          </div>
          <div className="flex gap-6 text-xs text-zinc-600">
            <a href="/privacy" className="hover:text-zinc-400 transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-zinc-400 transition-colors">Terms</a>
            <a href="/security" className="hover:text-zinc-400 transition-colors">Security</a>
          </div>
        </div>
        <p className="text-center text-xs text-zinc-700 mt-6">&copy; 2026 TransLingua. All rights reserved.</p>
      </footer>
    </main>
  );
}
