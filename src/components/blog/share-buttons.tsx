"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Share2, Twitter, Linkedin, Copy, Check } from "lucide-react";

interface ShareButtonsProps {
  url: string;
  title: string;
}

export default function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback silently
    }
  };

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  return (
    <div className="flex items-center gap-3">
      <Share2 className="h-4 w-4 text-neutral-500" />

      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Compartir en Twitter"
        className="text-neutral-400 transition-colors duration-200 hover:text-white"
      >
        <Twitter className="h-4 w-4" />
      </a>

      <a
        href={linkedinUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Compartir en LinkedIn"
        className="text-neutral-400 transition-colors duration-200 hover:text-white"
      >
        <Linkedin className="h-4 w-4" />
      </a>

      <button
        onClick={handleCopy}
        aria-label="Copiar enlace"
        className={cn(
          "inline-flex items-center gap-1 text-neutral-400 transition-colors duration-200",
          copied ? "text-green-400" : "hover:text-white"
        )}
      >
        {copied ? (
          <>
            <Check className="h-4 w-4" />
            <span className="text-xs">Copiado!</span>
          </>
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
