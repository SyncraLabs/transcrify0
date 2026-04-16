"use client";

import { useEffect, useRef } from "react";
import { shouldShowAds, adsConfig } from "@/lib/ads";

interface AdInContentProps {
  userPlan?: string;
}

export default function AdInContent({ userPlan }: AdInContentProps) {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    if (!shouldShowAds(userPlan) || !adRef.current) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {}
  }, [userPlan]);

  if (!adsConfig.enabled) return null;

  return (
    <div className="my-8 rounded-xl overflow-hidden bg-neutral-900/30 border border-white/5">
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block", textAlign: "center" }}
        data-ad-client={adsConfig.clientId}
        data-ad-slot={adsConfig.slots.inContent}
        data-ad-format="fluid"
        data-ad-layout-key="-fb+5w+4e-db+86"
      />
    </div>
  );
}
