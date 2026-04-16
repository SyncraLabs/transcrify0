"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, Clock, Zap, Crown, ArrowUpRight, ExternalLink, Copy, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { useAuth } from "@/components/providers/auth-provider";
import { createClient } from "@/lib/supabase/client";

interface TranscriptionItem {
  id: string;
  url: string;
  title: string;
  ai_title: string;
  author: string;
  full_text: string;
  created_at: string;
}

interface UsageData {
  used: number;
  limit: number;
  remaining: number;
  plan: string;
}

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [history, setHistory] = useState<TranscriptionItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Fetch usage
    fetch("/api/usage")
      .then((r) => r.json())
      .then(setUsage)
      .catch(console.error);

    // Fetch history
    supabase
      .from("transcription_history")
      .select("id, url, title, ai_title, author, full_text, created_at")
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setHistory(data || []);
        setLoadingHistory(false);
      });
  }, []);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const deleteItem = async (id: string) => {
    await supabase.from("transcription_history").delete().eq("id", id);
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const plan = profile?.subscription_status || "free";
  const planLabel = plan === "pro" ? "Pro" : plan === "basic" ? "Basic" : "Free";
  const planIcon = plan === "pro" ? Crown : Zap;
  const PlanIcon = planIcon;

  const usagePercent = usage && usage.limit > 0
    ? Math.min(100, (usage.used / usage.limit) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Nav */}
      <div className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-3">
            <Logo size={32} />
            <span className="font-bold text-lg tracking-tight text-white">Transcrify</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-white">
              Back to app
            </Button>
          </Link>
        </div>
      </div>

      <div className="pt-24 pb-20 px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
            <p className="text-neutral-400">
              Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {/* Plan Card */}
            <div className="rounded-xl border border-white/10 bg-neutral-900/40 p-6">
              <div className="flex items-center gap-2 mb-3">
                <PlanIcon className="h-5 w-5 text-blue-400" />
                <span className="text-sm font-medium text-neutral-400">Current Plan</span>
              </div>
              <div className="text-2xl font-bold">{planLabel}</div>
              {plan === "free" && (
                <Link href="/pricing">
                  <Button size="sm" className="mt-3 bg-[#0079da] hover:bg-[#0069c0] text-white text-xs rounded-lg">
                    Upgrade
                    <ArrowUpRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              )}
            </div>

            {/* Usage Card */}
            <div className="rounded-xl border border-white/10 bg-neutral-900/40 p-6">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-5 w-5 text-emerald-400" />
                <span className="text-sm font-medium text-neutral-400">Today&apos;s Usage</span>
              </div>
              {usage ? (
                <>
                  <div className="text-2xl font-bold">
                    {usage.used} / {usage.limit === -1 ? "\u221e" : usage.limit}
                  </div>
                  {usage.limit > 0 && (
                    <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          usagePercent > 80 ? "bg-red-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${usagePercent}%` }}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="text-2xl font-bold text-neutral-600">...</div>
              )}
            </div>

            {/* History Count */}
            <div className="rounded-xl border border-white/10 bg-neutral-900/40 p-6">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-5 w-5 text-purple-400" />
                <span className="text-sm font-medium text-neutral-400">Total Transcriptions</span>
              </div>
              <div className="text-2xl font-bold">{history.length}</div>
            </div>
          </div>

          {/* History */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Recent Transcriptions</h2>

            {loadingHistory ? (
              <div className="text-neutral-500 text-center py-12">Loading...</div>
            ) : history.length === 0 ? (
              <div className="text-center py-16 rounded-xl border border-white/5 bg-neutral-900/20">
                <FileText className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
                <p className="text-neutral-400 mb-2">No transcriptions yet</p>
                <Link href="/">
                  <Button size="sm" className="bg-[#0079da] hover:bg-[#0069c0] text-white rounded-lg">
                    Transcribe your first video
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-white/5 bg-neutral-900/40 p-4 hover:bg-neutral-900/60 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white truncate">
                          {item.ai_title || item.title || "Untitled"}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          {item.author && (
                            <span className="text-xs text-neutral-500">{item.author}</span>
                          )}
                          <span className="flex items-center gap-1 text-xs text-neutral-500">
                            <Clock className="h-3 w-3" />
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-400 mt-2 line-clamp-2">
                          {item.full_text?.substring(0, 200)}...
                        </p>
                      </div>

                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-neutral-400 hover:text-white"
                          onClick={() => copyText(item.full_text, item.id)}
                        >
                          {copiedId === item.id ? (
                            <Check className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-neutral-400 hover:text-white"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </a>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-neutral-400 hover:text-red-400"
                          onClick={() => deleteItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
