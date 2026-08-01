import type { Metadata } from "next";
import { ArrowRight, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/ui/page-hero";
import { Reveal } from "@/components/ui/reveal";
import { blogPosts } from "@/lib/data/content";

export const metadata: Metadata = {
  title: "Journal",
  description: "Buying guides, how-tos and explainers from the SIR VERT ENTERPRISE team — pick the right gear and get the most from it.",
};

export default function BlogPage() {
  const [lead, ...rest] = blogPosts;
  return (
    <>
      <PageHero
        eyebrow="The journal"
        title="Guides &"
        accent="stories"
        description="Straight-talking advice on choosing and getting the best from your tech — no jargon, no fluff."
        crumbs={[{ label: "Journal" }]}
      />

      <div className="container-x py-12">
        {/* featured */}
        <Reveal>
          <Link href={`/blog/${lead.slug}`} className="card-surface group grid overflow-hidden lg:grid-cols-2">
            <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto">
              <Image src={lead.image} alt={lead.title} fill sizes="(max-width:1024px) 100vw, 50vw" priority className="object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
            <div className="flex flex-col justify-center p-8 lg:p-12">
              <span className="eyebrow">{lead.category}</span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight group-hover:text-brand-600 dark:group-hover:text-brand-400">{lead.title}</h2>
              <p className="mt-3 text-muted">{lead.excerpt}</p>
              <div className="mt-5 flex items-center gap-3 text-sm text-muted">
                <span>{lead.author}</span> · <span className="inline-flex items-center gap-1"><Clock size={13} /> {lead.readMinutes} min</span>
              </div>
              <span className="mt-6 inline-flex items-center gap-1.5 font-semibold text-brand-600 dark:text-brand-400">
                Read article <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        </Reveal>

        {/* grid */}
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((post, i) => (
            <Reveal key={post.slug} index={i}>
              <Link href={`/blog/${post.slug}`} className="card-surface group flex h-full flex-col overflow-hidden">
                <div className="relative h-48 overflow-hidden">
                  <Image src={post.image} alt={post.title} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  <span className="absolute bottom-3 left-3 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur">{post.category}</span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center gap-2 text-xs text-muted"><Clock size={13} /> {post.readMinutes} min read</div>
                  <h3 className="mt-2 font-display text-lg font-bold leading-snug group-hover:text-brand-600 dark:group-hover:text-brand-400">{post.title}</h3>
                  <p className="mt-2 flex-1 text-sm text-muted">{post.excerpt}</p>
                  <span className="mt-4 text-sm font-semibold text-brand-600 dark:text-brand-400">Read more →</span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </>
  );
}
