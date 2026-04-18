
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/components/providers/auth-provider";
import CookieConsent from "@/components/ads/cookie-consent";
import { ADSENSE_CLIENT_ID } from "@/lib/ads";
import { generateOrganizationJsonLd } from "@/lib/seo";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://transcrify.es";

export const metadata: Metadata = {
  title: {
    default: "Transcrify | Transcripcion de Video a Texto con IA",
    template: "%s | Transcrify",
  },
  description:
    "Convierte videos de YouTube, TikTok y mas en texto perfectamente formateado al instante con inteligencia artificial.",
  metadataBase: new URL(appUrl),
  openGraph: {
    title: "Transcrify | Transcripcion de Video a Texto con IA",
    description:
      "Convierte videos de YouTube, TikTok y mas en texto perfectamente formateado al instante.",
    url: appUrl,
    siteName: "Transcrify",
    type: "website",
    locale: "es_ES",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Transcrify — Transcripcion de Video a Texto con IA" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Transcrify",
    description: "Transcripcion de Video a Texto con IA",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: appUrl,
    types: {
      "application/rss+xml": `${appUrl}/feed.xml`,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationJsonLd = generateOrganizationJsonLd();

  return (
    <html lang="es" className="dark">
      <head>
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className={cn(inter.className, "min-h-screen bg-black text-white antialiased")}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <CookieConsent />
      </body>
    </html>
  );
}
