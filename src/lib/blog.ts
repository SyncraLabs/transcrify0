import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  category: string;
  tags: string[];
  image?: string;
  featured?: boolean;
  pillar?: boolean;
  readingTime: string;
  content: string;
}

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

function parseMDXFile(filePath: string): BlogPost | null {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);
    const slug = path.basename(filePath, ".mdx");
    const stats = readingTime(content);

    return {
      slug,
      title: data.title ?? "",
      description: data.description ?? "",
      date: data.date ?? new Date().toISOString(),
      author: data.author ?? "Rodri",
      category: data.category ?? "general",
      tags: data.tags ?? [],
      image: data.image,
      featured: data.featured ?? false,
      pillar: data.pillar ?? false,
      readingTime: stats.text,
      content,
    };
  } catch {
    return null;
  }
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));
  const posts = files
    .map((f) => parseMDXFile(path.join(BLOG_DIR, f)))
    .filter((p): p is BlogPost => p !== null);

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  return parseMDXFile(filePath);
}

export function getPostsByCategory(category: string): BlogPost[] {
  return getAllPosts().filter((p) => p.category === category);
}

export function getCategories(): { name: string; count: number }[] {
  const posts = getAllPosts();
  const map = new Map<string, number>();
  for (const post of posts) {
    map.set(post.category, (map.get(post.category) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export function getRelatedPosts(currentSlug: string, limit = 3): BlogPost[] {
  const current = getPostBySlug(currentSlug);
  if (!current) return [];

  const all = getAllPosts().filter((p) => p.slug !== currentSlug);

  const scored = all.map((post) => {
    let score = 0;
    // Shared tags: 1 point each
    for (const tag of post.tags) {
      if (current.tags.includes(tag)) score += 1;
    }
    // Same category: 2 points
    if (post.category === current.category) score += 2;
    return { post, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.post);
}
