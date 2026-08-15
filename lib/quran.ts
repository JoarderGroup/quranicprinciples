/**
 * Āyah text comes from the API by reference — it is NEVER authored or edited
 * in this codebase (protocol hard rule 1). Fetches are cached at build time.
 */

const BASE =
  process.env.QURAN_API_BASE ??
  "https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1";

export const ARABIC_EDITION = "ara-quranuthmanihaf";
export const ENGLISH_EDITION = "eng-saheeh";
export const BANGLA_EDITION = "ben-muhiuddinkhan";
/** Backwards-compatible alias used by the existing Arabic component. */
export const TRANSLATION_EDITION = ENGLISH_EDITION;

export type QuranLocale = "ar" | "en" | "bn";

const EDITION_BY_LOCALE: Record<QuranLocale, string> = {
  ar: ARABIC_EDITION,
  en: ENGLISH_EDITION,
  bn: BANGLA_EDITION,
};

interface VerseResponse {
  chapter: number;
  verse: number;
  text: string;
}

export interface AyahText {
  surah: number;
  ayah: number;
  locale: QuranLocale;
  edition: string;
  text: string;
}

function assertReference(surah: number, ayah: number): void {
  if (!Number.isInteger(surah) || surah < 1 || surah > 114) {
    throw new RangeError("surah must be an integer from 1 through 114");
  }
  if (!Number.isInteger(ayah) || ayah < 1) {
    throw new RangeError("ayah must be a positive integer");
  }
}

async function fetchVerseText(
  edition: string,
  surah: number,
  ayah: number,
): Promise<string | null> {
  try {
    const res = await fetch(`${BASE}/editions/${edition}/${surah}/${ayah}.json`, {
      cache: "force-cache",
      next: { revalidate: false },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as VerseResponse;
    if (data.chapter !== surah || data.verse !== ayah || typeof data.text !== "string") {
      return null;
    }
    return data.text;
  } catch {
    return null;
  }
}

/**
 * The sole path by which āyah text enters the application. The response is
 * fetched from the immutable Quran API by reference; no verse text is kept in
 * this repository or supplied by a model.
 */
export async function getAyah(
  surah: number,
  ayah: number,
  locale: QuranLocale,
): Promise<AyahText | null> {
  assertReference(surah, ayah);
  const edition = EDITION_BY_LOCALE[locale];
  const text = await fetchVerseText(edition, surah, ayah);
  return text === null ? null : { surah, ayah, locale, edition, text };
}

const ARABIC_INDIC = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

export function toArabicIndic(n: number): string {
  return String(n)
    .split("")
    .map((d) => ARABIC_INDIC[Number(d)] ?? d)
    .join("");
}

export interface AyahRange {
  /** Verses joined RTL with Arabic-Indic verse numbers between them. */
  arabic: string | null;
  /** Translation verses joined with spaces. */
  translation: string | null;
}

export async function getAyahRange(
  surah: number,
  from: number,
  to: number = from,
  withTranslation = true,
): Promise<AyahRange> {
  const numbers = Array.from({ length: to - from + 1 }, (_, i) => from + i);

  const arabicParts = await Promise.all(
    numbers.map((n) => getAyah(surah, n, "ar")),
  );
  const arabic = arabicParts.every((p) => p !== null)
    ? numbers.map((n, i) => `${arabicParts[i]?.text} ${toArabicIndic(n)}`).join(" ")
    : null;

  let translation: string | null = null;
  if (withTranslation) {
    const translationParts = await Promise.all(
      numbers.map((n) => getAyah(surah, n, "en")),
    );
    translation = translationParts.every((p) => p !== null)
      ? translationParts.map((part) => part?.text).join(" ")
      : null;
  }

  return { arabic, translation };
}
