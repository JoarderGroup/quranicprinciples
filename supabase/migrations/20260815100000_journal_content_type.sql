-- Quranic Principles — Journal content type (Prompt I, D12).
-- Forward-only. Does not alter any existing table, type, policy, or function
-- from 20260814182049_initial_data_layer.sql.
--
-- Journal is deliberately NOT modeled like `essay`/`rendering`: a
-- journal_entry has one public publication, never a v2/v3 public version
-- (owner policy, 2026-08-15). A later correction amends the SAME row through
-- an append-only audit trail (journal_minor_edit / journal_citation_audit),
-- enforced below as a database guarantee, not an application convention:
-- any change to a journal_entry's content columns is rejected unless an
-- audit row for that entry was inserted earlier in the same transaction.

create extension if not exists pgcrypto;

do $$ begin
  create type public.journal_publication_status as enum ('draft', 'published');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.journal_editorial_status as enum ('clear', 'human_review_pending');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.journal_series_key as enum ('foundation', 'soul', 'philosophy', 'convergence', 'civilization');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.journal_claim_tier as enum ('cited', 'observed', 'cut');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.journal_minor_edit_scope as enum
    ('title', 'deck', 'heading', 'spelling', 'grammar', 'punctuation', 'formatting', 'clarity');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.journal_citation_verification as enum ('verified', 'unverifiable', 'materially_changed');
exception when duplicate_object then null; end $$;

