/**
 * Auto Blog Post Generator
 *
 * Generates a unique, SEO-optimized blog post daily using OpenAI.
 * Analyzes existing posts to avoid repetition, targets trending topics
 * in the transcription/AI/video space.
 *
 * Usage:
 *   npx tsx scripts/auto-blog.ts
 *
 * Environment:
 *   OPENAI_API_KEY - Required (already in .env.local)
 *
 * What it does:
 *   1. Reads all existing blog posts to avoid topic repetition
 *   2. Picks a topic from a rotating strategy (trending, tutorial, comparison, tips, news)
 *   3. Generates a full MDX post with proper frontmatter using GPT-4o
 *   4. Writes the file to content/blog/
 *   5. Commits and pushes to GitHub (triggers Vercel auto-deploy)
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// Load env from .env.local
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const match = line.match(/^([A-Z_]+)=(.+)$/);
    if (match) process.env[match[1]] = match[2];
  }
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error("ERROR: OPENAI_API_KEY not found in environment");
  process.exit(1);
}

const BLOG_DIR = path.join(process.cwd(), "content", "blog");
const TODAY = new Date().toISOString().split("T")[0]; // 2026-04-16

// ─── Step 1: Read existing posts ────────────────────────────────────────────

interface ExistingPost {
  slug: string;
  title: string;
  category: string;
  tags: string[];
  date: string;
}

function getExistingPosts(): ExistingPost[] {
  if (!fs.existsSync(BLOG_DIR)) {
    fs.mkdirSync(BLOG_DIR, { recursive: true });
    return [];
  }

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));
  return files.map((file) => {
    const content = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8");
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) return null;

    const fm = frontmatterMatch[1];
    const getField = (field: string) => {
      const match = fm.match(new RegExp(`^${field}:\\s*"?(.+?)"?$`, "m"));
      return match ? match[1].replace(/^"|"$/g, "") : "";
    };
    const getTags = () => {
      const match = fm.match(/^tags:\s*\[(.+)\]$/m);
      if (!match) return [];
      return match[1].split(",").map((t) => t.trim().replace(/"/g, ""));
    };

    return {
      slug: file.replace(".mdx", ""),
      title: getField("title"),
      category: getField("category"),
      tags: getTags(),
      date: getField("date"),
    };
  }).filter((p): p is ExistingPost => p !== null);
}

// ─── Step 2: Topic strategy ─────────────────────────────────────────────────

const TOPIC_CATEGORIES = [
  {
    category: "tutoriales",
    prompt_hint: "Write a step-by-step tutorial about a specific transcription use case. Examples: transcribing podcast episodes for show notes, converting TikTok videos to blog posts, creating subtitles from webinar recordings, transcribing interviews for research.",
  },
  {
    category: "comparativas",
    prompt_hint: "Write a comparison article relevant to transcription. Examples: comparing transcription tools, comparing export formats for specific use cases, manual vs AI transcription, real-time vs batch transcription, free vs paid transcription options.",
  },
  {
    category: "tips",
    prompt_hint: "Write a practical tips article. Examples: tips for getting better transcription accuracy, optimizing audio before transcription, using transcriptions for SEO, repurposing video content with transcriptions, productivity hacks with AI transcription.",
  },
  {
    category: "tendencias",
    prompt_hint: "Write about a current trend in AI, video content, or transcription technology in 2026. Examples: how AI transcription is changing content creation, the rise of multi-language content, AI in education through transcription, how creators use transcription for social media, voice-to-text trends.",
  },
  {
    category: "casos-de-uso",
    prompt_hint: "Write about a specific industry or professional use case for transcription. Examples: transcription for journalists, transcription for students, transcription for marketers, transcription for podcasters, transcription for legal professionals, transcription for accessibility.",
  },
];

function pickCategory(existing: ExistingPost[]): typeof TOPIC_CATEGORIES[0] {
  // Count posts per category
  const counts = new Map<string, number>();
  for (const cat of TOPIC_CATEGORIES) {
    counts.set(cat.category, 0);
  }
  for (const post of existing) {
    counts.set(post.category, (counts.get(post.category) ?? 0) + 1);
  }

  // Pick the category with fewest posts (balanced distribution)
  const sorted = TOPIC_CATEGORIES.sort(
    (a, b) => (counts.get(a.category) ?? 0) - (counts.get(b.category) ?? 0)
  );
  return sorted[0];
}

// ─── Step 3: Generate post with OpenAI ──────────────────────────────────────

async function callOpenAI(messages: { role: string; content: string }[]): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages,
      max_tokens: 4000,
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${err}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function generatePost(
  category: typeof TOPIC_CATEGORIES[0],
  existing: ExistingPost[]
): Promise<{ slug: string; content: string }> {
  const existingTitles = existing.map((p) => `- "${p.title}" (${p.category})`).join("\n");
  const existingTags = [...new Set(existing.flatMap((p) => p.tags))].join(", ");

  const systemPrompt = `You are an expert SEO content writer for Transcrify, an AI-powered video-to-text transcription tool.
You write in SPANISH. Your author name is "Rodri".
Transcrify supports: YouTube, TikTok, Instagram, podcasts, webinars, Twitch.
Export formats: TXT, PDF, Markdown, SRT, JSON.
It uses OpenAI Whisper for transcription and GPT for AI titles.

RULES:
- Write in Spanish, natural and engaging
- SEO-optimized: clear H2s, good keyword density (not stuffing)
- Include practical value the reader can use immediately
- Mention Transcrify naturally 2-3 times with a CTA to try it
- Link to existing blog posts when relevant using markdown links to /blog/[slug]
- 800-1200 words of body content
- Use ## for H2 and ### for H3 headings
- NO placeholder content, everything must be real and useful`;

  const userPrompt = `Generate a blog post for the category "${category.category}".

${category.prompt_hint}

EXISTING POSTS (do NOT repeat these topics):
${existingTitles || "None yet"}

EXISTING TAGS USED: ${existingTags || "None"}

Return the post in this EXACT format (including the --- delimiters):

---
title: "The post title in Spanish"
description: "SEO meta description in Spanish, ~150 chars"
date: "${TODAY}"
author: "Rodri"
category: "${category.category}"
tags: ["tag1", "tag2", "tag3", "tag4"]
featured: false
pillar: false
---

[Post content in markdown here with ## H2 and ### H3 headings]

IMPORTANT: The entire response must be valid MDX. Start with --- and end with the content. No extra text before or after.`;

  const content = await callOpenAI([
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ]);

  // Extract slug from title
  const titleMatch = content.match(/^title:\s*"(.+)"$/m);
  const title = titleMatch ? titleMatch[1] : "nuevo-articulo";
  const slug = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60)
    .replace(/-$/, "");

  return { slug, content: content.trim() };
}

// ─── Step 4: Write file and git commit ──────────────────────────────────────

function writeAndCommit(slug: string, content: string): void {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);

  // Check if file already exists (avoid overwriting)
  if (fs.existsSync(filePath)) {
    console.log(`File ${slug}.mdx already exists. Adding date suffix...`);
    const newSlug = `${slug}-${Date.now()}`;
    writeAndCommit(newSlug, content);
    return;
  }

  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`✅ Created: content/blog/${slug}.mdx`);

  // Git add, commit, push
  try {
    execSync(`git add "content/blog/${slug}.mdx"`, { stdio: "inherit" });
    execSync(
      `git commit -m "blog: auto-generate post ${slug} [${TODAY}]"`,
      { stdio: "inherit" }
    );
    execSync("git push origin main", { stdio: "inherit" });
    console.log("✅ Pushed to GitHub → Vercel auto-deploy triggered");
  } catch (err) {
    console.error("⚠️  Git push failed. Post saved locally but not pushed.");
    console.error(err);
  }
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n📝 Auto Blog Generator — ${TODAY}\n`);

  // Step 1
  const existing = getExistingPosts();
  console.log(`Found ${existing.length} existing posts`);

  // Step 2
  const category = pickCategory(existing);
  console.log(`Selected category: ${category.category}`);

  // Step 3
  console.log("Generating post with GPT-4o...");
  const { slug, content } = await generatePost(category, existing);
  console.log(`Generated: "${slug}"`);

  // Step 4
  writeAndCommit(slug, content);

  console.log("\n🎉 Done!\n");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
