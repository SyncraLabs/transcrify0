import { cn } from "@/lib/utils";
import { Clock, Calendar, User } from "lucide-react";

interface PostHeaderProps {
  title: string;
  author: string;
  date: string;
  readingTime: string;
  category: string;
  tags: string[];
}

export default function PostHeader({
  title,
  author,
  date,
  readingTime,
  category,
  tags,
}: PostHeaderProps) {
  return (
    <header className="mb-10">
      {/* Category pill */}
      <div className="mb-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0079da]/10 px-3 py-1 text-xs font-medium text-[#0079da]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#0079da]" />
          {category}
        </span>
      </div>

      {/* Title */}
      <h1
        className={cn(
          "bg-gradient-to-r from-blue-200 via-white to-blue-200",
          "bg-clip-text text-transparent",
          "text-4xl md:text-5xl font-bold leading-tight mb-6"
        )}
      >
        {title}
      </h1>

      {/* Author + meta row */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-400 mb-6">
        <span className="inline-flex items-center gap-1.5">
          <User className="h-4 w-4" />
          {author}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Calendar className="h-4 w-4" />
          {new Date(date).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          {readingTime}
        </span>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs text-neutral-400"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Divider */}
      <div className="mt-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </header>
  );
}
