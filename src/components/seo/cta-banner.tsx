"use client";

import Link from "next/link";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { BorderBeam } from "@/components/ui/border-beam";

export default function CtaBanner() {
  return (
    <section className="relative">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-900/80 to-neutral-900 border border-white/10 px-6 py-16 sm:px-12 sm:py-20 text-center">
        <BorderBeam
          size={100}
          duration={8}
          colorFrom="#0079da"
          colorTo="#60a5fa"
        />

        {/* Subtle glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,121,218,0.08),transparent_70%)]" />

        <div className="relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Transcribe Your Videos?
          </h2>

          <p className="text-neutral-400 text-lg max-w-xl mx-auto mb-10">
            Convert any video to text in seconds with AI-powered transcription.
          </p>

          <Link href="/">
            <ShimmerButton
              shimmerColor="#60a5fa"
              background="rgba(0, 121, 218, 1)"
              className="px-8 py-3.5 text-lg font-semibold"
            >
              Try Transcrify Free
            </ShimmerButton>
          </Link>
        </div>
      </div>
    </section>
  );
}
