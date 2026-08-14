import { getAyahRange, TRANSLATION_EDITION } from "@/lib/quran";
import type { AyahContent } from "./types";

/**
 * The one sanctioned path from `lib/quran.ts` to a card's verse text.
 * Nothing else in `lib/cards/` or `components/cards/` may construct an
 * `AyahContent` value — the text always traces back to the API.
 *
 * Throws rather than returning a partial result: a card missing its verse
 * or translation is exactly the failure `SourceLine` exists to prevent
 * (contract §Sourcing — "the source line ... cannot be removed"), so the
 * failure has to happen here, before a caller ever gets a chance to render.
 */
export async function fetchAyahContent(params: {
  surah: number;
  surahName: string;
  from: number;
  to?: number;
  root?: string;
  rootOccurrences?: number;
}): Promise<AyahContent> {
  const to = params.to ?? params.from;
  const { arabic, translation } = await getAyahRange(params.surah, params.from, to, true);

  if (!arabic || !translation) {
    throw new Error(
      `fetchAyahContent: could not resolve ${params.surah}:${params.from}-${to} — refusing to build a card with unverifiable verse text`,
    );
  }

  return {
    surah: params.surah,
    surahName: params.surahName,
    from: params.from,
    to,
    arabic,
    translation,
    translationEdition: TRANSLATION_EDITION,
    root: params.root,
    rootOccurrences: params.rootOccurrences,
  };
}

/** Display names for known translation editions. Not sacred text — an
 * edition label, same category as "Sūrah ar-Raḥmān" (a chapter name). */
const EDITION_LABELS: Record<string, string> = {
  "eng-ummmuhammad": "Saheeh International",
};

function editionLabel(edition: string): string {
  return EDITION_LABELS[edition] ?? edition;
}

/** `Sūrah ar-Raḥmān 55:7–9 · Saheeh International` — the line SourceLine renders. */
export function sourceLineFor(ayah: AyahContent): string {
  const range = ayah.from === ayah.to ? `${ayah.from}` : `${ayah.from}–${ayah.to}`;
  return `Sūrah ${ayah.surahName} ${ayah.surah}:${range} · ${editionLabel(ayah.translationEdition)}`;
}

/**
 * Structural guard behind `SourceLine`'s render-time throw (rule 4.1 —
 * "the card fails to render rather than shipping without attribution").
 * Exported separately so tests can assert the failure without needing a
 * DOM renderer.
 */
export function assertAyahContent(ayah: AyahContent | null | undefined): asserts ayah is AyahContent {
  if (
    !ayah ||
    !ayah.arabic?.trim() ||
    !ayah.translation?.trim() ||
    !ayah.surahName?.trim() ||
    !Number.isFinite(ayah.surah) ||
    !Number.isFinite(ayah.from)
  ) {
    throw new Error(
      "SourceLine: missing or incomplete ayah content — a card cannot render without its attribution (contract §Sourcing)",
    );
  }
}
