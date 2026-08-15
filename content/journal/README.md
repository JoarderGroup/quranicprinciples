# Journal content contract

The **only** format a content-prep agent (Prompt K / Hermes) may emit for the
Journal content type. If a prompt or a model conflicts with this file and
`packet.schema.json`, the schema wins — flag the discrepancy for the owner,
don't guess a repair.

A Journal is not an Issue. No five-beat spine, no department, no Depth Dial.
Series only: `foundation` · `soul` · `philosophy` · `convergence` · `civilization`
(27-Journal-Editorial-Map.md).

## The model: one public publication, not a revision chain

Unlike `essay` (Issue content, append-only via `supersedes_id`), a
`journal_entry` publishes **once**. There is no v2/v3 public version. A later
correction — a citation fix, a minor copy edit — amends the *same* canonical
row through an append-only audit trail (`journal_minor_edit` /
`journal_citation_audit`), never by creating a new public entry. The raw
source under `Assets QP/essays/` is never touched, by anyone, ever.

If a published entry develops a substantive problem (an unverifiable claim, a
changed concept, anything beyond the narrow minor-edit boundary below), it is
marked `editorial_status: human_review_pending`. It stays visible with that
label. Nothing repairs it silently, automated or not.

## What a packet is

One JSON file = one locale of one Journal entry, always `draft`.
`publication_status` can only ever be `"draft"` in a packet — the schema
enforces this as a single-value field. Publishing is a human action at the
database layer; no packet field, however set, can cause it.

Validate with:

```sh
node content/journal/validate.mjs <packet.json> [more.json ...]
```

Exit code 0 means every listed packet is valid. Run this on every packet
before it goes anywhere near a PR.

## Field-by-field

| Field | Notes |
|---|---|
| `kind` | always `"journal"` |
| `publication_status` | always `"draft"` — see above |
| `editorial_status` | `"clear"` or `"human_review_pending"`; the latter requires `review_reason` |
| `series` / `series_order` | one of the five series; order within that series |
| `slug` | reader-facing only — **never** a raw essay filename or source number. Source numbers are internal provenance (27-Journal-Editorial-Map.md) |
| `locale` | `en` / `ar` / `bn` — first cohorts are `en` only |
| `title`, `deck`, `author`, `reading_minutes` | reader-facing metadata |
| `raw_source` | a pointer to the immutable source file. Never exposed publicly — stripped at the database layer (`journal_entry_public` view), not by convention |
| `entries[]` | numbered sections: `ordinal`, `heading`, `body_md`. `body_md` **cannot contain any Arabic-script character** — the schema rejects the whole codepoint range outright, not just "known verse phrases." A displayed verse always comes from `lib/quran.ts` by reference |
| `ayah_refs[]` | `surah` (1–114), `ayah`, `translation_edition` — constrained to the editions `lib/quran.ts` actually fetches (`ara-quranuthmanihaf`, `eng-saheeh`, `ben-muhiuddinkhan`). Never a translation string |
| `claims[]` | every non-verse factual claim, tiered `cited` / `observed` / `cut`. `cited` requires `source_label` + `source_url`. `observed` requires **both to be null** — a claim can't be both a sourced fact and a personal observation. `cut` claims are retained for review provenance only; they can never reach a publishable body. `entry_ordinal` must reference a real `entries[].ordinal` |
| `minor_edit_log[]` | append-only. Every automated copy edit — scope restricted to `title`/`deck`/`heading`/`spelling`/`grammar`/`punctuation`/`formatting`/`clarity`. Nothing outside that list is a "minor" edit; a bigger change means `human_review_pending`, not a log entry. `before`/`after` are Arabic-script-checked the same as `body_md` |
| `citation_audit_log[]` | append-only. Every claim's verification and any later source correction. `approved` **must be `false`** in every packet a content-prep agent emits — approval is exclusively a human, database-side action |
| `review_reason` | required (non-empty) iff `editorial_status: human_review_pending`; must be `null` iff `clear` |
| `source_notes[]` | free text — why a verse was omitted, why a claim was cut, anything the human reviewer needs |
| `related_slugs[]` | cross-links, reader-facing slugs only |

## What the schema enforces mechanically (not by agent discipline)

- **No inline āyah text.** `body_md`, `minor_edit_log[].before`, and
  `minor_edit_log[].after` all reject any Arabic-script Unicode codepoint —
  U+0600–06FF, U+0750–077F, U+08A0–08FF, U+FB50–FDFF, U+FE70–FEFF. This is
  broader than "no verse text" on purpose: no Arabic script belongs in an
  English-locale `body_md` at all.
- **No self-publication.** `publication_status` is locked to `"draft"`;
  `citation_audit_log[].approved` is checked by `validate.mjs` (not
  expressible in draft-07 JSON Schema) and rejected if `true`.
- **No invented editions.** `translation_edition` is an enum, not a free
  string.
- **No orphaned claims.** `validate.mjs` checks every `claims[].entry_ordinal`
  against the real `entries[]` — a claim attached to a section that doesn't
  exist is invalid.
- **`cited` can't pretend to be `observed`, or vice versa** — enforced by the
  schema's conditional source-field rules, not left to the model's judgment.

## What ships to the database, and what doesn't

The migration (`supabase/migrations/`) defines `journal_series`,
`journal_entry`, `journal_ayah_ref`, `journal_claim`, `journal_minor_edit`,
`journal_citation_audit`. **No content-prep agent inserts into any of these.**
A packet is a file for a human to review; turning an approved packet into
database rows is a separate, human-gated step (outside this contract's scope —
see `07-Admin-Spec.md` / Prompt E for where that lands).
