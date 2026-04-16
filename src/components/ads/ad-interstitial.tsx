"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Link from "next/link";

interface AdInterstitialProps {
  onClose: () => void;
}

export default function AdInterstitial({ onClose }: AdInterstitialProps) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative bg-neutral-900 border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4 text-center">
        {countdown <= 0 ? (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        ) : (
          <span className="absolute top-4 right-4 text-neutral-500 text-sm">
            {countdown}s
          </span>
        )}

        <p className="text-neutral-400 text-sm mb-4">Contenido patrocinado</p>

        {/* Ad slot placeholder */}
        <div className="w-full h-48 bg-neutral-800/50 rounded-xl border border-white/5 flex items-center justify-center mb-4">
          <span className="text-neutral-600 text-sm">Ad</span>
        </div>

        <Link
          href="/pricing"
          className="text-sm text-[#0079da] hover:underline"
        >
          Eliminar anuncios con Pro
        </Link>
      </div>
    </div>
  );
}
