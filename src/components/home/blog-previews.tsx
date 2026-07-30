import { ArrowRight, Clock } from "lucide-react";
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
        {blogPosts.map((post, i) => (
          <Reveal key={post.slug} index={i}>
            <article className="card-surface group flex h-full flex-col overflow-hidden">
              <div
                className="relative flex h-44 items-end p-5"
                style={{ background: `linear-gradient(135deg, ${post.accent[0]}, ${post.accent[1]})` }}
              >
                <div aria-hidden className="absolute -right-8 -top-8 size-32 rounded-full bg-white/20 blur-2xl" />
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
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
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
