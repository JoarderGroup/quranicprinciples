import { forwardRef } from "react";
import MonoLabel from "@/components/primitives/MonoLabel";
import { assertAyahContent } from "@/lib/cards/content";
import type { QuoteCardContent } from "@/lib/cards/types";
import CardFrame from "./CardFrame";
import SourceLine from "./SourceLine";
import Wordmark from "./Wordmark";

const QUOTE_SIZE: Record<QuoteCardContent["ratio"], string> = {
  "9:16": "text-[30px] leading-[1.25]",
  "1:1": "text-[19px] leading-[1.25]",
  "4:5": "text-[24px] leading-[1.25]",
  a4: "text-[56px] leading-[1.2]",
};

/**
 * A line from the essay, attributed — board 03's pull-quote grammar
 * (3px --signal rule above, hairline below) carried onto a shareable
 * card. Paper surface, centred vertically; the quote is the whole card.
 */
const QuoteCard = forwardRef<HTMLDivElement, { content: QuoteCardContent }>(
  function QuoteCard({ content }, ref) {
    const { ratio, locale, quote, attribution, ayah } = content;
    assertAyahContent(ayah);

    return (
      <CardFrame ref={ref} ratio={ratio} surface="paper" locale={locale} className="justify-center">
        <div className="border-t-[3px] border-t-[var(--card-signal)] border-b border-b-[var(--card-rule)] py-6">
          <blockquote className={`font-editorial italic ${QUOTE_SIZE[ratio]}`}>
            &ldquo;{quote}&rdquo;
          </blockquote>
        </div>
        <MonoLabel className="mt-3 text-[var(--card-muted)]">{attribution}</MonoLabel>

        <div className="mt-auto flex flex-col gap-2 pt-6">
          <SourceLine ayah={ayah} />
          <Wordmark />
        </div>
      </CardFrame>
    );
  },
);

export default QuoteCard;
