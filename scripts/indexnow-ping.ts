/**
 * Pings IndexNow (Bing, Yandex, Seznam, Naver) with the latest URLs.
 * Called after auto-blog generation so new posts get crawled within hours.
 *
 * Usage: npx tsx scripts/indexnow-ping.ts [url1 url2 ...]
 * If no URLs passed, pings homepage + sitemap + all blog posts.
 */
import fs from "fs";
import path from "path";

const HOST = "transcrify.es";
const KEY = "7454232e223fc6fecae862efe4564921";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

function collectBlogUrls(): string[] {
  const dir = path.join(process.cwd(), "content", "blog");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => `https://${HOST}/blog/${f.replace(/\.mdx$/, "")}`);
}

async function main() {
  const cliUrls = process.argv.slice(2);
  const urlList =
    cliUrls.length > 0
      ? cliUrls
      : [
          `https://${HOST}/`,
          `https://${HOST}/blog`,
          `https://${HOST}/pricing`,
          `https://${HOST}/tools`,
          ...collectBlogUrls(),
        ];

  const body = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList,
  };

  const res = await fetch("https://api.indexnow.org/IndexNow", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  console.log(`IndexNow → ${res.status} for ${urlList.length} URLs`);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(text);
  }

  // Also ping Google sitemap (still works for discovery)
  await fetch(
    `https://www.google.com/ping?sitemap=https://${HOST}/sitemap.xml`
  ).catch(() => {});
  console.log("Sitemap ping sent to Google");
}

main().catch((e) => {
  console.error(e);
  process.exit(0); // never fail CI on ping errors
});
