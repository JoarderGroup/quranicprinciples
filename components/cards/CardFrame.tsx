import { forwardRef, type ReactNode } from "react";
import type { CardRatio } from "@/lib/types";
import { CARD_RATIOS } from "@/lib/cards/ratios";

const PADDING_PX: Record<CardRatio, number> = {
  "9:16": 28,
  "1:1": 24,
  "4:5": 26,
  a4: 64,
};

/**
 * The DOM node `capture.ts` hands to html-to-image. Fixed at the ratio's
 * authored ("base") pixel size — captured content must fill it exactly,
 * since capture reads `CARD_RATIOS[ratio].base` for its own width/height.
 * Tokens only (contract §Forbidden — no new colour, no rounded cards with
 * shadows on editorial content).
 *
 * Uses the theme-invariant `--card-*` tokens, never `--ink`/`--paper`
 * (contract §Card tokens, D10) — a share card is a fixed-identity asset
 * and must render identically regardless of the viewer's OS theme.
 */
const CardFrame = forwardRef<
  HTMLDivElement,
  {
    ratio: CardRatio;
    surface: "ink" | "paper";
    locale: string;
    dir?: "ltr" | "rtl";
    children: ReactNode;
    className?: string;
  }
>(function CardFrame({ ratio, surface, locale, dir = "ltr", children, className = "" }, ref) {
  const { base } = CARD_RATIOS[ratio];
  return (
    <div
      ref={ref}
      lang={locale}
      dir={dir}
      className={`relative flex flex-col overflow-hidden font-display ${
        surface === "ink"
          ? "bg-[var(--card-ink)] text-[var(--card-paper)]"
          : "bg-[var(--card-paper)] text-[var(--card-ink)]"
      } ${className}`}
      style={{ width: base.w, height: base.h, padding: PADDING_PX[ratio] }}
    >
      {children}
    </div>
  );
});

export default CardFrame;
