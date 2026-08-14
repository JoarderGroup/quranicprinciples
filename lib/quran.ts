/**
 * Āyah text comes from the API by reference — it is NEVER authored or edited
 * in this codebase (protocol hard rule 1). Fetches are cached at build time.
 */

const BASE =
  process.env.QURAN_API_BASE ??
  "https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1";

export const ARABIC_EDITION = "ara-quranuthmanihaf";
export const TRANSLATION_EDITION = "eng-ummmuhammad"; // Saheeh International

interface VerseResponse {
  chapter: number;
  verse: number;
  text: string;
}

async function fetchVerse(
  edition: string,
  surah: number,
  ayah: number,
): Promise<string | null> {
  try {
    const res = await fetch(`${BASE}/editions/${edition}/${surah}/${ayah}.json`, {
      cache: "force-cache",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as VerseResponse;
    return data.text ?? null;
  } catch {
    return null;
  }
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
    numbers.map((n) => fetchVerse(ARABIC_EDITION, surah, n)),
  );
  const arabic = arabicParts.every((p) => p !== null)
    ? numbers.map((n, i) => `${arabicParts[i]} ${toArabicIndic(n)}`).join(" ")
    : null;

  let translation: string | null = null;
  if (withTranslation) {
    const translationParts = await Promise.all(
      numbers.map((n) => fetchVerse(TRANSLATION_EDITION, surah, n)),
    );
    translation = translationParts.every((p) => p !== null)
      ? translationParts.join(" ")
      : null;
  }

  return { arabic, translation };
}
