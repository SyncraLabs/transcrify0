export const adsConfig = {
  enabled: process.env.NEXT_PUBLIC_ADS_ENABLED === "true",
  clientId: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "",
  slots: {
    banner: "", // Fill after AdSense approval
    sidebar: "",
    inContent: "",
    interstitial: "",
  },
};

export function shouldShowAds(userPlan?: string): boolean {
  if (!adsConfig.enabled) return false;
  if (userPlan === "pro" || userPlan === "basic") return false;
  if (typeof window === "undefined") return false;
  const consent = localStorage.getItem("cookie-consent");
  return consent === "accepted";
}