-- A single reusable guard: no Arabic-script codepoint anywhere in a value
-- that is meant to be English-locale editorial prose (protocol hard rule 1,
-- mirrored from content/journal/packet.schema.json's body_md rule). Applied
-- to journal_minor_edit's before/after — the one place free-form text is
-- writable outside the packet-validation step that already guards body_md.
create or replace function private.rejects_arabic_script(value text)
returns boolean
language sql
immutable
set search_path = pg_temp
as $$
  select value !~ '[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]'
$$;

-- =============================================================================
-- Tables
-- =============================================================================

create table public.journal_series (
  id uuid primary key default gen_random_uuid(),
  key public.journal_series_key not null unique,
  name_en text not null,
  sort_order integer not null unique,
  created_at timestamptz not null default now()
);

create table public.journal_entry (
  id uuid primary key default gen_random_uuid(),
  series_id uuid not null references public.journal_series(id) on delete restrict,
  slug text not null,
  sequence_number integer not null check (sequence_number > 0),
  locale public.locale not null,
  title text not null,
  deck text not null,
  author text not null,
  raw_source text not null,
  entries jsonb not null,
  publication_status public.journal_publication_status not null default 'draft',
  editorial_status public.journal_editorial_status not null default 'clear',
  review_reason text,
  approved_by uuid references auth.users(id) on delete restrict,
  approved_at timestamptz,
  submitted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (slug, locale),
  check (jsonb_typeof(entries) = 'array' and jsonb_array_length(entries) > 0),
  check (
    (editorial_status = 'clear' and review_reason is null)
    or (editorial_status = 'human_review_pending' and review_reason is not null)
  ),
  check (
    (publication_status = 'draft' and approved_by is null and approved_at is null)
    or (publication_status = 'published' and approved_by is not null and approved_at is not null)
  )
  -- Deliberately no supersedes_id, no version/revision column of any kind —
  -- one public publication is a schema fact, not an application rule.
);

create table public.journal_ayah_ref (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.journal_entry(id) on delete cascade,
  surah smallint not null check (surah between 1 and 114),
  ayah smallint not null check (ayah > 0),
  translation_edition text not null,
  created_at timestamptz not null default now(),
  unique (entry_id, surah, ayah, translation_edition)
);

create table public.journal_claim (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.journal_entry(id) on delete cascade,
  entry_ordinal integer not null,
  claim text not null,
  tier public.journal_claim_tier not null,
  source_label text,
  source_url text,
  created_at timestamptz not null default now(),
  check (
    (tier = 'cited' and source_label is not null and source_url is not null)
    or (tier = 'observed' and source_label is null and source_url is null)
    or (tier = 'cut')
  )
);

-- Append-only. INSERT only for owner/editor (see RLS); no UPDATE or DELETE
-- policy exists for any role, so no application role can ever modify or
-- remove an audit record — not owner, not editor, full stop.
create table public.journal_minor_edit (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.journal_entry(id) on delete restrict,
  scope public.journal_minor_edit_scope not null,
  reason text not null,
  before_text text not null,
  after_text text not null,
  automated boolean not null default false,
  actor uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  check (private.rejects_arabic_script(before_text)),
  check (private.rejects_arabic_script(after_text))
);

-- Append-only, same rule as above.
create table public.journal_citation_audit (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.journal_entry(id) on delete restrict,
  claim text not null,
  prior_source_label text,
  prior_source_url text,
  new_source_label text,
  new_source_url text,
  verification_result public.journal_citation_verification not null,
  verifier text not null,
  approved boolean not null default false,
  reason text not null,
  approved_by uuid references auth.users(id) on delete restrict,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  check ((approved = false and approved_by is null and approved_at is null) or (approved = true and approved_by is not null and approved_at is not null))
);

create index journal_entry_series_id_idx on public.journal_entry(series_id);
create index journal_ayah_ref_entry_id_idx on public.journal_ayah_ref(entry_id);
create index journal_claim_entry_id_idx on public.journal_claim(entry_id);
create index journal_minor_edit_entry_id_idx on public.journal_minor_edit(entry_id);
create index journal_citation_audit_entry_id_idx on public.journal_citation_audit(entry_id);

-- =============================================================================
-- Audit-trail enforcement — a change to journal_entry's content columns is
-- rejected unless a journal_minor_edit or journal_citation_audit row for the
-- same entry was inserted earlier in the SAME transaction. Deliberately not
-- a "call this RPC instead" convention: the table itself refuses the write.
-- =============================================================================

-- A first version of this used a session-local temp table as the
-- authorization ledger. An Opus security review (Prompt I §6) found it
-- forgeable: `authenticated` holds Postgres's default TEMP privilege, so a
-- client could pre-create `journal_edit_authorizations` WITHOUT
-- `ON COMMIT DROP` once, after which `CREATE TEMP TABLE IF NOT EXISTS`
-- silently no-ops forever and the authorization never resets — reproduced
-- directly against a local instance. Fixed here by removing the ledger
-- entirely: authorization is now "was a real journal_minor_edit or an
-- *approved* journal_citation_audit row for this exact entry inserted by
-- THIS transaction," checked via `xmin = pg_current_xact_id()::xid`
-- against the audit tables themselves. There is nothing left to forge —
-- the only way to satisfy the check is to actually insert a real,
-- RLS-governed audit row.
--
-- journal_citation_audit only authorizes when `approved = true`, not on
-- every insert — same review, same fix: the owner policy requires "renewed
-- human approval" before a correction goes live, and citation_audit rows
-- insert unapproved by default. A companion trigger below additionally
-- rejects `approved = true` at INSERT time so an editor (who can insert,
-- but not UPDATE journal_citation_audit) can never self-approve — approval
-- stays a strictly separate, owner-only UPDATE.
create or replace function private.journal_entry_requires_audit_trail()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if (new.title, new.deck, new.author, new.entries) is distinct from (old.title, old.deck, old.author, old.entries) then
    if not exists (
      select 1 from public.journal_minor_edit
      where entry_id = old.id and xmin = pg_current_xact_id()::xid
    ) and not exists (
      select 1 from public.journal_citation_audit
      where entry_id = old.id and approved = true and xmin = pg_current_xact_id()::xid
    ) then
      raise exception 'journal_entry content changes require a journal_minor_edit, or an approved journal_citation_audit, row inserted earlier in the same transaction'
        using errcode = 'P0001';
    end if;
  end if;
  return new;
end;
$$;

create trigger journal_entry_content_change_needs_audit
before update on public.journal_entry
for each row execute function private.journal_entry_requires_audit_trail();

-- Known characteristic of the xmin check above, worth stating explicitly:
-- `pg_current_xact_id()` reflects the innermost SAVEPOINT context, not just
-- the top-level transaction — an audit row inserted inside one SAVEPOINT
-- and a content update issued inside a *different* SAVEPOINT of the same
-- outer transaction will not match, even though both are "the same
-- transaction" in the ordinary sense. Confirmed directly: plain sequential
-- statements (no savepoints between them) work correctly; pgTAP's own
-- `lives_ok`/`throws_ok` each wrap their SQL in an internal savepoint for
-- exception safety, which is why tests/database/journal.sql runs the
-- audit-insert and the content-update as one plain statement pair rather
-- than two separate `lives_ok` calls. A real caller must issue both
-- statements without an intervening SAVEPOINT — a single multi-statement
-- transaction (the expected shape for this feature) satisfies that; a
-- client library that silently wraps each statement in its own savepoint
-- would not, and should be checked before Phase 4/7 wires real queries to
-- this schema.

-- An editor can INSERT into journal_citation_audit but has no UPDATE policy
-- on it — approval is meant to be owner-only. Without this guard, that
-- boundary is cosmetic: the CHECK constraint pairing approved/approved_by/
-- approved_at only requires them to be set *together*, not that the
-- inserting role be owner, so an editor could insert an already-"approved"
-- row naming themselves as approver in one statement.
create or replace function private.journal_citation_audit_cannot_self_approve()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.approved = true then
    raise exception 'journal_citation_audit cannot be inserted pre-approved — insert unapproved, then a separate owner UPDATE approves it'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger journal_citation_audit_insert_unapproved_only
before insert on public.journal_citation_audit
for each row execute function private.journal_citation_audit_cannot_self_approve();

-- =============================================================================
-- Publish guard — a database-level check, not a UI check. Blocks the
-- draft -> published transition unless every condition holds: an approver is
-- set (already enforced by the CHECK above), at least one āyah reference
-- exists, no `cut`-tier claim remains attached, and (redundant with the
-- journal_claim CHECK, kept as defense in depth) no `cited` claim is
-- missing its source.
-- =============================================================================

create or replace function private.journal_entry_publish_guard()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  -- tg_op = 'INSERT' short-circuits before OLD is ever touched — OLD is
  -- unassigned on INSERT, and this function now runs on both (see the
  -- trigger definition above; a prior version fired on UPDATE only, which
  -- is exactly the gap that let a direct INSERT skip this guard).
  if new.publication_status = 'published'
     and (tg_op = 'INSERT' or old.publication_status is distinct from 'published') then
    if not exists (select 1 from public.journal_ayah_ref where entry_id = new.id) then
      raise exception 'cannot publish a journal_entry with no āyah references' using errcode = 'P0001';
    end if;
    if exists (select 1 from public.journal_claim where entry_id = new.id and tier = 'cut') then
      raise exception 'cannot publish a journal_entry with a cut-tier claim still attached — resolve or remove it first' using errcode = 'P0001';
    end if;
    if exists (
      select 1 from public.journal_claim
      where entry_id = new.id and tier = 'cited' and (source_label is null or source_url is null)
    ) then
      raise exception 'cannot publish a journal_entry with a cited claim missing its source' using errcode = 'P0001';
    end if;
  end if;
  return new;
end;
$$;

-- BEFORE INSERT too, not just UPDATE — an Opus review (Prompt I §6) found
-- that DELETE-then-reINSERT (see the removed DELETE grant/policy below)
-- previously reached publication_status='published' directly on INSERT,
-- skipping this guard entirely since it only fired on UPDATE. Reproduced
-- against a local instance before this fix.
create trigger journal_entry_publish_guard_trigger
before insert or update on public.journal_entry
for each row execute function private.journal_entry_publish_guard();

-- The publish guard above only runs at the draft -> published transition,
-- not on every claim write — so a `cut`-tier claim can still land on an
-- already-published entry (owner/editor manage journal_claim directly, and
-- claims aren't append-only the way the audit tables are). RLS's
-- `tier <> 'cut'` clause already keeps such a claim from ever reaching anon
-- (confirmed: no leak), but the entry's own status said nothing about it.
-- Flagged by an Opus review (Prompt I §6): surface the state instead of
-- leaving it silent. editorial_status/review_reason changes don't need a
-- paired audit row (the trigger above only gates title/deck/author/entries),
-- so this can run unconditionally.
create or replace function private.journal_claim_flags_published_entry_on_cut()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.tier = 'cut' then
    update public.journal_entry
    set editorial_status = 'human_review_pending',
        review_reason = coalesce(
          review_reason,
          'a cut-tier claim was attached after publication — resolve or remove it, then clear this status'
        )
    where id = new.entry_id
      and publication_status = 'published'
      and editorial_status = 'clear';
  end if;
  return new;
end;
$$;

create trigger journal_claim_cut_flags_published_entry
after insert or update on public.journal_claim
for each row execute function private.journal_claim_flags_published_entry_on_cut();

-- =============================================================================
-- Public visibility predicate — one place every public surface agrees with,
-- matching the existing private.is_public_essay pattern.
-- =============================================================================

create or replace function private.is_public_journal_entry(target_entry_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.journal_entry
    where id = target_entry_id
      and publication_status = 'published'
      and approved_by is not null
  )
$$;

-- =============================================================================
-- RLS — same role model as the existing schema. Journal gives rawi no new
-- access (no rawi role is described for Journal content anywhere in Prompt
-- I); owner/editor follow the essay/rendering "for all" pattern for content
-- tables and an insert-only pattern for the two audit tables.
-- =============================================================================

alter table public.journal_series enable row level security;
alter table public.journal_entry enable row level security;
alter table public.journal_ayah_ref enable row level security;
alter table public.journal_claim enable row level security;
alter table public.journal_minor_edit enable row level security;
alter table public.journal_citation_audit enable row level security;

create policy "owner manages journal series" on public.journal_series for all to authenticated
  using (private.is_owner()) with check (private.is_owner());
create policy "editor reads journal series" on public.journal_series for select to authenticated
  using (private.is_editor());
create policy "anon reads journal series" on public.journal_series for select to anon
  using (true);

-- SELECT/INSERT/UPDATE only — deliberately NOT "for all". An Opus review
-- (Prompt I §6) found that "for all" plus a DELETE grant let an owner or
-- editor delete a published journal_entry and re-insert under the same
-- slug with zero audit trail — the exact same escape hatch a prior review
-- found in the older `essay` table (D15, _STATE.md). journal_entry has no
-- DELETE policy or grant anywhere in this migration; see below.
create policy "owner reads journal entries" on public.journal_entry for select to authenticated
  using (private.is_owner());
create policy "owner inserts journal entries" on public.journal_entry for insert to authenticated
  with check (private.is_owner());
create policy "owner updates journal entries" on public.journal_entry for update to authenticated
  using (private.is_owner()) with check (private.is_owner());
create policy "editor reads journal entries" on public.journal_entry for select to authenticated
  using (private.is_editor());
create policy "editor inserts journal entries" on public.journal_entry for insert to authenticated
  with check (private.is_editor());
create policy "editor updates journal entries" on public.journal_entry for update to authenticated
  using (private.is_editor()) with check (private.is_editor());
-- Deliberately no anon policy on the base table — the public read surface is
-- the journal_entry_public view below, which excludes raw_source and every
-- internal/audit column. Granting anon SELECT here directly would leak both.

create policy "owner manages journal ayah refs" on public.journal_ayah_ref for all to authenticated
  using (private.is_owner()) with check (private.is_owner());
create policy "editor manages journal ayah refs" on public.journal_ayah_ref for all to authenticated
  using (private.is_editor()) with check (private.is_editor());
create policy "anon reads public journal ayah refs" on public.journal_ayah_ref for select to anon
  using (private.is_public_journal_entry(entry_id));

create policy "owner manages journal claims" on public.journal_claim for all to authenticated
  using (private.is_owner()) with check (private.is_owner());
create policy "editor manages journal claims" on public.journal_claim for all to authenticated
  using (private.is_editor()) with check (private.is_editor());
create policy "anon reads public non-cut journal claims" on public.journal_claim for select to anon
  using (private.is_public_journal_entry(entry_id) and tier <> 'cut');

-- Insert-only for owner/editor — no update, no delete policy for any role.
create policy "owner inserts journal minor edits" on public.journal_minor_edit for insert to authenticated
  with check (private.is_owner());
create policy "editor inserts journal minor edits" on public.journal_minor_edit for insert to authenticated
  with check (private.is_editor());
create policy "owner reads journal minor edits" on public.journal_minor_edit for select to authenticated
  using (private.is_owner());
create policy "editor reads journal minor edits" on public.journal_minor_edit for select to authenticated
  using (private.is_editor());

create policy "owner inserts journal citation audit" on public.journal_citation_audit for insert to authenticated
  with check (private.is_owner());
create policy "editor inserts journal citation audit" on public.journal_citation_audit for insert to authenticated
  with check (private.is_editor());
create policy "owner reads journal citation audit" on public.journal_citation_audit for select to authenticated
  using (private.is_owner());
create policy "editor reads journal citation audit" on public.journal_citation_audit for select to authenticated
  using (private.is_editor());
-- Approving a citation correction (setting approved/approved_by/approved_at)
-- is an UPDATE, deliberately owner-only — unlike journal_entry, where
-- editor legitimately can publish (matching the existing owner+editor "for
-- all" precedent on `rendering`/`essay` elsewhere in this schema; an
-- earlier draft of this comment claimed publish was owner-only across the
-- schema, which was never actually true — corrected here rather than left).
-- Citation *approval* specifically stays a stricter, separate checkpoint:
-- editor can insert a proposed correction but has no UPDATE policy here at
-- all, and the trigger above additionally rejects inserting one
-- pre-approved — so approval genuinely requires a second, owner-only step.
create policy "owner approves journal citation audit" on public.journal_citation_audit for update to authenticated
  using (private.is_owner()) with check (private.is_owner());

grant usage on schema public to anon, authenticated;
grant select on public.journal_series to anon;
grant select, insert, update, delete on public.journal_series, public.journal_ayah_ref, public.journal_claim to authenticated;
-- journal_entry gets no DELETE grant — see the split select/insert/update
-- policies above and the Opus-review note there.
grant select, insert, update on public.journal_entry to authenticated;
-- journal_minor_edit gets no UPDATE/DELETE grant at all — not just an absent
-- RLS policy. "No application role may delete audit records" is stronger
-- when it's a GRANT-layer 42501, not merely zero rows matched by RLS.
grant select, insert on public.journal_minor_edit to authenticated;
-- journal_citation_audit's owner-only UPDATE policy (approving a correction)
-- needs the UPDATE grant; RLS still restricts it to owner.
grant select, insert, update on public.journal_citation_audit to authenticated;
grant select on public.journal_ayah_ref, public.journal_claim to anon;

-- =============================================================================
-- Public read view — the ONLY surface anon reads journal_entry through.
--
-- Deliberately NOT security_invoker. Tried that first and it doesn't work
-- for this shape: a security_invoker view needs the querying role to hold
-- its own SELECT grant AND pass RLS on the underlying table, but anon has
-- neither on journal_entry's base table (on purpose — see below), so an
-- invoker-mode view returns zero rows for anon regardless of the view's own
-- WHERE clause. Confirmed by hitting exactly that failure while testing
-- this migration locally.
--
-- The view runs as its owner instead (classic pre-PG15 view behaviour,
-- still the default): it can see all of journal_entry regardless of RLS on
-- the base table, and its own WHERE clause below — not RLS — is what gates
-- anon's access. This is safe specifically because anon is granted SELECT
-- on this view ONLY, never on the base table (no anon grant, no anon policy,
-- confirmed below), so there is no path for anon to reach journal_entry
-- directly and see raw_source/submitted_by/approved_by/review_reason no
-- matter what they query.
-- =============================================================================

-- security_barrier: prevents a leaky function/operator in a future query
-- (e.g. `where some_fn(entries)` planned to run before the view's own
-- publication filter) from seeing pre-filter rows. Not exploitable today —
-- `authenticated` has no CREATE on `public` to plant such a function — but
-- cheap, and this view is exactly the kind of security-relevant boundary
-- worth hardening even against a future privilege change (Opus review,
-- Prompt I §6).
create view public.journal_entry_public
with (security_barrier = true)
as
select
  je.id,
  je.slug,
  je.sequence_number,
  je.locale,
  je.title,
  je.deck,
  je.author,
  je.entries,
  je.editorial_status,
  je.created_at,
  js.key as series_key,
  js.name_en as series_name,
  js.sort_order as series_sort_order
from public.journal_entry je
join public.journal_series js on js.id = je.series_id
where je.publication_status = 'published' and je.approved_by is not null;

grant select on public.journal_entry_public to anon, authenticated;

insert into public.journal_series (key, name_en, sort_order) values
  ('foundation', 'Foundation', 1),
  ('soul', 'Soul', 2),
  ('philosophy', 'Philosophy', 3),
  ('convergence', 'Convergence', 4),
  ('civilization', 'Civilization', 5)
on conflict (key) do update set name_en = excluded.name_en, sort_order = excluded.sort_order;
