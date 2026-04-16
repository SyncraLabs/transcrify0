import Link from "next/link";
import ecosystemData from "@/data/ecosystem.json";

interface RelatedToolsExtProps {
  keywords?: string[];
}

const currentApp = process.env.NEXT_PUBLIC_APP_SLUG || "transcrify";

export default function RelatedToolsExt({ keywords = [] }: RelatedToolsExtProps) {
  const otherApps = ecosystemData.apps.filter(
    (app) => app.id !== currentApp && app.status === "live"
  );

  if (otherApps.length === 0) return null;

  // Score by keyword overlap
  const scored = otherApps
    .map((app) => {
      const overlap = app.keywords.filter((k) =>
        keywords.some((kw) => kw.toLowerCase().includes(k) || k.includes(kw.toLowerCase()))
      ).length;
      return { app, score: overlap };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return (
    <div className="rounded-2xl bg-neutral-900/50 border border-white/10 p-6">
      <h3 className="text-white font-semibold mb-4">You might also like</h3>
      <div className="space-y-3">
        {scored.map(({ app }) => (
          <Link
            key={app.id}
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-neutral-400 hover:text-white transition-colors"
          >
            <span className="font-medium text-white">{app.name}</span>
            <span className="text-sm ml-2">{app.tagline}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
