
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/components/providers/auth-provider";
import AdSenseScript from "@/components/ads/adsense-script";
import CookieConsent from "@/components/ads/cookie-consent";

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
  return (
    <html lang="es" className="dark">
      <body className={cn(inter.className, "min-h-screen bg-black text-white antialiased")}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <AdSenseScript />
        <CookieConsent />
      </body>
    </html>
  );
}
