import type { Metadata } from "next";
import { ArrowLeft, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/ui/reveal";
import { blogMap, blogPosts } from "@/lib/data/content";

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = blogMap[slug];
  if (!post) return { title: "Article not found" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, type: "article", images: [post.image] },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogMap[slug];
  if (!post) notFound();

  const more = blogPosts.filter((p) => p.slug !== slug).slice(0, 3);
  const dateStr = new Date(post.date).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" });

  return (
    <article className="pb-8">
      <div className="container-x max-w-3xl py-10">
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-foreground">
          <ArrowLeft size={15} /> Back to journal
        </Link>
        <span className="eyebrow mt-6 block">{post.category}</span>
        <h1 className="mt-3 font-display text-4xl font-bold leading-tight sm:text-5xl">{post.title}</h1>
        <div className="mt-5 flex items-center gap-3 text-sm text-muted">
          <span className="font-medium text-foreground">{post.author}</span> · <span>{dateStr}</span> ·
          <span className="inline-flex items-center gap-1"><Clock size={13} /> {post.readMinutes} min read</span>
        </div>
      </div>

      <div className="container-x max-w-4xl">
        <div className="relative aspect-[16/8] overflow-hidden rounded-[2rem] border border-border">
          <Image src={post.image} alt={post.title} fill sizes="(max-width:1024px) 100vw, 900px" priority className="object-cover" />
        </div>
      </div>

      <div className="container-x max-w-3xl py-10">
        <div className="space-y-5 text-lg leading-relaxed text-foreground/90">
          <p className="text-xl font-medium">{post.excerpt}</p>
          {post.body.map((para, i) => (
            <p key={i} className="text-muted">{para}</p>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-surface p-6">
          <p className="text-sm font-semibold">Written by {post.author}</p>
          <p className="mt-1 text-sm text-muted">Part of the Oraimo team, helping you choose and get the most from your tech.</p>
        </div>
      </div>

      <section className="container-x max-w-5xl py-8">
        <h2 className="font-display text-2xl font-bold">Keep reading</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {more.map((p, i) => (
            <Reveal key={p.slug} index={i}>
              <Link href={`/blog/${p.slug}`} className="card-surface group flex h-full flex-col overflow-hidden">
                <div className="relative h-36 overflow-hidden">
                  <Image src={p.image} alt={p.title} fill sizes="33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display font-semibold leading-snug group-hover:text-brand-600 dark:group-hover:text-brand-400">{p.title}</h3>
                  <span className="mt-3 text-sm font-semibold text-brand-600 dark:text-brand-400">Read →</span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </article>
  );
}
