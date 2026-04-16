import { Metadata } from "next";
import { getAllPosts, getCategories } from "@/lib/blog";
import PostCard from "@/components/blog/post-card";
import BlogSidebar from "@/components/blog/blog-sidebar";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { dictionary } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Blog | Transcrify",
  description:
    "Articulos, guias y tutoriales sobre transcripcion de video a texto con inteligencia artificial.",
  openGraph: {
    title: "Blog | Transcrify",
    description:
      "Articulos, guias y tutoriales sobre transcripcion de video a texto con IA.",
  },
};

export default function BlogPage() {
  const posts = getAllPosts();
  const categories = getCategories();
  const featured = posts.find((p) => p.featured);
  const regular = posts.filter((p) => p.slug !== featured?.slug);
  const dict = dictionary.es;

  return (
    <div className="min-h-screen bg-black">
      <Navbar dict={dict} lang="es" />

      <main className="container mx-auto px-4 pt-32 pb-20">
        {/* Hero */}
        <div className="text-center mb-16">
          <AnimatedGradientText className="text-sm mb-4">
            Blog de Transcrify
          </AnimatedGradientText>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-200 via-white to-blue-200 bg-clip-text text-transparent mb-4">
            Blog
          </h1>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
            Guias, tutoriales y novedades sobre transcripcion de video a texto
            con inteligencia artificial.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main content */}
          <div className="lg:col-span-3">
            {/* Featured post */}
            {featured && (
              <div className="mb-12">
                <PostCard post={featured} featured />
              </div>
            )}

            {/* Regular posts grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {regular.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>

            {posts.length === 0 && (
              <p className="text-neutral-500 text-center py-20">
                No hay articulos todavia. Vuelve pronto.
              </p>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <BlogSidebar categories={categories} />
          </div>
        </div>
      </main>

      <Footer dict={dict} />
    </div>
  );
}
