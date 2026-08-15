import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import type { JournalSeriesKey } from "@/lib/types";
import { journalEntriesBySeries, journalSeriesOrder } from "@/lib/mock/journal";
import Chip from "@/components/primitives/Chip";
import MonoLabel from "@/components/primitives/MonoLabel";
import Rule from "@/components/primitives/Rule";
import SectionLabel from "@/components/primitives/SectionLabel";
import StandingLine from "@/components/journal/StandingLine";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    journalSeriesOrder.map(({ key }) => ({ locale, series: key })),
  );
}

export async function generateMetadata({ params }: { params: Promise<{ series: string }> }) {
  const { series } = await params;
  const entry = journalSeriesOrder.find((s) => s.key === series);
  return { title: entry ? `${entry.name} · Journal` : "Journal" };
}

/** ⭐ /[locale]/journal/[series] — one series shelf. Same "not an Issue"
 * rule as the landing page: no department rail, no Depth Dial. */
export default async function JournalSeriesPage({
  params,
}: {
  params: Promise<{ locale: string; series: string }>;
}) {
  const { locale, series } = await params;
  setRequestLocale(locale);

  const seriesMeta = journalSeriesOrder.find((s) => s.key === series);
  if (!seriesMeta) notFound();
  const entries = journalEntriesBySeries(series as JournalSeriesKey);

  return (
    <div className="wrap pt-12">
      <MonoLabel as="p" className="text-muted">
        <Link href="/journal">Journal</Link>
      </MonoLabel>
      <SectionLabel className="mt-3">{seriesMeta.name}</SectionLabel>
      <h1 className="mt-2 font-display text-[clamp(34px,5vw,54px)] font-black leading-[0.95] tracking-[-0.035em]">
        {seriesMeta.name}
      </h1>
      <StandingLine className="mt-5 max-w-[56ch]" />

      <div className="mt-12">
        {entries.length === 0 ? (
          /* Deliberate, intentional-looking empty state (Prompt I §5) —
           * not a broken page, a shelf that's simply not filled yet. */
          <div className="border-t border-b border-rule py-16 text-center">
            <MonoLabel className="text-muted">nothing published in this series yet</MonoLabel>
          </div>
        ) : (
          <ul className="flex flex-col">
            {entries.map((e) => (
              <li key={e.id} className="border-t border-rule py-6">
                <Link href={`/journal/${series}/${e.slug}`} className="flex flex-col gap-2">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="font-editorial text-[24px] italic leading-tight">{e.title}</span>
                    {e.editorial_status === "human_review_pending" && (
                      <Chip tone="disabled">human review pending</Chip>
                    )}
                  </div>
                  <p className="max-w-[65ch] text-[15px] leading-[1.5] text-muted">{e.deck}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Rule weight="major" className="mt-2" />
    </div>
  );
}
