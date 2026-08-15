import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import type { JournalSeriesKey } from "@/lib/types";
import {
  journalAyahRefsByEntry,
  journalEntries,
  journalEntryBySlug,
  journalSeriesOrder,
  journalSourceNotesByEntry,
} from "@/lib/mock/journal";
import Ayah from "@/components/arabic/Ayah";
import Chip from "@/components/primitives/Chip";
import MonoLabel from "@/components/primitives/MonoLabel";
import Rule from "@/components/primitives/Rule";
import SectionLabel from "@/components/primitives/SectionLabel";
import StandingLine from "@/components/journal/StandingLine";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    journalEntries.map((e) => ({ locale, series: e.series_key, slug: e.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ series: string; slug: string }>;
}) {
  const { series, slug } = await params;
  const entry = journalEntryBySlug(series, slug);
  return { title: entry ? `${entry.title} · Journal` : "Journal" };
}

/** Minimal emphasis-aware paragraph renderer — same convention as
 * components/feature/FeatureArticle.tsx's Para, not a new pattern. */
function Para({ text }: { text: string }) {
  const parts = text.split(/(\*[^*]+\*)/g);
  return (
    <p className="mb-4 text-[17px] leading-[1.7]">
      {parts.map((part, i) =>
        part.startsWith("*") && part.endsWith("*") ? (
          <em key={i} className="font-editorial italic">
            {part.slice(1, -1)}
          </em>
        ) : (
          part
        ),
      )}
    </p>
  );
}

/** ⭐ /[locale]/journal/[series]/[slug] — the Journal reading template.
 * Deliberately NOT the Issue feature template: no Depth Dial, no drop cap,
 * no six-beat spine. One reading depth, numbered entries, a source rail. */
export default async function JournalEntryPage({
  params,
}: {
  params: Promise<{ locale: string; series: string; slug: string }>;
}) {
  const { locale, series, slug } = await params;
  setRequestLocale(locale);

  const seriesMeta = journalSeriesOrder.find((s) => s.key === series);
  if (!seriesMeta) notFound();
  const entry = journalEntryBySlug(series, slug);
  if (!entry) notFound();

  const ayahRefs = journalAyahRefsByEntry[entry.id] ?? [];
  const sourceNotes = journalSourceNotesByEntry[entry.id] ?? [];
  const readingMinutes = Math.max(1, Math.round(entry.entries.reduce((n, e) => n + e.body_md.split(/\s+/).length, 0) / 200));

  return (
    <div className="wrap pt-12">
      <MonoLabel as="p" className="text-muted">
        <Link href="/journal">Journal</Link> /{" "}
        <Link href={`/journal/${series}`}>{seriesMeta.name}</Link>
      </MonoLabel>

      <SectionLabel className="mt-4">{seriesMeta.name}</SectionLabel>
      <h1 className="mt-2 font-display text-[clamp(32px,5vw,52px)] font-black leading-[0.98] tracking-[-0.035em]">
        {entry.title}
      </h1>
      <p className="mt-4 max-w-[60ch] font-editorial text-[19px] italic leading-[1.5]">
        {entry.deck}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <MonoLabel className="text-muted">
          {entry.author} · {readingMinutes} min
        </MonoLabel>
        {entry.editorial_status === "human_review_pending" && (
          <Chip tone="disabled">human review pending</Chip>
        )}
      </div>

      <StandingLine className="mt-6 max-w-[56ch]" />
      <Rule weight="major" className="mt-8" />

      <div className="grid gap-16 pt-10 lg:grid-cols-[7fr_3fr]">
        <div>
          {entry.entries.map((block) => (
            <section key={block.ordinal} className="mb-10">
              <div className="mb-4 flex items-baseline gap-4">
                <MonoLabel className="text-signal">{String(block.ordinal).padStart(2, "0")}</MonoLabel>
                <h2 className="font-display text-[22px] font-black tracking-[-0.02em]">{block.heading}</h2>
              </div>
              <Para text={block.body_md} />
            </section>
          ))}

          {ayahRefs.length > 0 && (
            <section className="mt-12 border-t border-rule pt-8">
              <SectionLabel>Referenced</SectionLabel>
              <div className="mt-6 flex flex-col gap-8">
                {ayahRefs.map((ref, i) => (
                  <Ayah
                    key={i}
                    surah={ref.surah}
                    from={ref.ayah}
                    sourceLine={
                      <MonoLabel className="text-gold">
                        Sūrah {ref.surah}:{ref.ayah}
                      </MonoLabel>
                    }
                  />
                ))}
              </div>
            </section>
          )}
        </div>

        <aside>
          <SectionLabel>Source notes</SectionLabel>
          <Rule weight="major" className="mt-3" />
          {sourceNotes.length === 0 ? (
            <p className="mt-4 text-[13px] leading-[1.6] text-muted">None recorded for this entry.</p>
          ) : (
            <ul className="mt-4 flex flex-col gap-4">
              {sourceNotes.map((note, i) => (
                <li key={i} className="border-b border-rule pb-4 text-[13px] leading-[1.6] text-muted">
                  {note}
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}
