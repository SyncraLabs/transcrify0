import type { Metadata } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://transcrify.com";

export function generatePageMeta(opts: {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  publishedTime?: string;
  author?: string;
}): Metadata {
  const url = `${appUrl}${opts.path}`;
  return {
    title: opts.title,
    description: opts.description,
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      type: opts.type || "website",
      ...(opts.publishedTime && { publishedTime: opts.publishedTime }),
      ...(opts.author && { authors: [opts.author] }),
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
    },
    alternates: { canonical: url },
  };
}

export function generateArticleJsonLd(post: {
  title: string;
  description: string;
  date: string;
  slug: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: {
      "@type": "Person",
      name: "Rodri",
      description: "AI Creator & Founder. Builds AI-powered tools and runs an AI agency working with large enterprises.",
    },
    publisher: { "@type": "Organization", name: "Transcrify" },
    mainEntityOfPage: `${appUrl}/blog/${post.slug}`,
  };
}

export function generateSoftwareAppJsonLd(page: {
  title: string;
  description: string;
  slug: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: page.title,
    description: page.description,
    url: `${appUrl}/tools/${page.slug}`,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
}

export function generateFaqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

export function generateOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Transcrify",
    url: appUrl,
    description: "AI-powered video to text transcription platform.",
    founder: {
      "@type": "Person",
      name: "Rodri",
      description: "AI Creator & Founder. Builds AI-powered tools and runs an AI agency working with large enterprises.",
    },
  };
}

export function generateBreadcrumbJsonLd(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
