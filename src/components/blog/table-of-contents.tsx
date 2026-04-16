"use client";

import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { List } from "lucide-react";

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

function extractHeadings(content: string): Heading[] {
  const headings: Heading[] = [];
  const regex = /^(#{2,3})\s+(.+)$/gm;
  let match;

  while ((match = regex.exec(content)) !== null) {
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
    headings.push({
      id,
      text,
      level: match[1].length,
    });
  }

  return headings;
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const headings = extractHeadings(content);

  const handleClick = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      {
        rootMargin: "-80px 0px -60% 0px",
        threshold: 0.1,
      }
    );

    for (const heading of headings) {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav
      className={cn(
        "sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto",
        "rounded-xl bg-neutral-900/50 border border-white/10 p-4"
      )}
    >
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
        <List className="h-4 w-4" />
        Contenido
      </div>

      <ul className="space-y-1">
        {headings.map((heading) => (
          <li key={heading.id}>
            <button
              onClick={() => handleClick(heading.id)}
              className={cn(
                "w-full text-left text-sm py-1 px-2 rounded-md transition-colors duration-200",
                "hover:bg-white/5 hover:text-white",
                heading.level === 3 && "pl-5",
                activeId === heading.id
                  ? "text-[#0079da] bg-[#0079da]/10 font-medium"
                  : "text-neutral-400"
              )}
            >
              {heading.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
