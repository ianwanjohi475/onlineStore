import { ArrowRight, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { blogPosts } from "@/lib/data/content";

export function BlogPreviews() {
  return (
    <section className="container-x py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading eyebrow="From the journal" title="Guides &" accent="stories" />
        <Reveal>
          <Link href="/about" className="text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">
            All articles →
          </Link>
        </Reveal>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {blogPosts.slice(0, 3).map((post, i) => (
          <Reveal key={post.slug} index={i}>
            <Link href={`/blog/${post.slug}`} className="card-surface group flex h-full flex-col overflow-hidden">
              <div className="relative h-44 overflow-hidden">
                <Image src={post.image} alt={post.title} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <span className="absolute bottom-4 left-4 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                  {post.category}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center gap-2 text-xs text-muted">
                  <Clock size={13} /> {post.readMinutes} min read
                </div>
                <h3 className="mt-2 font-display text-lg font-bold leading-snug group-hover:text-brand-600 dark:group-hover:text-brand-400">
                  {post.title}
                </h3>
                <p className="mt-2 flex-1 text-sm text-muted">{post.excerpt}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400">
                  Read more <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
