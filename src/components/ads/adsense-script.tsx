"use client";

import Script from "next/script";
import { adsConfig } from "@/lib/ads";

export default function AdSenseScript() {
  if (!adsConfig.enabled || !adsConfig.clientId) return null;

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsConfig.clientId}`}
      crossOrigin="anonymous"
      strategy="lazyOnload"
    />
  );
}
