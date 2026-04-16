import Link from "next/link";
import { cn } from "@/lib/utils";
import { FolderOpen, Zap } from "lucide-react";

interface BlogSidebarProps {
  categories: { name: string; count: number }[];
}

export default function BlogSidebar({ categories }: BlogSidebarProps) {
  return (
    <aside className="space-y-6">
      {/* Categories card */}
      <div
        className={cn(
          "rounded-2xl bg-neutral-900/50 backdrop-blur-md",
          "border border-white/10 p-5"
        )}
      >
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
          <FolderOpen className="h-4 w-4" />
          Categorias
        </div>

        <ul className="space-y-1">
          {categories.map((cat) => (
            <li key={cat.name}>
              <Link
                href={`/blog/category/${cat.name}`}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2 text-sm",
                  "text-neutral-400 transition-colors duration-200",
                  "hover:bg-white/5 hover:text-white"
                )}
              >
                <span className="capitalize">{cat.name}</span>
                <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-neutral-500">
                  {cat.count}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA card */}
      <div
        className={cn(
          "rounded-2xl bg-neutral-900/50 backdrop-blur-md",
          "border border-[#0079da]/30 p-5"
        )}
      >
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
          <Zap className="h-4 w-4 text-[#0079da]" />
          Prueba Transcrify
        </div>

        <p className="mb-4 text-sm text-neutral-400 leading-relaxed">
          Transcribe videos de YouTube, Instagram y TikTok a texto en segundos
          con inteligencia artificial.
        </p>

        <Link
          href="/"
          className={cn(
            "block w-full rounded-xl py-2.5 text-center text-sm font-medium",
            "bg-[#0079da] text-white",
            "transition-opacity duration-200 hover:opacity-90"
          )}
        >
          Empezar gratis
        </Link>
      </div>
    </aside>
  );
}
