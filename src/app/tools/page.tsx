import { Metadata } from "next";
import Link from "next/link";
import { getAllToolPages, getAllSources } from "@/lib/seo-pages";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { Meteors } from "@/components/ui/meteors";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { dictionary } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "AI Transcription Tools | Transcrify",
  description:
    "Free AI-powered transcription tools for YouTube, TikTok, Instagram, podcasts, webinars and Twitch. Convert video to text in any language.",
};

export default function ToolsPage() {
  const pages = getAllToolPages();
  const sources = getAllSources();
  const dict = dictionary.es;

  const sourceLabels: Record<string, string> = {
    youtube: "YouTube",
    tiktok: "TikTok",
    instagram: "Instagram",
    podcast: "Podcast",
    webinar: "Webinar",
    twitch: "Twitch",
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar dict={dict} lang="es" />

      <main className="container mx-auto px-4 pt-32 pb-20">
        {/* Hero */}
        <div className="text-center mb-16 relative">
          <AnimatedGradientText className="text-sm mb-4">
            AI Transcription Tools
          </AnimatedGradientText>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-200 via-white to-blue-200 bg-clip-text text-transparent mb-4">
            Transcription Tools
          </h1>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
            AI-powered video to text conversion for every platform and language.
            Choose your source and get started.
          </p>
        </div>

        {/* Tools grouped by source */}
        {sources.map((source) => {
          const sourcePages = pages.filter((p) => p.source === source);
          return (
            <section key={source} className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-6">
                {sourceLabels[source] || source}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sourcePages.map((page) => (
                  <Link
                    key={page.slug}
                    href={`/tools/${page.slug}`}
                    className="group relative overflow-hidden rounded-2xl bg-neutral-900/50 backdrop-blur-md border border-white/10 p-6 transition-all hover:border-white/20 hover:scale-[1.02]"
                  >
                    <Meteors number={3} />
                    <h3 className="text-white font-semibold mb-2 group-hover:text-[#0079da] transition-colors">
                      {page.h1}
                    </h3>
                    <p className="text-neutral-400 text-sm line-clamp-2">
                      {page.description}
                    </p>
                    <div className="flex gap-2 mt-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-neutral-300 border border-white/10">
                        {page.language}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </main>

      <Footer dict={dict} />
    </div>
  );
}
