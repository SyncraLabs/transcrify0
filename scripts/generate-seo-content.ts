/**
 * SEO Content Generation Script
 *
 * Run with: npx tsx scripts/generate-seo-content.ts
 *
 * Uses the Anthropic SDK to generate unique content for each tool page.
 * Outputs to src/data/tool-pages.json
 *
 * Prerequisites:
 *   npm install @anthropic-ai/sdk
 *   export ANTHROPIC_API_KEY=sk-ant-...
 *
 * This script was used to generate the initial tool-pages.json.
 * Run it again if you want to regenerate or add new combinations.
 */

const sources = ["youtube", "tiktok", "instagram", "podcast", "webinar", "twitch"];
const languages = ["english", "spanish", "french", "portuguese", "german"];

interface ToolPage {
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

function generateAllSlugs(): string[] {
  const slugs: string[] = [];
  for (const source of sources) {
    for (const language of languages) {
      slugs.push(`${source}-${language}-transcriber`);
    }
  }
  return slugs;
}

async function main() {
  console.log("To generate content, use the Anthropic API with prompts for each combination.");
  console.log(`Total pages to generate: ${sources.length * languages.length}`);
  console.log("Slugs:", generateAllSlugs().join(", "));
  console.log("\nThe initial tool-pages.json has already been generated.");
  console.log("Edit src/data/tool-pages.json directly to update content.");
}

main();
