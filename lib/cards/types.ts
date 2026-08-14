import type { CardRatio, Locale } from "@/lib/types";

export type CardKind = "principle" | "ayah" | "deed" | "quote";

/**
 * The ONLY sanctioned shape for verse text in a card. It is produced
 * exclusively by `fetchAyahContent` (content.ts), which calls
 * `lib/quran.ts` — never a string literal typed elsewhere (protocol hard
 * rule 1; contract §Sourcing). Every card content type below carries one
 * of these, not optionally: `SourceLine` (components/cards/SourceLine.tsx)
 * throws at render if it is missing or incomplete.
 */
export interface AyahContent {
  surah: number;
  surahName: string; // transliterated chapter name, e.g. "Ar-Raḥmān" — supplied by the caller, not authored here
  from: number;
  to: number;
  arabic: string;
  translation: string;
  translationEdition: string;
  root?: string;
  rootOccurrences?: number;
}

interface CardBase {
  locale: Locale;
  ratio: CardRatio;
  ayah: AyahContent;
}

export interface PrincipleCardContent extends CardBase {
  kind: "principle";
  issueNo: number;
  nameTranslit: string;
  nameArabic: string;
  ctaTitle: string;
}

export interface AyahCardContent extends CardBase {
  kind: "ayah";
  principleNameTranslit: string;
}

export interface DeedCardContent extends CardBase {
  kind: "deed";
  issueNo: number;
  principleNameTranslit: string;
  deedArabicWord: string; // العمل — from 04-Departments.md, not invented here
  promptText: string;
  bodyText: string;
}

export interface QuoteCardContent extends CardBase {
  kind: "quote";
  quote: string;
  attribution: string;
}

export type CardContent =
  | PrincipleCardContent
  | AyahCardContent
  | DeedCardContent
  | QuoteCardContent;
