import { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllPosts, getPostBySlug, getRelatedPosts } from "@/lib/blog";
import PostHeader from "@/components/blog/post-header";
import TableOfContents from "@/components/blog/table-of-contents";
import RelatedPosts from "@/components/blog/related-posts";
import ShareButtons from "@/components/blog/share-buttons";
import ReadingProgress from "@/components/blog/reading-progress";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { dictionary } from "@/lib/i18n";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Not Found" };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://transcrify.es";
  const ogImage = post.image ? `${appUrl}${post.image}` : undefined;

  return {
    title: `${post.title} | Transcrify Blog`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      url: `${appUrl}/blog/${post.slug}`,
      ...(ogImage && { images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }] }),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      ...(ogImage && { images: [ogImage] }),
    },
    alternates: {
      canonical: `${appUrl}/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const related = getRelatedPosts(slug, 3);
  const dict = dictionary.es;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://transcrify.es";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    ...(post.image && { image: `${appUrl}${post.image}` }),
    author: {
      "@type": "Person",
      name: "Rodri",
      description:
        "AI Creator & Founder. Builds AI-powered tools and runs an AI agency working with large enterprises.",
    },
    publisher: {
      "@type": "Organization",
      name: "Transcrify",
    },
    mainEntityOfPage: `${appUrl}/blog/${post.slug}`,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: appUrl },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${appUrl}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: `${appUrl}/blog/${post.slug}` },
    ],
  };

  return (
    <div className="min-h-screen bg-black">
      <ReadingProgress />
      <Navbar dict={dict} lang="es" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <main className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto">
          <PostHeader
            title={post.title}
            author={post.author}
            date={post.date}
            readingTime={post.readingTime}
            category={post.category}
            tags={post.tags}
            image={post.image}
          />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mt-12">
            {/* Article content */}
            <article className="lg:col-span-3 prose prose-lg prose-dark max-w-none">
              <MDXRemote source={post.content} />
            </article>

            {/* TOC sidebar */}
            <aside className="hidden lg:block lg:col-span-1">
              <TableOfContents content={post.content} />
            </aside>
          </div>

          {/* Share */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <ShareButtons
              url={`${appUrl}/blog/${post.slug}`}
              title={post.title}
            />
          </div>

          {/* Related posts */}
          {related.length > 0 && (
            <div className="mt-16">
              <RelatedPosts posts={related} />
            </div>
          )}
        </div>
      </main>

      <Footer dict={dict} />
    </div>
  );
}
