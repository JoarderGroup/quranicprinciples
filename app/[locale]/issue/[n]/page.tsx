import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { departments } from "@/lib/mock/departments";
import { inThisIssue, issue, principle, rootOccurrences } from "@/lib/mock/principle";
import Ayah from "@/components/arabic/Ayah";
import RootChip from "@/components/arabic/RootChip";
import Chip from "@/components/primitives/Chip";
import MonoLabel from "@/components/primitives/MonoLabel";
import Reveal from "@/components/motion/Reveal";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => [{ locale, n: "1" }]);
}

export async function generateMetadata() {
  return { title: `Issue 01 · ${principle.name_translit}` };
}

/** ⭐ ISSUE COVER — board 02 exactly. Full-bleed --ink. */
export default async function IssueCover({
  params,
}: {
  params: Promise<{ locale: string; n: string }>;
}) {
  const { locale, n } = await params;
  setRequestLocale(locale);
  if (Number(n) !== issue.number) notFound();
  const t = await getTranslations("issue");

  /* The five-department rail pinned to the bottom edge — board 02. */
  const railKeys = ["asl", "waqiah", "uqdah", "athar", "amal"];
  const rail = railKeys.map((k) => departments.find((d) => d.key === k)!);

  return (
    <div className="bg-ink text-paper">
      <div className="wrap flex min-h-[calc(100vh-105px)] flex-col pt-14">
        <Reveal>
          <p className="flex flex-wrap items-center gap-4">
            <MonoLabel className="text-gold">
              {t("issueNo", { number: String(issue.number).padStart(2, "0") })}
            </MonoLabel>
            <span aria-hidden="true" className="inline-block h-px w-12 bg-gold" />
            <MonoLabel>{t("principleOf")}</MonoLabel>
          </p>
        </Reveal>

        {/* Principle name at display scale with the accent split — full row,
            one line, board 02. */}
        <Reveal index={1}>
          <h1 className="pt-4 font-display text-[clamp(64px,12vw,176px)] font-black leading-[0.86] tracking-[-0.035em]">
            AL-<span className="text-signal">MĪZĀN</span>
          </h1>
        </Reveal>

        <div className="grid gap-12 pt-2 lg:grid-cols-[7fr_5fr]">
          <div>
            <Reveal index={2}>
              <p
                lang="ar"
                className="ar-block font-arabic-ui text-[clamp(40px,6vw,88px)] font-bold leading-[1.2] text-gold"
              >
                {principle.name_ar}
              </p>
            </Reveal>

            <Reveal index={3} className="mt-12 max-w-[56ch]">
              <Ayah
                surah={55}
                from={7}
                to={8}
                size="lg"
                sourceLine={
                  <MonoLabel className="text-gold">
                    Sūrah ar-Raḥmān 55:7–8 &middot;{" "}
                    <RootChip
                      root={principle.root_letters}
                      occurrences={rootOccurrences}
                      className="text-gold"
                    />
                  </MonoLabel>
                }
              />
            </Reveal>
          </div>

          {/* In this issue — contents right. */}
          <Reveal index={4}>
            <section aria-labelledby="toc-title" className="lg:pt-6">
              <MonoLabel as="h2" id="toc-title" className="text-gold">
                {t("inThisIssue")}
              </MonoLabel>
              <ol className="mt-4 border-t border-rule/40">
                {inThisIssue.map((item) => (
                  <li key={item.title} className="border-b border-rule/40">
                    <Link
                      href={`/p/${principle.slug}`}
                      className="flex min-h-[56px] items-baseline justify-between gap-6 py-4"
                    >
                      <span className="font-editorial text-[clamp(18px,2vw,23px)] italic leading-[1.3]">
                        {item.title}
                      </span>
                      <MonoLabel className="shrink-0 text-muted">
                        {item.seed ? "Seed" : `${item.minutes} min`}
                      </MonoLabel>
                    </Link>
                  </li>
                ))}
              </ol>

              <div className="mt-8 flex flex-wrap items-center gap-2">
                <MonoLabel className="me-2 text-muted">{t("depth")}</MonoLabel>
                {(["seed", "spark", "story", "source"] as const).map((d) => (
                  <Chip
                    key={d}
                    as={Link}
                    href={`/p/${principle.slug}?d=${d}` as never}
                    tone={d === "story" ? "paper" : "outline"}
                  >
                    {d}
                  </Chip>
                ))}
              </div>
            </section>
          </Reveal>
        </div>

        {/* Five-department rail pinned to the bottom edge. */}
        <nav aria-label={t("inThisIssue")} className="mt-auto pt-16">
          <ul className="grid grid-cols-2 border-t border-rule/40 sm:grid-cols-5">
            {rail.map((d) => (
              <li key={d.key} className="border-e border-rule/40 last:border-e-0">
                <Link href={`/p/${principle.slug}`} className="block px-4 py-6">
                  <span lang="ar" className="ar-block block font-arabic-ui text-[24px] font-bold">
                    {d.name_ar}
                  </span>
                  <MonoLabel as="span" className="mt-3 block text-muted">
                    {d.name_en}
                  </MonoLabel>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
