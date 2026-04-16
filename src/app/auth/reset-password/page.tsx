"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, Mail, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="bg-neutral-900/60 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
            <CheckCircle className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
            <p className="text-neutral-400">
              We sent a password reset link to <span className="text-white font-medium">{email}</span>.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8">
          <Logo size={48} className="mb-4" />
          <h1 className="text-2xl font-bold text-white">Reset password</h1>
          <p className="text-neutral-400 mt-1">Enter your email to receive a reset link</p>
        </div>

        <div className="bg-neutral-900/60 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 py-2 px-4 rounded-lg border border-red-500/20">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#0079da] hover:bg-[#0069c0] text-white font-semibold rounded-xl transition-all"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send Reset Link"}
            </Button>
          </form>
        </div>

        <p className="text-center text-neutral-400 mt-6 text-sm">
          <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 transition-colors">
            Back to login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
