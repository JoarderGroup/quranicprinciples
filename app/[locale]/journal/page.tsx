import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { journalEntries, journalSeriesOrder } from "@/lib/mock/journal";
import Chip from "@/components/primitives/Chip";
import MonoLabel from "@/components/primitives/MonoLabel";
import Rule from "@/components/primitives/Rule";
import SectionLabel from "@/components/primitives/SectionLabel";
import StandingLine from "@/components/journal/StandingLine";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata() {
  return { title: "Journal" };
}

/** ⭐ /[locale]/journal — landing. A Journal is not an Issue: no department
 * rail, no Depth Dial, no five-beat spine. Series shelves + standing line
 * only, per Prompt I §5. */
export default async function JournalLandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="wrap pt-12">
      <SectionLabel>Journal</SectionLabel>
      <h1 className="mt-3 font-display text-[clamp(38px,6vw,64px)] font-black leading-[0.95] tracking-[-0.035em]">
        Long-form, numbered, one narrator.
      </h1>
      <StandingLine className="mt-5 max-w-[56ch]" />

      <div className="mt-14">
        {journalSeriesOrder.map(({ key, name }) => {
          const entries = journalEntries.filter((e) => e.series_key === key);
          if (entries.length === 0) {
            return (
              <section key={key} className="border-t border-rule py-8">
                <div className="flex items-baseline justify-between">
                  <h2 className="font-display text-[20px] font-black tracking-[-0.02em]">
                    <Link href={`/journal/${key}`}>{name}</Link>
                  </h2>
                  <MonoLabel className="text-muted">nothing published yet</MonoLabel>
                </div>
              </section>
            );
          }
          return (
            <section key={key} className="border-t border-rule py-8">
              <div className="flex items-baseline justify-between">
                <h2 className="font-display text-[20px] font-black tracking-[-0.02em]">
                  <Link href={`/journal/${key}`}>{name}</Link>
                </h2>
                <MonoLabel className="text-muted">
                  {entries.length} {entries.length === 1 ? "entry" : "entries"}
                </MonoLabel>
              </div>
              <ul className="mt-4 flex flex-col gap-3">
                {entries.map((e) => (
                  <li key={e.id}>
                    <Link
                      href={`/journal/${key}/${e.slug}`}
                      className="flex items-baseline justify-between gap-4 border-b border-rule py-2"
                    >
                      <span className="font-editorial text-[18px] italic">{e.title}</span>
                      {e.editorial_status === "human_review_pending" && (
                        <Chip tone="disabled">human review pending</Chip>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
      <Rule weight="major" className="mt-2" />
    </div>
  );
}
