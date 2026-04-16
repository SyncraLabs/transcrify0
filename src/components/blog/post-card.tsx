"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { BorderBeam } from "@/components/ui/border-beam";
import type { BlogPost } from "@/lib/blog";

const categoryColors: Record<string, string> = {
  transcripcion: "#0079da",
  productividad: "#10b981",
  tutorial: "#f59e0b",
  ia: "#8b5cf6",
  general: "#6b7280",
};

function getCategoryColor(category: string): string {
  return categoryColors[category.toLowerCase()] ?? categoryColors.general;
}

interface PostCardProps {
  post: BlogPost;
  featured?: boolean;
}

export default function PostCard({ post, featured }: PostCardProps) {
  const color = getCategoryColor(post.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      viewport={{ once: true }}
      className={cn(
        "group relative",
        post.featured && "md:col-span-2"
      )}
    >
      <Link href={`/blog/${post.slug}`} className="block h-full">
        <div
          className={cn(
            "relative h-full overflow-hidden rounded-2xl",
            "bg-neutral-900/50 backdrop-blur-md",
            "border border-white/10",
            "p-6 transition-colors duration-300",
            "hover:border-white/20",
            post.featured && "p-8"
          )}
        >
          {/* Category pill */}
          <div className="mb-4 flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-neutral-300"
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: color }}
              />
              {post.category}
            </span>
          </div>

          {/* Title */}
          <h3
            className={cn(
              "font-bold text-white leading-tight",
              "group-hover:text-blue-200 transition-colors duration-300",
              post.featured ? "text-2xl md:text-3xl mb-3" : "text-lg mb-2"
            )}
          >
            {post.title}
          </h3>

          {/* Description */}
          <p
            className={cn(
              "text-neutral-400 leading-relaxed",
              post.featured ? "text-base mb-6 line-clamp-3" : "text-sm mb-4 line-clamp-2"
            )}
          >
            {post.description}
          </p>

          {/* Meta */}
          <div className="mt-auto flex items-center gap-4 text-xs text-neutral-500">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {post.readingTime}
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(post.date).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>

          {/* Featured decoration */}
          {post.featured && (
            <BorderBeam
              size={120}
              duration={8}
              colorFrom="#0079da"
              colorTo="#0079da00"
              borderWidth={1}
            />
          )}
        </div>
      </Link>
    </motion.div>
  );
}
