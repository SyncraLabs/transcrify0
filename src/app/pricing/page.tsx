"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Zap, Crown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { useAuth } from "@/components/providers/auth-provider";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect to get started",
    features: [
      "3 transcriptions/day (no signup)",
      "5 transcriptions/day (with account)",
      "YouTube, TikTok, Instagram",
      "Export as TXT, PDF, Markdown",
      "AI-generated titles",
    ],
    cta: "Get Started",
    highlight: false,
    icon: Zap,
  },
  {
    name: "Basic",
    price: "$5",
    period: "/month",
    description: "For regular creators",
    features: [
      "30 transcriptions/day",
      "Transcription history",
      "Batch processing",
      "All export formats",
      "Priority processing",
    ],
    cta: "Subscribe",
    highlight: true,
    icon: Zap,
    priceEnvKey: "basic",
  },
  {
    name: "Pro",
    price: "$15",
    period: "/month",
    description: "For power users & teams",
    features: [
      "Unlimited transcriptions",
      "Full transcription history",
      "Batch processing",
      "API access",
      "Priority support",
    ],
    cta: "Subscribe",
    highlight: false,
    icon: Crown,
    priceEnvKey: "pro",
  },
];

export default function PricingPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (plan: (typeof plans)[0]) => {
    if (!user) {
      router.push("/auth/signup");
      return;
    }

    if (!plan.priceEnvKey) return; // Free plan

    setLoadingPlan(plan.name);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: plan.priceEnvKey, // "basic" or "pro" - resolved server-side
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleManageSubscription = async () => {
    setLoadingPlan("manage");
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Portal error:", error);
    } finally {
      setLoadingPlan(null);
    }
  };

  const currentPlan = profile?.subscription_status || "free";
  const isPaid = currentPlan === "basic" || currentPlan === "pro";

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Nav back */}
      <div className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-3">
            <Logo size={32} />
            <span className="font-bold text-lg tracking-tight text-white">Transcrify</span>
          </Link>
          {isPaid && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleManageSubscription}
              disabled={loadingPlan === "manage"}
              className="text-neutral-400 hover:text-white"
            >
              {loadingPlan === "manage" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Manage Subscription
            </Button>
          )}
        </div>
      </div>

      <div className="pt-32 pb-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-neutral-400 max-w-xl mx-auto">
            Start free, upgrade when you need more. No hidden fees.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, idx) => {
            const isCurrentPlan =
              (plan.name.toLowerCase() === currentPlan) ||
              (plan.name === "Free" && currentPlan === "free" && !isPaid);

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`relative rounded-2xl border p-8 flex flex-col ${
                  plan.highlight
                    ? "border-blue-500/50 bg-blue-950/20 shadow-lg shadow-blue-500/10"
                    : "border-white/10 bg-neutral-900/40"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-xs font-bold rounded-full uppercase tracking-wider">
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <plan.icon className="h-5 w-5 text-blue-400" />
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-neutral-400">{plan.period}</span>
                  </div>
                  <p className="text-neutral-400 text-sm mt-2">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                      <span className="text-sm text-neutral-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {isCurrentPlan ? (
                  <Button
                    disabled
                    className="w-full py-3 bg-white/10 text-neutral-400 font-medium rounded-xl cursor-default"
                  >
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleSubscribe(plan)}
                    disabled={loadingPlan === plan.name}
                    className={`w-full py-3 font-semibold rounded-xl transition-all ${
                      plan.highlight
                        ? "bg-[#0079da] hover:bg-[#0069c0] text-white"
                        : "bg-white/10 hover:bg-white/20 text-white"
                    }`}
                  >
                    {loadingPlan === plan.name ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      plan.cta
                    )}
                  </Button>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
