"use client";

import { useEffect, useRef } from "react";
import { shouldShowAds, adsConfig } from "@/lib/ads";

interface AdSidebarProps {
  userPlan?: string;
}

export default function AdSidebar({ userPlan }: AdSidebarProps) {
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
    <div className="rounded-xl overflow-hidden bg-neutral-900/30 border border-white/5 p-2">
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block", width: "300px", height: "250px" }}
        data-ad-client={adsConfig.clientId}
        data-ad-slot={adsConfig.slots.sidebar}
      />
    </div>
  );
}
