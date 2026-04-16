import Link from "next/link";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BlogPost } from "@/lib/blog";

interface RelatedPostsProps {
  posts: BlogPost[];
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-16">
      <h2
        className={cn(
          "text-2xl font-bold text-white mb-6",
          "bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent"
        )}
      >
        Articulos Relacionados
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className={cn(
              "group block rounded-2xl overflow-hidden",
              "bg-neutral-900/50 backdrop-blur-md",
              "border border-white/10",
              "p-5 transition-all duration-300",
              "hover:border-white/20 hover:bg-neutral-900/80"
            )}
          >
            {/* Category */}
            <span className="text-xs text-neutral-500 mb-2 block">
              {post.category}
            </span>

            {/* Title */}
            <h3 className="text-base font-semibold text-white mb-2 leading-snug group-hover:text-blue-200 transition-colors line-clamp-2">
              {post.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-neutral-400 mb-3 line-clamp-2">
              {post.description}
            </p>

            {/* Reading time */}
            <span className="inline-flex items-center gap-1 text-xs text-neutral-500">
              <Clock className="h-3 w-3" />
              {post.readingTime}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
