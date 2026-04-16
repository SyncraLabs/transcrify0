import toolPagesData from "@/data/tool-pages.json";

export interface ToolPage {
  slug: string;
  title: string;
  h1: string;
  description: string;
  source: string;
  language: string;
  intro: string;
  tips: string[];
  specs: { label: string; value: string; icon: string }[];
  faqs: { question: string; answer: string }[];
  relatedSlugs: string[];
}

const pages: ToolPage[] = toolPagesData as ToolPage[];

export function getAllToolPages(): ToolPage[] {
  return pages;
}

export function getToolPageBySlug(slug: string): ToolPage | null {
  return pages.find((p) => p.slug === slug) ?? null;
}

export function getRelatedToolPages(slug: string, limit = 4): ToolPage[] {
  const current = getToolPageBySlug(slug);
  if (!current) return pages.slice(0, limit);

  // Prefer same source or same language
  const scored = pages
    .filter((p) => p.slug !== slug)
    .map((p) => {
      let score = 0;
      if (p.source === current.source) score += 2;
      if (p.language === current.language) score += 1;
      return { page: p, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((s) => s.page);
}

export function getToolPagesBySource(source: string): ToolPage[] {
  return pages.filter((p) => p.source === source);
}

export function getAllSources(): string[] {
  return [...new Set(pages.map((p) => p.source))];
}
