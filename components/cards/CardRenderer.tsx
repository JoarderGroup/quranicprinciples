import { forwardRef } from "react";
import type { CardContent } from "@/lib/cards/types";
import PrincipleCard from "./PrincipleCard";
import AyahCard from "./AyahCard";
import DeedCard from "./DeedCard";
import QuoteCard from "./QuoteCard";

/** Dispatches on `content.kind` to the right card type. The one place a
 * caller (future admin Card Studio, tests, this phase's own QA) needs to
 * import to render any of the four card types at any ratio. */
const CardRenderer = forwardRef<HTMLDivElement, { content: CardContent }>(
  function CardRenderer({ content }, ref) {
    switch (content.kind) {
      case "principle":
        return <PrincipleCard ref={ref} content={content} />;
      case "ayah":
        return <AyahCard ref={ref} content={content} />;
      case "deed":
        return <DeedCard ref={ref} content={content} />;
      case "quote":
        return <QuoteCard ref={ref} content={content} />;
    }
  },
);

export default CardRenderer;
