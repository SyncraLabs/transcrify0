import { getAllPosts } from "@/lib/blog";

export async function GET() {
  const posts = getAllPosts();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://transcrify.com";

  const items = posts
    .map(
      (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${appUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${appUrl}/blog/${post.slug}</guid>
      <description><![CDATA[${post.description}]]></description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <author>rodri@transcrify.com (Rodri)</author>
      <category>${post.category}</category>
    </item>`
    )
    .join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Transcrify Blog</title>
    <link>${appUrl}/blog</link>
    <description>Guias, tutoriales y novedades sobre transcripcion de video a texto con IA.</description>
    <language>es</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${appUrl}/feed.xml" rel="self" type="application/rss+xml" />${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
