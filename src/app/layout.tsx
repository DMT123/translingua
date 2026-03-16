import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://translingua.app"),
  title: {
    default: "TransLingua — Translate Documents in 20+ Languages with Perfect Formatting",
    template: "%s | TransLingua",
  },
  description:
    "Translate text, voice, and images between any language pair. Russian to Bulgarian, Hungarian to Czech, Arabic to Japanese. Full document structure preservation — headings, tables, footers intact. Export to DOCX, PDF, HTML.",
  keywords: [
    "document translation", "translate Russian to Bulgarian", "Hungarian translation",
    "multilingual translation", "translate documents online", "OCR translation",
    "voice translation", "any language pair translation", "document formatting preservation",
    "translate with tables", "DOCX translation", "PDF translation",
  ],
  authors: [{ name: "TransLingua" }],
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://translingua.app",
    siteName: "TransLingua",
    title: "TransLingua — Translate Documents in 20+ Languages with Perfect Formatting",
    description: "Any-to-any language translation with full document structure preservation. Text, voice, and image input. Export to DOCX, PDF, HTML.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "TransLingua" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TransLingua — Document Translation with Structure Preservation",
    description: "Translate between any language pair. Headings, tables, footers preserved. Export to DOCX, PDF, HTML.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Source+Serif+4:ital,wght@0,400;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "TransLingua",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              description: "Document translation platform supporting 20+ languages with any-to-any pairs and full structure preservation.",
              offers: {
                "@type": "AggregateOffer",
                lowPrice: "0",
                highPrice: "49",
                priceCurrency: "GBP",
                offerCount: "4",
              },
              featureList: [
                "Translation across 20+ languages (any-to-any pair)",
                "Document structure preservation (headings, tables, footers)",
                "Text, voice, and image/OCR input",
                "Export to DOCX, PDF, HTML, TXT",
                "6-point security scan before export",
                "Email confirmation before billable operations",
                "Custom translation glossaries",
              ],
            }),
          }}
        />
      </head>
      <body className="antialiased">
          <Providers>{children}</Providers>
        </body>
    </html>
  );
}
