/**
 * Shared data-model types — mirrors 02-Architecture.md exactly, kept in sync
 * with lib/database.types.ts (generated) as of the Journal migration
 * (Prompt I). Import from here for hand-written domain shapes; import from
 * lib/database.types.ts for exact row shapes when writing a query.
 *
 * Drift fixed here 2026-08-15, flagged during the Prompt H integration pass
 * (_BUILD-LOG.md) and left for "whoever picks up Phase 4/7 next" — that
 * turned out to be this same migration, so closed here rather than carried
 * forward again: Essay was missing supersedes_id/submitted_by, CardExport
 * was missing rendering_id, and there was no Profile/UserRole type at all.
 * created_at was also missing from every interface that has it in the DB;
 * added throughout for consistency, not just where a bug depended on it.
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

export type UserRole = "owner" | "editor" | "rawi";

export interface Profile {
  id: string;
  role: UserRole;
  created_at: string;
}

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
  created_at: string;
}

/** THE SOURCE OF TRUTH — never destroyed. Corrections are additive: a new
 * row whose supersedes_id points at the row it replaces, never an edit. */
export interface Essay {
  id: string;
  principle_id: string;
  locale: Locale;
  title: string;
  body_md: string;
  author: string;
  word_count: number;
  supersedes_id: string | null;
  submitted_by: string | null;
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
  created_at: string;
}

/** Pulled from the API by reference — the text of an āyah is never typed. */
export interface AyahRef {
  id: string;
  essay_id: string;
  surah: number;
  ayah: number;
  root: string;
  translation_edition: string;
  created_at: string;
}

export interface Department {
  id: string;
  key: string;
  name_ar: string;
  name_translit: string;
  name_en: string;
  name_bn: string;
  created_at: string;
}

export interface SoulTag {
  id: string;
  essay_id: string;
  command_type: CommandType;
  faculty: Faculty;
  ayah_ref_id: string;
  created_at: string;
}

export interface CardExport {
  id: string;
  principle_id: string;
  rendering_id: string;
  ratio: CardRatio;
  locale: Locale;
  image_path: string;
  generated_at: string;
  created_at: string;
}

export interface Issue {
  id: string;
  number: number;
  title: string;
  principle_id: string;
  published_at: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Journal — a second, deliberately different content type (23-Content-
// Strategy-Two-Spines.md, D12). One public publication, never a v2/v3
// version; corrections amend the same row through an append-only audit
// trail instead. Not an Issue: no five-beat requirement, no department, no
// Depth Dial. See content/journal/README.md for the packet contract this
// mirrors on the ingestion side.
// ---------------------------------------------------------------------------

export type JournalSeriesKey = "foundation" | "soul" | "philosophy" | "convergence" | "civilization";

export type JournalPublicationStatus = "draft" | "published";

export type JournalEditorialStatus = "clear" | "human_review_pending";

export type JournalClaimTier = "cited" | "observed" | "cut";

export type JournalMinorEditScope =
  | "title"
  | "deck"
  | "heading"
  | "spelling"
  | "grammar"
  | "punctuation"
  | "formatting"
  | "clarity";

export type JournalCitationVerification = "verified" | "unverifiable" | "materially_changed";

export interface JournalSeries {
  id: string;
  key: JournalSeriesKey;
  name_en: string;
  sort_order: number;
  created_at: string;
}

export interface JournalEntryContentBlock {
  ordinal: number;
  heading: string;
  body_md: string;
}

/** No supersedes_id, no version field — one public publication is a schema
 * fact for this table, not an application convention (packet.schema.json
 * enforces the same at the packet layer). raw_source is never exposed on
 * any public read path; see journal_entry_public below. */
export interface JournalEntry {
  id: string;
  series_id: string;
  slug: string;
  sequence_number: number;
  locale: Locale;
  title: string;
  deck: string;
  author: string;
  raw_source: string;
  entries: JournalEntryContentBlock[];
  publication_status: JournalPublicationStatus;
  editorial_status: JournalEditorialStatus;
  review_reason: string | null;
  approved_by: string | null;
  approved_at: string | null;
  submitted_by: string | null;
  created_at: string;
}

/** The public read surface — journal_entry_public (a DB view), never the
 * base table. Deliberately excludes raw_source, submitted_by, approved_by/
 * approved_at, review_reason, publication_status (always "published" here
 * by construction, so the field is dropped rather than redundantly typed). */
export interface JournalEntryPublic {
  id: string;
  slug: string;
  sequence_number: number;
  locale: Locale;
  title: string;
  deck: string;
  author: string;
  entries: JournalEntryContentBlock[];
  editorial_status: JournalEditorialStatus;
  created_at: string;
  series_key: JournalSeriesKey;
  series_name: string;
  series_sort_order: number;
}

export interface JournalAyahRef {
  id: string;
  entry_id: string;
  surah: number;
  ayah: number;
  translation_edition: string;
  created_at: string;
}

export interface JournalClaim {
  id: string;
  entry_id: string;
  entry_ordinal: number;
  claim: string;
  tier: JournalClaimTier;
  source_label: string | null;
  source_url: string | null;
  created_at: string;
}

/** Append-only. No application role can update or delete a row here — see
 * the migration's RLS policies (insert + select only) and the trigger that
 * requires one of these to exist before journal_entry content can change. */
export interface JournalMinorEdit {
  id: string;
  entry_id: string;
  scope: JournalMinorEditScope;
  reason: string;
  before_text: string;
  after_text: string;
  automated: boolean;
  actor: string | null;
  created_at: string;
}

/** Append-only, same rule as JournalMinorEdit. `approved` starts false;
 * only an owner UPDATE (the one exception — approving a correction) can
 * set it true, and only together with approved_by/approved_at. */
export interface JournalCitationAudit {
  id: string;
  entry_id: string;
  claim: string;
  prior_source_label: string | null;
  prior_source_url: string | null;
  new_source_label: string | null;
  new_source_url: string | null;
  verification_result: JournalCitationVerification;
  verifier: string;
  approved: boolean;
  reason: string;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
}
