import { forwardRef } from "react";
import MonoLabel from "@/components/primitives/MonoLabel";
import { assertAyahContent } from "@/lib/cards/content";
import type { AyahCardContent } from "@/lib/cards/types";
import CardFrame from "./CardFrame";
import SourceLine from "./SourceLine";
import Wordmark from "./Wordmark";

const AYAH_SIZE: Record<AyahCardContent["ratio"], string> = {
  "9:16": "text-[34px]",
  "1:1": "text-[22px]",
  "4:5": "text-[28px]",
  a4: "text-[64px]",
};

/**
 * The verse foregrounded, minimal chrome (spec §3). Unlike PrincipleCard,
 * carries no title, CTA, or root chip — just enough context (a small
 * kicker) to place it, then the āyah, its translation, and the mandatory
 * source line. 1:1 drops the translation; every other ratio keeps it.
 */
const AyahCard = forwardRef<HTMLDivElement, { content: AyahCardContent }>(
  function AyahCard({ content }, ref) {
    const { ratio, locale, ayah, principleNameTranslit } = content;
    assertAyahContent(ayah);
    const showTranslation = ratio !== "1:1";

    return (
      <CardFrame ref={ref} ratio={ratio} surface="ink" locale={locale} className="justify-center">
        <MonoLabel className="text-gold opacity-70">{principleNameTranslit}</MonoLabel>

        <div lang="ar" className={`ayah-text mt-5 ${AYAH_SIZE[ratio]}`}>
          {ayah.arabic}
        </div>

        {showTranslation && (
          <blockquote
            className={`mt-4 font-editorial italic leading-[1.35] ${
              ratio === "a4" ? "text-[32px]" : "text-[16px]"
            }`}
          >
            &ldquo;{ayah.translation}&rdquo;
          </blockquote>
        )}

        <div className="mt-auto flex flex-col gap-2 pt-6">
          <SourceLine ayah={ayah} />
          <Wordmark />
        </div>
      </CardFrame>
    );
  },
);

export default AyahCard;
