import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import type { Depth } from "@/lib/types";
import { departments } from "@/lib/mock/departments";
import {
  deed,
  essay,
  principle,
  pullQuote,
  renderings,
  rootOccurrences,
  spine,
  standfirst,
} from "@/lib/mock/principle";
import Ayah from "@/components/arabic/Ayah";
import Bidi from "@/components/arabic/Bidi";
import RootChip from "@/components/arabic/RootChip";
import ArtFrame from "@/components/primitives/ArtFrame";
import Chip from "@/components/primitives/Chip";
import MonoLabel from "@/components/primitives/MonoLabel";
import Rule from "@/components/primitives/Rule";
import SectionLabel from "@/components/primitives/SectionLabel";
import FeatureArticle from "@/components/feature/FeatureArticle";
import { getTranslations } from "next-intl/server";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale, slug: principle.slug }));
}

export async function generateMetadata() {
  return { title: essay.title };
}

/** ⭐ FEATURE — board 03 exactly. The Depth Dial lives here. */
export default async function FeaturePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  if (slug !== principle.slug) notFound();
  const t = await getTranslations("feature");
  const waqiah = departments.find((d) => d.key === "waqiah")!;

  const renderingBodies = Object.fromEntries(
    (Object.keys(renderings) as Depth[]).map((d) => [d, renderings[d].body_md]),
  ) as Record<Depth, string>;

  const breadcrumb = (
    <MonoLabel as="p" className="text-muted">
      <Link href="/">Quranic Principles</Link> /{" "}
      <Link href="/issue/1">Issue 01</Link> /{" "}
      <span className="text-signal">
        {waqiah.name_translit} — {waqiah.name_en}
      </span>
    </MonoLabel>
  );

  const kicker = (
    <SectionLabel>
      <Bidi className="font-arabic-ui text-[12px] normal-case tracking-normal">
        {waqiah.name_ar}
      </Bidi>{" "}
      &middot; {waqiah.name_en} &middot;{" "}
      <Bidi lang="bn" className="font-bangla-ui text-[12px] normal-case tracking-normal">
        {waqiah.name_bn}
      </Bidi>
    </SectionLabel>
  );

  const ayahSlot = (
    <Ayah
      surah={55}
      from={7}
      to={9}
      sourceLine={
        <MonoLabel className="text-gold">
          Sūrah ar-Raḥmān 55:7–9 &middot;{" "}
          <RootChip root={principle.root_letters} occurrences={rootOccurrences} className="text-gold" />
        </MonoLabel>
      }
    />
  );

  const rightRail = (
    <aside className="flex flex-col">
      <ArtFrame
        ratio="16/10"
        overlay={
          <p
            lang="ar"
            className="ar-block absolute start-6 top-5 font-arabic-ui text-[34px] font-bold text-paper"
          >
            {principle.name_ar}
          </p>
        }
        caption={
          <MonoLabel>
            Illustration &middot; {waqiah.name_translit} &middot; Issue 01 &middot;
            placeholder
          </MonoLabel>
        }
      />

      <div className="mt-10">
        <SectionLabel>{t("spineTitle")}</SectionLabel>
        <Rule weight="major" className="mt-3" />
        <ol>
          {spine.map((beat) => (
            <li key={beat.n} className="border-b border-rule py-4">
              <div className="flex items-baseline gap-4">
                <MonoLabel className="text-signal">{beat.n}</MonoLabel>
                <p className="font-display text-[17px] font-black tracking-[-0.02em]">
                  {beat.en}{" "}
                  <Bidi className="ms-1 font-arabic-ui text-[15px] font-bold text-deep">
                    {beat.ar}
                  </Bidi>
                </p>
              </div>
              <p className="mt-2 ps-10 text-[13px] leading-[1.6] text-muted">{beat.line}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-10">
        <SectionLabel>{t("takeItWithYou")}</SectionLabel>
        <div className="mt-4 flex flex-wrap gap-2">
          {["Story card 9:16", "Post 1:1", "A4 poster", "PDF issue"].map((label) => (
            <Chip key={label} tone="disabled" aria-disabled="true" title={t("comingSoon")}>
              ↓ {label}
            </Chip>
          ))}
          <Chip tone="disabled" aria-disabled="true">
            4 min
          </Chip>
        </div>
      </div>
    </aside>
  );

  return (
    <FeatureArticle
      renderings={renderingBodies}
      standfirst={standfirst}
      pullQuote={pullQuote}
      deed={deed}
      kicker={kicker}
      title={essay.title}
      breadcrumb={breadcrumb}
      ayahSlot={ayahSlot}
      rightRail={rightRail}
    />
  );
}
