"use client";

import { useEffect, useRef } from "react";
import { shouldShowAds, adsConfig } from "@/lib/ads";

interface AdBannerProps {
  userPlan?: string;
  className?: string;
}

export default function AdBanner({ userPlan, className }: AdBannerProps) {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    if (!shouldShowAds(userPlan) || !adRef.current) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {
      // AdSense not loaded
    }
  }, [userPlan]);

  if (!adsConfig.enabled) return null;

  return (
    <div className={`rounded-xl overflow-hidden bg-neutral-900/30 border border-white/5 ${className || ""}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={adsConfig.clientId}
        data-ad-slot={adsConfig.slots.banner}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
