import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ToolPage } from "@/lib/seo-pages";

interface ToolPageLayoutProps {
  page: ToolPage;
  children: React.ReactNode;
}

export default function ToolPageLayout({ page, children }: ToolPageLayoutProps) {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,121,218,0.12),transparent_60%)]" />
        <div className="relative max-w-5xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-blue-200 via-white to-blue-200 bg-clip-text text-transparent mb-6">
            {page.h1}
          </h1>

          <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto mb-4">
            {page.description}
          </p>

          <div className="flex items-center justify-center gap-3 mb-10">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-neutral-900/50 border border-white/10 text-sm text-neutral-300">
              {page.source}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-neutral-900/50 border border-white/10 text-sm text-neutral-300">
              {page.language}
            </span>
          </div>

          <Link
            href="/"
            className={cn(
              "inline-flex items-center gap-2 px-8 py-3.5 rounded-full",
              "bg-[#0079da] hover:bg-[#0079da]/90 text-white font-semibold text-lg",
              "transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
            )}
          >
            Start Transcribing Now
          </Link>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 pb-24 space-y-16">
        {/* Intro */}
        <section className="prose prose-invert prose-neutral max-w-none">
          <p className="text-lg text-neutral-300 leading-relaxed">
            {page.intro}
          </p>
        </section>

        {/* Tips */}
        {page.tips.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-white mb-6">
              Tips for Best Results
            </h2>
            <ul className="space-y-3">
              {page.tips.map((tip, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-neutral-300"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#0079da] shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </section>
        )}

        {children}
      </div>
    </div>
  );
}
