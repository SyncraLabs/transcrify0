import { Metadata } from "next";
import { getPostsByCategory, getCategories } from "@/lib/blog";
import PostCard from "@/components/blog/post-card";
import BlogSidebar from "@/components/blog/blog-sidebar";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { dictionary } from "@/lib/i18n";

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  const categories = getCategories();
  return categories.map((c) => ({ category: c.name }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  const label = category.charAt(0).toUpperCase() + category.slice(1);
  return {
    title: `${label} | Blog Transcrify`,
    description: `Articulos sobre ${category} en el blog de Transcrify.`,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;
  const posts = getPostsByCategory(category);
  const categories = getCategories();
  const dict = dictionary.es;
  const label = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <div className="min-h-screen bg-black">
      <Navbar dict={dict} lang="es" />

      <main className="container mx-auto px-4 pt-32 pb-20">
        <div className="mb-12">
          <p className="text-sm text-neutral-500 mb-2">Categoria</p>
          <h1 className="text-3xl md:text-5xl font-bold text-white">{label}</h1>
          <p className="text-neutral-400 mt-2">
            {posts.length} {posts.length === 1 ? "articulo" : "articulos"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {posts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
            {posts.length === 0 && (
              <p className="text-neutral-500 text-center py-20">
                No hay articulos en esta categoria.
              </p>
            )}
          </div>
          <div className="lg:col-span-1">
            <BlogSidebar categories={categories} />
          </div>
        </div>
      </main>

      <Footer dict={dict} />
    </div>
  );
}
