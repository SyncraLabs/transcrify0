import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllToolPages, getToolPageBySlug, getRelatedToolPages } from "@/lib/seo-pages";
import ToolPageLayout from "@/components/seo/tool-page-layout";
import FaqSection from "@/components/seo/faq-section";
import SpecsTable from "@/components/seo/specs-table";
import RelatedTools from "@/components/seo/related-tools";
import CtaBanner from "@/components/seo/cta-banner";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { dictionary } from "@/lib/i18n";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const pages = getAllToolPages();
  return pages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getToolPageBySlug(slug);
  if (!page) return { title: "Not Found" };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://transcrify.com";

  return {
    title: page.title,
    description: page.description,
    openGraph: {
      title: page.title,
      description: page.description,
      url: `${appUrl}/tools/${page.slug}`,
    },
    alternates: {
      canonical: `${appUrl}/tools/${page.slug}`,
    },
  };
}

export default async function ToolPage({ params }: PageProps) {
  const { slug } = await params;
  const page = getToolPageBySlug(slug);
  if (!page) notFound();

  const related = getRelatedToolPages(slug, 4);
  const dict = dictionary.es;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://transcrify.com";

  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: page.title,
    description: page.description,
    url: `${appUrl}/tools/${page.slug}`,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar dict={dict} lang="es" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <main className="pt-28 pb-20">
        <ToolPageLayout page={page}>
          {/* Specs */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Platform Specs</h2>
            <SpecsTable specs={page.specs} />
          </section>

          {/* FAQ */}
          <section className="mb-16">
            <FaqSection faqs={page.faqs} />
          </section>

          {/* Related tools */}
          {related.length > 0 && (
            <section className="mb-16">
              <RelatedTools pages={related} />
            </section>
          )}

          {/* CTA */}
          <CtaBanner />
        </ToolPageLayout>
      </main>

      <Footer dict={dict} />
    </div>
  );
}
