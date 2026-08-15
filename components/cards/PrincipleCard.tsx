import { forwardRef } from "react";
import Bidi from "@/components/arabic/Bidi";
import RootChip from "@/components/arabic/RootChip";
import MonoLabel from "@/components/primitives/MonoLabel";
import { assertAyahContent } from "@/lib/cards/content";
import type { PrincipleCardContent } from "@/lib/cards/types";
import CardFrame from "./CardFrame";
import SourceLine from "./SourceLine";
import Wordmark from "./Wordmark";

const TITLE_SIZE: Record<PrincipleCardContent["ratio"], string> = {
  "9:16": "text-[40px] leading-[0.95]",
  "1:1": "text-[26px] leading-[0.95]",
  "4:5": "text-[32px] leading-[0.95]",
  a4: "text-[88px] leading-[0.92]",
};

const AYAH_SIZE: Record<PrincipleCardContent["ratio"], string> = {
  "9:16": "text-[22px]",
  "1:1": "text-[15px]",
  "4:5": "text-[18px]",
  a4: "text-[46px]",
};

/**
 * Ink card — board 05's "AL-MĪZĀN" card. Issue no. · display name ·
 * Arabic name · the āyah · translation · source line · CTA (per spec §3).
 * Genuinely different per ratio, not one layout scaled: 1:1 drops the CTA
 * and root chips for space; a4 is the only ratio spacious enough for both.
 */
const PrincipleCard = forwardRef<HTMLDivElement, { content: PrincipleCardContent }>(
  function PrincipleCard({ content }, ref) {
    const { ratio, locale, issueNo, nameTranslit, nameArabic, ayah, ctaTitle } = content;
    // Fields below read `ayah.arabic` before SourceLine ever mounts —
    // assert here too so the failure is this deliberate message, not
    // whatever TypeError React happens to surface first.
    assertAyahContent(ayah);
    const compact = ratio === "1:1";
    const showCta = ratio !== "1:1";
    const showRootChip = (ratio === "a4" || ratio === "9:16") && ayah.root;

    return (
      <CardFrame ref={ref} ratio={ratio} surface="ink" locale={locale}>
        <MonoLabel className="text-[var(--card-gold)]">
          Principle No. {String(issueNo).padStart(2, "0")}
        </MonoLabel>

        <h2 className={`mt-3 font-black tracking-[-0.03em] ${TITLE_SIZE[ratio]}`}>
          {nameTranslit}
        </h2>
        <Bidi
          lang="ar"
          className={`ar-block mt-1 font-arabic-ui font-bold text-[var(--card-gold)] ${
            ratio === "a4" ? "text-[52px]" : ratio === "1:1" ? "text-[18px]" : "text-[26px]"
          }`}
        >
          {nameArabic}
        </Bidi>

        <div lang="ar" className={`ayah-text mt-5 ${AYAH_SIZE[ratio]}`}>
          {ayah.arabic}
        </div>
        {!compact && (
          <blockquote
            className={`mt-3 font-editorial italic leading-[1.35] ${
              ratio === "a4" ? "text-[30px]" : "text-[15px]"
            }`}
          >
            &ldquo;{ayah.translation}&rdquo;
          </blockquote>
        )}

        <div className="mt-auto flex flex-col gap-2 pt-4">
          <SourceLine ayah={ayah} />
          {showRootChip && (
            <RootChip
              root={ayah.root!}
              occurrences={ayah.rootOccurrences}
              className="text-[var(--card-gold)] opacity-80"
            />
          )}
          {showCta && (
            <p className={`font-editorial italic ${ratio === "a4" ? "text-[24px]" : "text-[13px]"}`}>
              {ctaTitle} →
            </p>
          )}
          <Wordmark className="mt-2" />
        </div>
      </CardFrame>
    );
  },
);

export default PrincipleCard;
