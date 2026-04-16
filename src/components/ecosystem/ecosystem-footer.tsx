"use client";

import Link from "next/link";
import { Marquee } from "@/components/ui/marquee";
import ecosystemData from "@/data/ecosystem.json";

const currentApp = process.env.NEXT_PUBLIC_APP_SLUG || "transcrify";

export default function EcosystemFooter() {
  const otherApps = ecosystemData.apps.filter(
    (app) => app.id !== currentApp && app.status === "live"
  );

  // Don't render if no other apps
  if (otherApps.length === 0) return null;

  return (
    <section className="py-12 border-t border-white/5">
      <div className="container mx-auto px-4">
        <p className="text-center text-sm text-neutral-500 mb-6">
          More AI Tools by Rodri
        </p>
        <Marquee pauseOnHover className="[--duration:30s]">
          {otherApps.map((app) => (
            <Link
              key={app.id}
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mx-4 inline-flex items-center gap-3 rounded-xl bg-neutral-900/50 border border-white/10 px-5 py-3 hover:border-white/20 transition-colors"
            >
              <span className="text-white font-medium">{app.name}</span>
              <span className="text-neutral-500 text-sm">{app.tagline}</span>
            </Link>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
