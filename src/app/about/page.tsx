import { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { dictionary } from "@/lib/i18n";
import { Video, FileText, Languages, Zap, Globe, Music } from "lucide-react";
import ecosystemData from "@/data/ecosystem.json";

export const metadata: Metadata = {
  title: "About | Transcrify",
  description:
    "Transcrify is built by Rodri, an AI Creator & Founder who builds AI-powered tools and runs an AI agency working with large enterprises.",
};

const stats = [
  { label: "Platforms Supported", value: "6+", icon: Globe },
  { label: "Export Formats", value: "5", icon: FileText },
  { label: "Languages", value: "50+", icon: Languages },
  { label: "AI Models", value: "Whisper", icon: Zap },
];

const features = [
  { icon: Video, title: "Multi-Platform", desc: "YouTube, TikTok, Instagram, podcasts, webinars, Twitch" },
  { icon: FileText, title: "Multiple Formats", desc: "Export as TXT, PDF, Markdown, SRT, or JSON" },
  { icon: Languages, title: "Multi-Language", desc: "Automatic language detection with 50+ supported languages" },
  { icon: Zap, title: "AI-Powered", desc: "OpenAI Whisper for transcription, GPT for smart titles" },
  { icon: Globe, title: "Batch Processing", desc: "Transcribe multiple videos at once" },
  { icon: Music, title: "Audio Extraction", desc: "Intelligent audio extraction from any video source" },
];

export default function AboutPage() {
  const dict = dictionary.es;
  const { author } = ecosystemData;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Transcrify",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://transcrify.com",
    description: "AI-powered video to text transcription platform.",
    founder: {
      "@type": "Person",
      name: author.name,
      description: author.description,
      jobTitle: author.role,
    },
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar dict={dict} lang="es" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="container mx-auto px-4 pt-32 pb-20">
        {/* Hero */}
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-200 via-white to-blue-200 bg-clip-text text-transparent mb-6">
            About Transcrify
          </h1>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
            AI-powered video to text transcription. Built for creators,
            researchers, and teams who need fast, accurate transcriptions.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center rounded-2xl bg-neutral-900/50 border border-white/10 p-6"
            >
              <stat.icon className="mx-auto mb-3 text-[#0079da]" size={28} />
              <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-neutral-400 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Features bento grid */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-white text-center mb-10">
            What Transcrify Does
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl bg-neutral-900/50 border border-white/10 p-6"
              >
                <div className="w-10 h-10 rounded-lg bg-white/5 ring-1 ring-white/10 flex items-center justify-center mb-4">
                  <feature.icon size={20} className="text-[#0079da]" />
                </div>
                <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                <p className="text-neutral-400 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Creator bio */}
        <div className="max-w-2xl mx-auto mb-20">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Created by {author.name}
          </h2>
          <div className="rounded-2xl bg-neutral-900/50 border border-white/10 p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0079da] to-blue-400 mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">R</span>
            </div>
            <h3 className="text-white text-xl font-bold mb-1">{author.name}</h3>
            <p className="text-[#0079da] text-sm mb-4">{author.role}</p>
            <p className="text-neutral-400 leading-relaxed">
              {author.description} Passionate about making AI accessible to
              everyone through simple, powerful tools that solve real problems.
            </p>
          </div>
        </div>
      </main>

      <Footer dict={dict} />
    </div>
  );
}
