import { getTranslations, setRequestLocale } from "next-intl/server";
import Bidi from "@/components/arabic/Bidi";
import MonoLabel from "@/components/primitives/MonoLabel";
import Rule from "@/components/primitives/Rule";
import SectionLabel from "@/components/primitives/SectionLabel";
import Reveal from "@/components/motion/Reveal";
import CountUp from "@/components/soul/CountUp";
import CommandBar from "@/components/soul/CommandBar";
import FacultyBars from "@/components/soul/FacultyBars";
import SurahGrid from "@/components/soul/SurahGrid";
import { commandCounts, facultyCounts, soulStats } from "@/lib/mock/soul";

export async function generateMetadata() {
  return { title: "The Soul Index" };
}

/** ⭐ THE SOUL INDEX — 06-Soul-Index.md. Scroll-progressive throughout. */
export default async function SoulIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("soul");

  const counters = [
    { value: soulStats.commands, label: t("commands") },
    { value: soulStats.pieces, label: t("pieces") },
    { value: soulStats.faculties, label: t("faculties") },
  ];

  return (
    <div className="wrap pt-12">
      <header>
        <SectionLabel>
          {t("kicker")} &middot;{" "}
          <Bidi className="font-arabic-ui text-[12px] normal-case tracking-normal">
            فهرس النفس
          </Bidi>
        </SectionLabel>
        <h1 className="mt-3 font-display text-[clamp(38px,6vw,72px)] font-black leading-[0.95] tracking-[-0.035em]">
          {t("title")}
        </h1>
        {/* Permanent. Never remove — this line is what makes the page
            unimpeachable (06-Soul-Index.md, guard rails). */}
        <p className="mt-5 max-w-[52ch] font-editorial text-[clamp(17px,2vw,21px)] italic leading-[1.5] text-muted">
          {t("guardRail")}
        </p>
      </header>

      {/* 1 · Counter row — figures count up on enter. */}
      <section aria-label={`${soulStats.commands} ${t("commands")}`} className="mt-14">
        <Rule weight="major" />
        <div className="grid grid-cols-1 gap-px border-x border-b border-rule bg-rule sm:grid-cols-3">
          {counters.map((c, i) => (
            <div key={c.label} className="bg-paper p-6">
              <Reveal index={i}>
                <p className="font-display text-[clamp(48px,7vw,84px)] font-black leading-none tracking-[-0.035em]">
                  <CountUp value={c.value} />
                </p>
                <MonoLabel as="p" className="mt-2 text-muted">
                  {c.label}
                </MonoLabel>
              </Reveal>
            </div>
          ))}
        </div>
      </section>

      {/* 2 · Eight faculty bars. */}
      <section aria-labelledby="faculties-title" className="mt-16">
        <SectionLabel>{t("facultiesTitle")}</SectionLabel>
        <h2 id="faculties-title" className="sr-only">
          {t("facultiesTitle")}
        </h2>
        <div className="mt-4 border-t border-rule">
          <FacultyBars data={facultyCounts} />
        </div>
      </section>

      {/* 3 · Command-type stacked bar. */}
      <section aria-labelledby="command-title" className="mt-16">
        <SectionLabel>{t("commandTypeTitle")}</SectionLabel>
        <h2 id="command-title" className="sr-only">
          {t("commandTypeTitle")}
        </h2>
        <div className="mt-4">
          <CommandBar data={commandCounts} />
        </div>
      </section>

      {/* 4 · 114-square sūrah coverage grid. Mostly empty is correct. */}
      <section aria-labelledby="coverage-title" className="mt-16 pb-8">
        <SectionLabel>{t("coverageTitle")}</SectionLabel>
        <h2 id="coverage-title" className="sr-only">
          {t("coverageTitle")}
        </h2>
        <div className="mt-4">
          <SurahGrid />
        </div>
      </section>
    </div>
  );
}
