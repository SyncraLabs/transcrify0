import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { getAllToolPages } from "@/lib/seo-pages";

export default function sitemap(): MetadataRoute.Sitemap {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://transcrify.com";
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: appUrl, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${appUrl}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${appUrl}/tools`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${appUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${appUrl}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  const blogPages: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${appUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: post.pillar ? 0.9 : 0.8,
  }));

  const toolPages: MetadataRoute.Sitemap = getAllToolPages().map((page) => ({
    url: `${appUrl}/tools/${page.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...blogPages, ...toolPages];
}
