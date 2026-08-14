import type { CommandType, Faculty } from "@/lib/types";

/* Soul Index mock aggregation — the shape the real Codex query will return.
 * Counts are deliberately small: the index counts OUR coverage, not the
 * Qur'an, and a young archive is the honest state (06-Soul-Index.md). */

export interface FacultyCount {
  key: Faculty;
  ar: string;
  en: string;
  count: number;
}

export interface SurahCoverage {
  surah: number;
  name: string;
  count: number;
}

export const soulStats = {
  commands: 38,
  pieces: 12,
  faculties: 8,
};

/** Ordered by count (06-Soul-Index: "ordered by count"). */
export const facultyCounts: FacultyCount[] = [
  { key: "qalb", ar: "القلب", en: "The heart", count: 9 },
  { key: "lisan", ar: "اللسان", en: "The tongue", count: 7 },
  { key: "nafs", ar: "النفس", en: "The self", count: 6 },
  { key: "yad", ar: "اليد", en: "The hand", count: 5 },
  { key: "aql", ar: "العقل", en: "The intellect", count: 4 },
  { key: "basar", ar: "البصر", en: "The sight", count: 3 },
  { key: "sam", ar: "السمع", en: "The hearing", count: 2 },
  { key: "jawarih", ar: "الجوارح", en: "The limbs", count: 2 },
];

export const commandCounts: { key: CommandType; ar: string; count: number }[] = [
  { key: "amr", ar: "أمر", count: 17 },
  { key: "nahy", ar: "نهي", count: 13 },
  { key: "wasiyyah", ar: "وصية", count: 8 },
];

/** Sūrahs the archive has touched. Everything else is empty — by design. */
export const surahCoverage: SurahCoverage[] = [
  { surah: 2, name: "Al-Baqarah", count: 4 },
  { surah: 17, name: "Al-Isrāʾ", count: 3 },
  { surah: 24, name: "An-Nūr", count: 2 },
  { surah: 31, name: "Luqmān", count: 3 },
  { surah: 49, name: "Al-Ḥujurāt", count: 5 },
  { surah: 55, name: "Ar-Raḥmān", count: 6 },
  { surah: 83, name: "Al-Muṭaffifīn", count: 4 },
  { surah: 103, name: "Al-ʿAṣr", count: 1 },
  { surah: 107, name: "Al-Māʿūn", count: 2 },
];

export const TOTAL_SURAHS = 114;
