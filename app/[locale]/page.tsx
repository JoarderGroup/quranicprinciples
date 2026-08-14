import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { departments } from "@/lib/mock/departments";
import {
  essay,
  issue,
  popularReads,
  principle,
  rootOccurrences,
  standfirst,
} from "@/lib/mock/principle";
import { soulStats } from "@/lib/mock/soul";
import Ayah from "@/components/arabic/Ayah";
import Bidi from "@/components/arabic/Bidi";
import RootChip from "@/components/arabic/RootChip";
import ArtFrame from "@/components/primitives/ArtFrame";
import Chip from "@/components/primitives/Chip";
import MonoLabel from "@/components/primitives/MonoLabel";
import Panel from "@/components/primitives/Panel";
import PanelGrid from "@/components/primitives/PanelGrid";
import Rule from "@/components/primitives/Rule";
import SectionLabel from "@/components/primitives/SectionLabel";
import Reveal from "@/components/motion/Reveal";
import AyahActions from "@/components/home/AyahActions";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const waqiah = departments.find((d) => d.key === "waqiah")!;

  return (
    <div className="wrap">
      {/* Three columns at ≥1280px: [hero + rail + latest] | sidebar. */}
      <div className="grid gap-12 pt-10 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          {/* ⭐ HERO — current issue's feature. */}
          <section aria-labelledby="hero-title">
            <div className="grid gap-8 lg:grid-cols-[5fr_7fr]">
              <Reveal>
                <div className="flex h-full flex-col items-start">
                  <MonoLabel as="p" className="text-muted">
                    {t("currentIssue")}
                  </MonoLabel>
                  <SectionLabel className="mt-4">
                    <Bidi className="font-arabic-ui text-[12px] normal-case tracking-normal">
                      {waqiah.name_ar}
                    </Bidi>{" "}
                    &middot; {waqiah.name_en}
                  </SectionLabel>
                  <h1
                    id="hero-title"
                    className="mt-3 font-display text-[clamp(36px,4.6vw,58px)] font-black leading-[0.98] tracking-[-0.035em]"
                  >
                    <Link href={`/p/${principle.slug}`}>{essay.title}</Link>
                  </h1>
                  <p className="mt-5 max-w-[46ch] font-editorial text-[clamp(18px,2vw,22px)] leading-[1.45]">
                    {standfirst}
                  </p>
                  <p className="mt-5">
                    <MonoLabel className="text-gold">
                      Sūrah ar-Raḥmān 55:7–9 &middot;{" "}
                    </MonoLabel>
                    <RootChip
                      root={principle.root_letters}
                      occurrences={rootOccurrences}
                      className="text-gold"
                    />
                  </p>
                  <Chip as={Link} href={`/p/${principle.slug}`} tone="signal" className="mt-8">
                    {t("readFeature")}
                  </Chip>
                </div>
              </Reveal>

              {/* Illustration frame with comic caption boxes — board 05 grammar. */}
              <Reveal index={1}>
                <PanelGrid className="grid-cols-3">
                  <ArtFrame
                    ratio="16/10"
                    className="col-span-3"
                    overlay={
                      <p className="absolute start-4 top-4 max-w-[26ch] bg-paper px-3 py-2 text-[13px] leading-[1.45]">
                        For eleven years, before he walked to Jumuʿah, he took the
                        brass weights off his scale.
                      </p>
                    }
                    caption={
                      <MonoLabel>
                        Illustration &middot; {waqiah.name_translit} &middot; Issue 01
                        &middot; placeholder
                      </MonoLabel>
                    }
                  />
                  {["Nobody asked him to.", "The scale was old, and it drifted.", "Drift always leans toward the seller."].map(
                    (line) => (
                      <ArtFrame
                        key={line}
                        ratio="1/1"
                        overlay={
                          <p className="absolute inset-x-2 bottom-2 bg-paper px-2 py-1 text-[11px] leading-[1.4]">
                            {line}
                          </p>
                        }
                      />
                    ),
                  )}
                </PanelGrid>
              </Reveal>
            </div>
          </section>

          {/* ⭐ DEPARTMENT RAIL — the ten, Arabic primary, all locales. */}
          <section aria-labelledby="departments-title" id="departments" className="mt-16">
            <SectionLabel>{t("departmentsKicker")}</SectionLabel>
            <h2
              id="departments-title"
              className="mt-2 font-display text-[clamp(24px,3vw,36px)] font-black tracking-[-0.035em]"
            >
              {t("departmentsTitle")}
            </h2>
            <div className="rail mt-6 border-y border-rule">
              <ul className="flex">
                {departments.map((d, i) => (
                  <li key={d.key} className="min-w-[168px] shrink-0 border-e border-rule first:border-s">
                    <Link href={`/d/${d.key}` as never} className="block p-5">
                      <MonoLabel as="p" className="text-signal">
                        {String(i + 1).padStart(2, "0")}
                      </MonoLabel>
                      <p lang="ar" className="ar-block mt-3 font-arabic-ui text-[26px] font-bold leading-tight">
                        {d.name_ar}
                      </p>
                      <MonoLabel as="p" className="mt-2 text-muted">
                        {d.name_en}
                      </MonoLabel>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* ⭐ LATEST — 3-up grid. */}
          <section aria-labelledby="latest-title" className="mt-16">
            <SectionLabel>{t("latestKicker")}</SectionLabel>
            <h2
              id="latest-title"
              className="mt-2 font-display text-[clamp(24px,3vw,36px)] font-black tracking-[-0.035em]"
            >
              {t("latestTitle")}
            </h2>
            <PanelGrid className="mt-6 grid-cols-1 md:grid-cols-3">
              {popularReads.map((read, i) => {
                const dept = departments.find((d) => d.key === read.dept)!;
                return (
                  <Panel key={read.title} as="article" className="flex flex-col p-6">
                    <Reveal index={i} className="flex h-full flex-col">
                      <SectionLabel>
                        <Bidi className="font-arabic-ui text-[12px] normal-case tracking-normal">
                          {dept.name_ar}
                        </Bidi>{" "}
                        &middot; {dept.name_en}
                      </SectionLabel>
                      <h3 className="mt-3 font-display text-[21px] font-black leading-[1.1] tracking-[-0.035em]">
                        <Link href={`/p/${read.slug}`}>{read.title}</Link>
                      </h3>
                      <p className="mt-3 text-[14px] leading-[1.6] text-muted">
                        {standfirst.slice(0, 90)}…
                      </p>
                      <p className="mt-auto pt-5">
                        <MonoLabel className="text-muted">
                          {t("minRead", { count: read.minutes })} &middot; Sūrah
                          ar-Raḥmān 55:7–9
                        </MonoLabel>
                      </p>
                    </Reveal>
                  </Panel>
                );
              })}
            </PanelGrid>
          </section>
        </div>

        {/* ⭐ RIGHT SIDEBAR */}
        <aside className="flex flex-col gap-8">
          {/* Āyah of the day */}
          <Reveal>
            <section aria-label={t("ayahOfTheDay")} className="border border-ink">
              <div className="flex items-center justify-between border-b border-rule px-5 py-3">
                <SectionLabel>{t("ayahOfTheDay")}</SectionLabel>
                <AyahActions reference="Sūrah ar-Raḥmān 55:9" />
              </div>
              <div className="px-5 py-6">
                <Ayah
                  surah={55}
                  from={9}
                  sourceLine={
                    <MonoLabel className="text-gold">Ar-Raḥmān 55:9 &middot; Saheeh International</MonoLabel>
                  }
                />
              </div>
            </section>
          </Reveal>

          {/* Popular reads */}
          <Reveal index={1}>
            <section aria-labelledby="popular-title">
              <SectionLabel>{t("popularReads")}</SectionLabel>
              <h2 id="popular-title" className="sr-only">
                {t("popularReads")}
              </h2>
              <ul className="mt-3 border-t border-rule">
                {popularReads.map((read) => (
                  <li key={read.title} className="border-b border-rule">
                    <Link href={`/p/${read.slug}`} className="flex items-center gap-4 py-4">
                      <ArtFrame ratio="1/1" className="w-14 shrink-0" />
                      <span>
                        <span className="block font-display text-[15px] font-bold leading-[1.2] tracking-[-0.02em]">
                          {read.title}
                        </span>
                        <MonoLabel className="mt-1 block text-muted">
                          {t("minRead", { count: read.minutes })}
                        </MonoLabel>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>

          {/* Soul Index teaser */}
          <Reveal index={2}>
            <Panel surface="recessed" as="section" aria-labelledby="soul-teaser" className="p-6">
              <SectionLabel>
                {t("soulTeaserKicker")} &middot;{" "}
                <Bidi className="font-arabic-ui text-[12px] normal-case tracking-normal">
                  فهرس النفس
                </Bidi>
              </SectionLabel>
              <h2
                id="soul-teaser"
                className="mt-3 font-display text-[20px] font-black leading-[1.15] tracking-[-0.035em]"
              >
                {t("soulTeaserTitle")}
              </h2>
              <p className="mt-3 font-mono text-[12px] text-muted">
                {soulStats.commands} · {soulStats.pieces} · {soulStats.faculties}
              </p>
              <Chip as={Link} href="/index/soul" tone="solid" className="mt-5">
                {t("soulTeaserCta")}
              </Chip>
            </Panel>
          </Reveal>

          {/* Knowledge Graph — COMING SOON */}
          <Reveal index={3}>
            <Panel surface="ink" as="section" aria-labelledby="graph-teaser" className="p-6">
              <MonoLabel as="p" className="text-gold">
                {t("graphKicker")} &middot;{" "}
                <Bidi className="font-arabic-ui text-[12px] normal-case tracking-normal">
                  الخريطة
                </Bidi>
              </MonoLabel>
              <h2
                id="graph-teaser"
                className="mt-3 font-display text-[20px] font-black leading-[1.15] tracking-[-0.035em]"
              >
                <Link href="/graph">{t("graphTitle")}</Link>
              </h2>
              <MonoLabel as="p" className="mt-4 text-signal">
                {t("graphSoon")}
              </MonoLabel>
            </Panel>
          </Reveal>
        </aside>
      </div>

      <Rule weight="hairline" className="mt-16" />
    </div>
  );
}
