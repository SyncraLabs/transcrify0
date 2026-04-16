/**
 * Auto Blog Post Generator (CI version)
 *
 * Same as auto-blog.ts but WITHOUT git operations.
 * Git add/commit/push is handled by the GitHub Action workflow.
 *
 * Usage in CI:
 *   OPENAI_API_KEY=sk-... npx tsx scripts/auto-blog-ci.ts
 */

import fs from "fs";
import path from "path";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error("ERROR: OPENAI_API_KEY not set");
  process.exit(1);
}

const BLOG_DIR = path.join(process.cwd(), "content", "blog");
const TODAY = new Date().toISOString().split("T")[0];

interface ExistingPost {
  slug: string;
  title: string;
  category: string;
  tags: string[];
}

function getExistingPosts(): ExistingPost[] {
  if (!fs.existsSync(BLOG_DIR)) {
    fs.mkdirSync(BLOG_DIR, { recursive: true });
    return [];
  }

  return fs.readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((file) => {
      const content = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8");
      const fm = content.match(/^---\n([\s\S]*?)\n---/)?.[1] || "";
      const getField = (field: string) =>
        fm.match(new RegExp(`^${field}:\\s*"?(.+?)"?$`, "m"))?.[1]?.replace(/"/g, "") || "";
      const tags = fm.match(/^tags:\s*\[(.+)\]$/m)?.[1]
        ?.split(",").map((t) => t.trim().replace(/"/g, "")) || [];
      return { slug: file.replace(".mdx", ""), title: getField("title"), category: getField("category"), tags };
    });
}

const CATEGORIES = [
  { category: "tutoriales", hint: "Write a step-by-step tutorial about a specific transcription use case. Topics: transcribing podcast episodes for show notes, converting TikTok videos to blog posts, creating subtitles from webinars, transcribing interviews for research, extracting quotes from YouTube videos." },
  { category: "comparativas", hint: "Write a comparison article: transcription tools comparison, export formats for specific use cases, manual vs AI transcription, real-time vs batch, free vs paid options, Whisper vs other models." },
  { category: "tips", hint: "Write practical tips: getting better accuracy, optimizing audio, using transcriptions for SEO, repurposing video content, productivity hacks with AI transcription, multi-language transcription tips." },
  { category: "tendencias", hint: "Write about a 2026 trend: AI transcription changing content creation, multi-language content rise, AI in education, creators using transcription for social media, voice-first content, AI accessibility." },
  { category: "casos-de-uso", hint: "Write about an industry use case: journalists, students, marketers, podcasters, legal professionals, accessibility specialists, researchers, teachers, content agencies." },
];

function pickCategory(existing: ExistingPost[]) {
  const counts = new Map(CATEGORIES.map((c) => [c.category, 0]));
  existing.forEach((p) => counts.set(p.category, (counts.get(p.category) ?? 0) + 1));
  return CATEGORIES.sort((a, b) => (counts.get(a.category) ?? 0) - (counts.get(b.category) ?? 0))[0];
}

async function callOpenAI(messages: { role: string; content: string }[]): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_API_KEY}` },
    body: JSON.stringify({ model: "gpt-4o", messages, max_tokens: 4000, temperature: 0.8 }),
  });
  if (!res.ok) throw new Error(`OpenAI error: ${res.status} ${await res.text()}`);
  return (await res.json()).choices[0].message.content;
}

async function main() {
  console.log(`📝 Auto Blog — ${TODAY}\n`);

  const existing = getExistingPosts();
  console.log(`Found ${existing.length} existing posts`);

  const category = pickCategory(existing);
  console.log(`Category: ${category.category}`);

  const existingTitles = existing.map((p) => `- "${p.title}" (${p.category})`).join("\n");
  const existingTags = [...new Set(existing.flatMap((p) => p.tags))].join(", ");

  const content = await callOpenAI([
    {
      role: "system",
      content: `You are an expert SEO content writer for Transcrify, an AI video-to-text transcription tool.
Write in SPANISH. Author: "Rodri".
Transcrify supports: YouTube, TikTok, Instagram, podcasts, webinars, Twitch.
Formats: TXT, PDF, Markdown, SRT, JSON. Uses OpenAI Whisper + GPT.

RULES:
- Spanish, natural, engaging, 800-1200 words body
- SEO-optimized H2/H3 headings, good keyword density
- Mention Transcrify naturally 2-3 times with CTA
- Link existing posts using /blog/[slug] when relevant
- Use ## for H2 and ### for H3`,
    },
    {
      role: "user",
      content: `Category: "${category.category}". ${category.hint}

EXISTING (do NOT repeat):
${existingTitles || "None"}
Tags used: ${existingTags || "None"}

Return EXACT format:
---
title: "Title in Spanish"
description: "SEO description ~150 chars"
date: "${TODAY}"
author: "Rodri"
category: "${category.category}"
tags: ["tag1", "tag2", "tag3", "tag4"]
featured: false
pillar: false
---

[Content here]`,
    },
  ]);

  const titleMatch = content.match(/^title:\s*"(.+)"$/m);
  const title = titleMatch ? titleMatch[1] : "nuevo-articulo";
  const slug = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60)
    .replace(/-$/, "");

  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  if (fs.existsSync(filePath)) {
    const newPath = path.join(BLOG_DIR, `${slug}-${Date.now()}.mdx`);
    fs.writeFileSync(newPath, content.trim(), "utf-8");
    console.log(`✅ Created: ${path.basename(newPath)}`);
  } else {
    fs.writeFileSync(filePath, content.trim(), "utf-8");
    console.log(`✅ Created: ${slug}.mdx`);
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
