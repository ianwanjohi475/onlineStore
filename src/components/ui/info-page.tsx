import { PageHero } from "./page-hero";

export interface InfoSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

export function InfoPage({
  eyebrow,
  title,
  accent,
  description,
  updated,
  sections,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  description: string;
  updated?: string;
  sections: InfoSection[];
}) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} accent={accent} description={description} crumbs={[{ label: title }]} />
      <div className="container-x max-w-3xl py-12">
        {updated && <p className="mb-8 text-sm text-muted">Last updated: {updated}</p>}
        <div className="flex flex-col gap-10">
          {sections.map((s) => (
            <section key={s.heading}>
              <h2 className="font-display text-xl font-bold">{s.heading}</h2>
              {s.paragraphs?.map((p, i) => (
                <p key={i} className="mt-3 text-muted">{p}</p>
              ))}
              {s.bullets && (
                <ul className="mt-3 flex flex-col gap-2">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex gap-2.5 text-muted">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-500" />
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
