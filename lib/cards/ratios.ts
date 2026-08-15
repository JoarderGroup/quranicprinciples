import type { CardRatio } from "@/lib/types";

/**
 * Each ratio is captured at a fixed "design" CSS pixel size (`base`) and
 * scaled up to the real export resolution (`target`) via html-to-image's
 * pixelRatio option (`capture.ts`). Components author distinct JSX per
 * ratio at `base` size — this file only carries the geometry, never layout.
 */
export interface RatioSpec {
  /** True export pixel dimensions (03-Content-Funnel.md §Share objects). */
  target: { w: number; h: number };
  /** On-screen authoring size before pixelRatio scaling. */
  base: { w: number; h: number };
  label: string;
}

export const CARD_RATIOS: Record<CardRatio, RatioSpec> = {
  "9:16": {
    target: { w: 1080, h: 1920 },
    base: { w: 360, h: 640 },
    label: "Instagram / WhatsApp story",
  },
  "1:1": {
    target: { w: 1080, h: 1080 },
    base: { w: 360, h: 360 },
    label: "Feed post",
  },
  "4:5": {
    target: { w: 1080, h: 1350 },
    base: { w: 360, h: 450 },
    label: "Portrait feed",
  },
  a4: {
    // 210×297mm at 300dpi — print (classroom, masjid board).
    target: { w: 2480, h: 3508 },
    // Authored at A4-at-96dpi so on-screen preview stays a plausible page size.
    base: { w: 794, h: 1123 },
    label: "Print — classroom, masjid board",
  },
};

export const CARD_RATIO_KEYS = Object.keys(CARD_RATIOS) as CardRatio[];

/** Exact scale factor from authored `base` px to exported `target` px. */
export function pixelRatioFor(ratio: CardRatio): number {
  const { target, base } = CARD_RATIOS[ratio];
  return target.w / base.w;
}
