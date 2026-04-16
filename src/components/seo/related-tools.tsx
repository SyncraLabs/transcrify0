import Link from "next/link";
import type { ToolPage } from "@/lib/seo-pages";

interface RelatedToolsProps {
  pages: ToolPage[];
}

export default function RelatedTools({ pages }: RelatedToolsProps) {
  if (pages.length === 0) return null;

  return (
    <section>
      <h2 className="text-2xl font-bold text-white mb-8">
        Related Transcription Tools
      </h2>

      <div className="relative">
        {/* Left fade */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-r from-black to-transparent" />
        {/* Right fade */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-l from-black to-transparent" />

        <div className="overflow-x-auto snap-x snap-mandatory flex gap-4 pb-4 scrollbar-hide">
          {pages.map((page) => (
            <Link
              key={page.slug}
              href={`/tools/${page.slug}`}
              className="snap-start shrink-0 w-72 bg-neutral-900/50 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-colors group"
            >
              <h3 className="font-semibold text-white mb-3 group-hover:text-[#0079da] transition-colors line-clamp-2">
                {page.title}
              </h3>

              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs text-neutral-300">
                  {page.source}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs text-neutral-300">
                  {page.language}
                </span>
              </div>

              <p className="text-sm text-neutral-400 line-clamp-2">
                {page.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
