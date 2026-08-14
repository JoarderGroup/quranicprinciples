/**
 * Shared data-model types — mirrors 02-Architecture.md exactly.
 * Codex builds the Supabase layer against these same shapes; import from here.
 */

export type Locale = "en" | "ar" | "bn";

export type Depth = "seed" | "spark" | "story" | "source";

export type CommandType = "amr" | "nahy" | "wasiyyah";

export type Faculty =
  | "qalb"
  | "nafs"
  | "aql"
  | "lisan"
  | "basar"
  | "sam"
  | "yad"
  | "jawarih";

export type CardRatio = "9:16" | "1:1" | "4:5" | "a4";

export interface Principle {
  id: string;
  slug: string;
  issue_no: number;
  name_ar: string;
  name_translit: string;
  name_en: string;
  name_bn: string;
  root_letters: string;
  status: "draft" | "published";
  published_at: string | null;
}

/** THE SOURCE OF TRUTH — never destroyed. */
export interface Essay {
  id: string;
  principle_id: string;
  locale: Locale;
  title: string;
  body_md: string;
  author: string;
  word_count: number;
  created_at: string;
}

/** Derived views of an essay. Never auto-published: approved_by must be set by a human. */
export interface Rendering {
  id: string;
  essay_id: string;
  depth: Depth;
  locale: Locale;
  body_md: string;
  approved_by: string | null;
  approved_at: string | null;
}

/** Pulled from the API by reference — the text of an āyah is never typed. */
export interface AyahRef {
  id: string;
  essay_id: string;
  surah: number;
  ayah: number;
  root: string;
  translation_edition: string;
}

export interface Department {
  id: string;
  key: string;
  name_ar: string;
  name_translit: string;
  name_en: string;
  name_bn: string;
}

export interface SoulTag {
  id: string;
  essay_id: string;
  command_type: CommandType;
  faculty: Faculty;
  ayah_ref_id: string;
}

export interface CardExport {
  id: string;
  principle_id: string;
  ratio: CardRatio;
  locale: Locale;
  image_path: string;
  generated_at: string;
}

export interface Issue {
  id: string;
  number: number;
  title: string;
  principle_id: string;
  published_at: string | null;
}
