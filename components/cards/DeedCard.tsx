import { forwardRef } from "react";
import Bidi from "@/components/arabic/Bidi";
import MonoLabel from "@/components/primitives/MonoLabel";
import { assertAyahContent } from "@/lib/cards/content";
import type { DeedCardContent } from "@/lib/cards/types";
import CardFrame from "./CardFrame";
import SourceLine from "./SourceLine";
import Wordmark from "./Wordmark";

const PROMPT_SIZE: Record<DeedCardContent["ratio"], string> = {
  "9:16": "text-[34px] leading-[1.05]",
  "1:1": "text-[22px] leading-[1.05]",
  "4:5": "text-[28px] leading-[1.05]",
  a4: "text-[68px] leading-[1.02]",
};

/**
 * Paper background rather than ink (spec §3) — board 05's "ONE WEIGHING,
 * MADE HONEST" card. Not an article: a card with a checkbox
 * (16-Editorial-Doctrine.md §6, العمل row). 1:1 drops the body copy —
 * the prompt alone has to carry a square feed post.
 */
const DeedCard = forwardRef<HTMLDivElement, { content: DeedCardContent }>(
  function DeedCard({ content }, ref) {
    const { ratio, locale, issueNo, principleNameTranslit, deedArabicWord, promptText, bodyText, ayah } =
      content;
    assertAyahContent(ayah);
    const showBody = ratio !== "1:1";

    return (
      <CardFrame ref={ref} ratio={ratio} surface="paper" locale={locale}>
        <div className="flex items-baseline gap-2">
          <Bidi lang="ar" className="ar-block font-arabic-ui text-[13px] font-bold text-[var(--card-signal)]">
            {deedArabicWord}
          </Bidi>
          <MonoLabel className="text-[var(--card-signal)]">The Deed</MonoLabel>
        </div>

        <p className={`mt-4 font-black tracking-[-0.03em] ${PROMPT_SIZE[ratio]}`}>{promptText}</p>

        {showBody && (
          <p className={`mt-4 text-[var(--card-muted)] ${ratio === "a4" ? "text-[24px] leading-[1.5]" : "text-[13px] leading-[1.5]"}`}>
            {bodyText}
          </p>
        )}

        <div className="mt-auto flex flex-col gap-2 pt-4">
          <MonoLabel className="text-[var(--card-muted)]">
            Issue {String(issueNo).padStart(2, "0")} · {principleNameTranslit} · Depth 1 seed
          </MonoLabel>
          <SourceLine ayah={ayah} />
          <Wordmark />
        </div>
      </CardFrame>
    );
  },
);

export default DeedCard;
