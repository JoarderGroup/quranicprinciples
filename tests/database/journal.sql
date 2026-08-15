begin;

create extension if not exists pgtap with schema extensions;
set search_path to extensions, public, auth;
select plan(34);

-- ---------------------------------------------------------------------------
-- Fixtures. Fixed ids, this transaction only.
-- ---------------------------------------------------------------------------

insert into auth.users (id, instance_id, aud, role, email) values
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'jowner@fixture.test'),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'jeditor@fixture.test');
insert into public.profile (id, role) values
  ('20000000-0000-0000-0000-000000000001', 'owner'),
  ('20000000-0000-0000-0000-000000000002', 'editor');

select set_config('request.jwt.claims', '{"sub":"20000000-0000-0000-0000-000000000001","role":"authenticated"}', true);
set local role authenticated;

-- Entry A: will be published cleanly.
insert into public.journal_entry (id, series_id, slug, sequence_number, locale, title, deck, author, raw_source, entries)
select '20000000-0000-0000-0000-000000000101', id, 'entry-a', 1, 'en', 'Entry A', 'Deck A', 'Author', '../../essays/a.md',
  '[{"ordinal":1,"heading":"H1","body_md":"body one"},{"ordinal":2,"heading":"H2","body_md":"body two"}]'::jsonb
from public.journal_series where key = 'soul';
insert into public.journal_ayah_ref (entry_id, surah, ayah, translation_edition) values
  ('20000000-0000-0000-0000-000000000101', 2, 255, 'eng-saheeh');

-- Entry B: stays a draft throughout.
insert into public.journal_entry (id, series_id, slug, sequence_number, locale, title, deck, author, raw_source, entries)
select '20000000-0000-0000-0000-000000000102', id, 'entry-b-draft', 1, 'en', 'Entry B Draft', 'Deck B', 'Author', '../../essays/b.md',
  '[{"ordinal":1,"heading":"H","body_md":"draft body"}]'::jsonb
from public.journal_series where key = 'foundation';
insert into public.journal_ayah_ref (entry_id, surah, ayah, translation_edition) values
  ('20000000-0000-0000-0000-000000000102', 1, 1, 'eng-saheeh');

-- Entry C: will carry a cut claim and must never publish while it's attached.
insert into public.journal_entry (id, series_id, slug, sequence_number, locale, title, deck, author, raw_source, entries)
select '20000000-0000-0000-0000-000000000103', id, 'entry-c-cut-claim', 1, 'en', 'Entry C', 'Deck C', 'Author', '../../essays/c.md',
  '[{"ordinal":1,"heading":"H","body_md":"body"}]'::jsonb
from public.journal_series where key = 'philosophy';
insert into public.journal_ayah_ref (entry_id, surah, ayah, translation_edition) values
  ('20000000-0000-0000-0000-000000000103', 2, 255, 'eng-saheeh');
insert into public.journal_claim (entry_id, entry_ordinal, claim, tier) values
  ('20000000-0000-0000-0000-000000000103', 1, 'an unsupported claim', 'cut');

-- Entry D: no āyah reference at all — publish must be blocked on that alone.
insert into public.journal_entry (id, series_id, slug, sequence_number, locale, title, deck, author, raw_source, entries)
select '20000000-0000-0000-0000-000000000104', id, 'entry-d-no-ayah', 1, 'en', 'Entry D', 'Deck D', 'Author', '../../essays/d.md',
  '[{"ordinal":1,"heading":"H","body_md":"body"}]'::jsonb
from public.journal_series where key = 'convergence';

-- Entry E: published, then flagged human_review_pending — proves the label
-- stays visible on an otherwise-public entry.
insert into public.journal_entry (id, series_id, slug, sequence_number, locale, title, deck, author, raw_source, entries)
select '20000000-0000-0000-0000-000000000105', id, 'entry-e-pending', 1, 'en', 'Entry E', 'Deck E', 'Author', '../../essays/e.md',
  '[{"ordinal":1,"heading":"H","body_md":"body"}]'::jsonb
from public.journal_series where key = 'civilization';
insert into public.journal_ayah_ref (entry_id, surah, ayah, translation_edition) values
  ('20000000-0000-0000-0000-000000000105', 3, 3, 'eng-saheeh');

-- Entry F: published, untouched by any authorization in this transaction —
-- dedicated to the citation-audit-approval tests (§6/§7) below, so an
-- earlier plain-statement minor_edit on a DIFFERENT entry (which correctly,
-- legitimately keeps authorizing that entry for the rest of this
-- transaction — see the migration's comment on the audit trigger) can't
-- confound what's specifically being tested there.
insert into public.journal_entry (id, series_id, slug, sequence_number, locale, title, deck, author, raw_source, entries)
select '20000000-0000-0000-0000-000000000106', id, 'entry-f-citation-isolation', 1, 'en', 'Entry F', 'Deck F', 'Author', '../../essays/f.md',
  '[{"ordinal":1,"heading":"H","body_md":"body"}]'::jsonb
from public.journal_series where key = 'philosophy';
insert into public.journal_ayah_ref (entry_id, surah, ayah, translation_edition) values
  ('20000000-0000-0000-0000-000000000106', 4, 4, 'eng-saheeh');

update public.journal_entry set publication_status = 'published', approved_by = '20000000-0000-0000-0000-000000000001', approved_at = now()
  where id in ('20000000-0000-0000-0000-000000000101', '20000000-0000-0000-0000-000000000105', '20000000-0000-0000-0000-000000000106');
update public.journal_entry set editorial_status = 'human_review_pending', review_reason = 'internal note, not for public eyes'
  where id = '20000000-0000-0000-0000-000000000105';

-- Entry A is already published; attach one cited claim (must stay visible to
-- anon) and one cut claim (must not — this is the real test of the
-- `tier <> 'cut'` RLS clause, decoupled from the publish guard: the publish
-- guard already makes "a published entry with a cut claim" structurally
-- unreachable through the normal publish path, so that path alone can't
-- prove the RLS clause does anything).
insert into public.journal_claim (entry_id, entry_ordinal, claim, tier, source_label, source_url) values
  ('20000000-0000-0000-0000-000000000101', 1, 'a cited claim on a published entry', 'cited', 'Fixture Source', 'https://example.com/fixture');
insert into public.journal_claim (entry_id, entry_ordinal, claim, tier) values
  ('20000000-0000-0000-0000-000000000101', 1, 'a cut claim attached directly, not via republish', 'cut');

-- ---------------------------------------------------------------------------
-- 1. Schema shape: no supersedes_id / version / revision column exists.
-- ---------------------------------------------------------------------------

select is(
  (select count(*)::integer from information_schema.columns
   where table_schema = 'public' and table_name = 'journal_entry'
     and column_name in ('supersedes_id', 'version', 'revision', 'public_version')),
  0,
  'journal_entry has no supersedes_id/version/revision column — one public publication is a schema fact'
);

-- ---------------------------------------------------------------------------
-- 2. Publish guard: missing āyah ref, cut claim, cited-without-source.
-- ---------------------------------------------------------------------------

select throws_ok(
  $$update public.journal_entry set publication_status = 'published', approved_by = '20000000-0000-0000-0000-000000000001', approved_at = now()
    where id = '20000000-0000-0000-0000-000000000104'$$,
  'P0001',
  'cannot publish a journal_entry with no āyah references',
  'publish guard rejects an entry with zero āyah references'
);

select throws_ok(
  $$update public.journal_entry set publication_status = 'published', approved_by = '20000000-0000-0000-0000-000000000001', approved_at = now()
    where id = '20000000-0000-0000-0000-000000000103'$$,
  'P0001',
  'cannot publish a journal_entry with a cut-tier claim still attached — resolve or remove it first',
  'publish guard rejects an entry with a cut-tier claim attached'
);

select throws_ok(
  $$insert into public.journal_claim (entry_id, entry_ordinal, claim, tier, source_label, source_url)
    values ('20000000-0000-0000-0000-000000000101', 1, 'unsourced', 'cited', null, null)$$,
  null,
  null,
  'a cited claim missing its source is rejected at INSERT time, not deferred to publish'
);

-- ---------------------------------------------------------------------------
-- 3. Anon read model: drafts invisible, published visible via the view only,
--    human_review_pending stays visible with its label, internal columns
--    never present.
-- ---------------------------------------------------------------------------

reset role;
select set_config('request.jwt.claims', '', true);
set local role anon;

select is(
  (select count(*)::integer from public.journal_entry_public where id = '20000000-0000-0000-0000-000000000102'),
  0,
  'anon cannot read a draft journal entry via the public view'
);

select is(
  (select count(*)::integer from public.journal_entry_public where id = '20000000-0000-0000-0000-000000000101'),
  1,
  'anon CAN read a published, approved journal entry via the public view'
);

select is(
  (select editorial_status::text from public.journal_entry_public where id = '20000000-0000-0000-0000-000000000105'),
  'human_review_pending',
  'a published entry flagged human_review_pending exposes that label to anon, not silently hidden or corrected'
);

select is(
  (select count(*)::integer from public.journal_entry_public where id = '20000000-0000-0000-0000-000000000105'),
  1,
  'the same human_review_pending entry remains otherwise readable — flagged, not unpublished'
);

select throws_ok(
  $$select * from public.journal_entry$$,
  '42501',
  null,
  'anon has no grant on the journal_entry base table at all — the view is the only path'
);

select throws_ok(
  $$select * from public.journal_minor_edit$$,
  '42501',
  null,
  'anon has no grant on journal_minor_edit — audit data never leaks publicly'
);

select throws_ok(
  $$select * from public.journal_citation_audit$$,
  '42501',
  null,
  'anon has no grant on journal_citation_audit — audit data never leaks publicly'
);

select is(
  (select count(*)::integer from public.journal_claim where entry_id = '20000000-0000-0000-0000-000000000103'),
  0,
  'anon sees zero claims on entry C — RLS row-filters (not a grant-layer exception): entry unpublished, belt-and-braces'
);

select is(
  (select count(*)::integer from public.journal_claim
   where entry_id = '20000000-0000-0000-0000-000000000101' and tier = 'cited'),
  1,
  'anon CAN see the cited claim on published entry A (positive control)'
);
select is(
  (select count(*)::integer from public.journal_claim
   where entry_id = '20000000-0000-0000-0000-000000000101' and tier = 'cut'),
  0,
  'anon cannot see the cut-tier claim attached directly to the SAME published entry — proves tier <> ''cut'' in RLS, not just the publish gate'
);

reset role;
select set_config('request.jwt.claims', '{"sub":"20000000-0000-0000-0000-000000000001","role":"authenticated"}', true);
set local role authenticated;

select ok(
  not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'journal_entry_public'
      and column_name in ('raw_source', 'submitted_by', 'approved_by', 'approved_at', 'review_reason', 'publication_status')
  ),
  'journal_entry_public exposes none of raw_source/submitted_by/approved_by/approved_at/review_reason/publication_status — structural, not row-level'
);

-- ---------------------------------------------------------------------------
-- 4. Audit-trail enforcement: content changes require a paired audit row in
--    the same transaction; unrelated column changes do not.
-- ---------------------------------------------------------------------------

select throws_ok(
  $$update public.journal_entry set title = 'Sneaky Direct Edit' where id = '20000000-0000-0000-0000-000000000101'$$,
  'P0001',
  'journal_entry content changes require a journal_minor_edit, or an approved journal_citation_audit, row inserted earlier in the same transaction',
  'a direct content edit with no prior audit row in this transaction is rejected'
);

select lives_ok(
  $$update public.journal_entry set editorial_status = 'human_review_pending', review_reason = 'workflow only, no content changed'
    where id = '20000000-0000-0000-0000-000000000101'$$,
  'a workflow-status-only update (editorial_status/review_reason) needs no audit row — it is not a content edit'
);
update public.journal_entry set editorial_status = 'clear', review_reason = null where id = '20000000-0000-0000-0000-000000000101';

-- Plain statements, not two separate lives_ok() calls: pgTAP's lives_ok/
-- throws_ok each run their SQL inside their own internal SAVEPOINT, and
-- the xmin-based authorization check (see the migration's comment on
-- journal_entry_content_change_needs_audit) is scoped to the exact
-- (sub)transaction context — confirmed directly that two consecutive
-- lives_ok calls do NOT see each other's audit row, while two plain
-- sequential statements do. This pair matches real usage: one statement,
-- then the next, no savepoint between them.
insert into public.journal_minor_edit (entry_id, scope, reason, before_text, after_text, automated, actor)
  values ('20000000-0000-0000-0000-000000000101', 'title', 'fixture', 'Entry A', 'Entry A (edited)', true, '20000000-0000-0000-0000-000000000001');
update public.journal_entry set title = 'Entry A (edited)' where id = '20000000-0000-0000-0000-000000000101';
select is(
  (select title from public.journal_entry where id = '20000000-0000-0000-0000-000000000101'),
  'Entry A (edited)',
  'a plain minor_edit insert followed immediately by the content update it authorizes succeeds, and the title actually changed'
);

-- Multi-entry case: entry A's fresh audit row must not spuriously
-- authorize a change to a DIFFERENT entry (B) in the same transaction.
select throws_ok(
  $$update public.journal_entry set title = 'Cross-entry, should not be authorized' where id = '20000000-0000-0000-0000-000000000102'$$,
  'P0001',
  null,
  'an audit row for entry A does not authorize a content change to entry B in the same transaction'
);

select throws_ok(
  $$insert into public.journal_minor_edit (entry_id, scope, reason, before_text, after_text, automated)
    values ('20000000-0000-0000-0000-000000000101', 'restructure', 'x', 'a', 'b', true)$$,
  null,
  null,
  'a minor_edit scope outside the approved category list is rejected at the enum level'
);

select throws_ok(
  $$insert into public.journal_minor_edit (entry_id, scope, reason, before_text, after_text, automated)
    values ('20000000-0000-0000-0000-000000000101', 'spelling', 'x', 'وَاللَّهُ', 'y', true)$$,
  null,
  null,
  'Arabic-script text in a minor_edit before_text is rejected — no āyah text in the audit trail either'
);

select throws_ok(
  $$insert into public.journal_minor_edit (entry_id, scope, reason, before_text, after_text, automated)
    values ('20000000-0000-0000-0000-000000000101', 'spelling', 'x', 'ok', 'وَاللَّهُ', true)$$,
  null,
  null,
  'Arabic-script text in a minor_edit after_text is rejected too'
);

-- ---------------------------------------------------------------------------
-- 5. No application role can modify or delete an audit record.
-- ---------------------------------------------------------------------------

select throws_ok(
  $$update public.journal_minor_edit set reason = 'tampered' where entry_id = '20000000-0000-0000-0000-000000000101'$$,
  '42501',
  null,
  'owner cannot UPDATE an existing journal_minor_edit row — no update policy exists for any role'
);

select throws_ok(
  $$delete from public.journal_minor_edit where entry_id = '20000000-0000-0000-0000-000000000101'$$,
  '42501',
  null,
  'owner cannot DELETE a journal_minor_edit row — no delete policy exists for any role'
);

-- ---------------------------------------------------------------------------
-- 6. Citation correction path. An UNAPPROVED citation_audit row does NOT
--    authorize a content change — the owner policy requires "renewed human
--    approval" before a correction goes live, and approval is a distinct,
--    owner-only step (§7 below), not implied by merely proposing one.
-- ---------------------------------------------------------------------------

select lives_ok(
  $$insert into public.journal_citation_audit (entry_id, claim, prior_source_label, prior_source_url, new_source_label, new_source_url, verification_result, verifier, reason)
    values ('20000000-0000-0000-0000-000000000106', 'a claim being corrected', null, null, 'Corrected Source', 'https://example.com/corrected', 'verified', 'fixture-verifier', 'fixture correction')$$,
  'a citation_audit row can be inserted for a published entry, unapproved by default'
);
select is(
  (select approved from public.journal_citation_audit where entry_id = '20000000-0000-0000-0000-000000000106' order by created_at desc limit 1),
  false,
  'a fresh citation_audit row defaults to unapproved — approval is a separate, later, owner-only action'
);
select throws_ok(
  $$update public.journal_entry set deck = 'Should not be allowed — citation not yet approved' where id = '20000000-0000-0000-0000-000000000106'$$,
  'P0001',
  null,
  'an UNAPPROVED citation_audit row does NOT authorize a content amendment'
);

-- The approved path: owner UPDATEs the citation_audit row to approved,
-- then (plain statements, same reasoning as §4) the content change succeeds.
insert into public.journal_citation_audit (id, entry_id, claim, prior_source_label, prior_source_url, new_source_label, new_source_url, verification_result, verifier, reason)
  values ('20000000-0000-0000-0000-00000000c001', '20000000-0000-0000-0000-000000000106', 'a claim being corrected, properly', null, null, 'Corrected Source', 'https://example.com/corrected', 'verified', 'fixture-verifier', 'fixture correction');
update public.journal_citation_audit set approved = true, approved_by = '20000000-0000-0000-0000-000000000001', approved_at = now()
  where id = '20000000-0000-0000-0000-00000000c001';
update public.journal_entry set deck = 'Deck F (corrected)' where id = '20000000-0000-0000-0000-000000000106';
select is(
  (select deck from public.journal_entry where id = '20000000-0000-0000-0000-000000000106'),
  'Deck F (corrected)',
  'an APPROVED citation_audit row (owner UPDATE, same transaction) does authorize the content amendment'
);

-- ---------------------------------------------------------------------------
-- 7. Citation approval cannot be self-granted at INSERT time.
-- ---------------------------------------------------------------------------

reset role;
select set_config('request.jwt.claims', '{"sub":"20000000-0000-0000-0000-000000000002","role":"authenticated"}', true);
set local role authenticated;

select throws_ok(
  $$insert into public.journal_citation_audit (entry_id, claim, prior_source_label, prior_source_url, new_source_label, new_source_url, verification_result, verifier, reason, approved, approved_by, approved_at)
    values ('20000000-0000-0000-0000-000000000101', 'x', null, null, 'y', 'https://example.com', 'verified', 'editor', 'self-approving', true, '20000000-0000-0000-0000-000000000002', now())$$,
  'P0001',
  null,
  'editor cannot insert a citation_audit row that is already approved — approval is a strictly separate, owner-only UPDATE'
);

reset role;
select set_config('request.jwt.claims', '{"sub":"20000000-0000-0000-0000-000000000001","role":"authenticated"}', true);
set local role authenticated;

-- ---------------------------------------------------------------------------
-- 8. journal_entry has no DELETE path — grant layer AND policy layer.
--    (The essay table's equivalent gap — D15, _STATE.md — is exactly what
--    this closes for the new table, per the Prompt I §6 Opus review.)
-- ---------------------------------------------------------------------------

select throws_ok(
  $$delete from public.journal_entry where id = '20000000-0000-0000-0000-000000000101'$$,
  '42501',
  null,
  'owner cannot DELETE a journal_entry row — no delete grant exists for any role'
);

-- ---------------------------------------------------------------------------
-- 9. The publish guard fires on INSERT too, not only UPDATE — a row cannot
--    be inserted directly as 'published' to skip the guard.
-- ---------------------------------------------------------------------------

select throws_ok(
  $$insert into public.journal_entry (series_id, slug, sequence_number, locale, title, deck, author, raw_source, entries, publication_status, approved_by, approved_at)
    select id, 'insert-as-published-no-ayah', 1, 'en', 'T', 'D', 'A', 'x.md', '[{"ordinal":1,"heading":"H","body_md":"b"}]'::jsonb, 'published', '20000000-0000-0000-0000-000000000001', now()
    from public.journal_series where key = 'foundation'$$,
  'P0001',
  'cannot publish a journal_entry with no āyah references',
  'a fresh row inserted directly as published, with no āyah reference, is still blocked by the publish guard'
);

-- ---------------------------------------------------------------------------
-- 10. A cut-tier claim landing on an ALREADY-PUBLISHED entry (the publish
--     guard only runs at the draft->published transition) auto-flags the
--     entry human_review_pending instead of leaving the state unsurfaced.
-- ---------------------------------------------------------------------------

select is(
  (select editorial_status::text from public.journal_entry where id = '20000000-0000-0000-0000-000000000101'),
  'clear',
  'entry A is editorial_status clear before the post-publish cut claim lands'
);
insert into public.journal_claim (entry_id, entry_ordinal, claim, tier)
  values ('20000000-0000-0000-0000-000000000101', 1, 'a claim cut after publication', 'cut');
select is(
  (select editorial_status::text from public.journal_entry where id = '20000000-0000-0000-0000-000000000101'),
  'human_review_pending',
  'inserting a cut-tier claim onto a published entry auto-flags it human_review_pending'
);
select isnt(
  (select review_reason from public.journal_entry where id = '20000000-0000-0000-0000-000000000101'),
  null,
  'the auto-flag also sets a non-null review_reason, matching the schema rule that human_review_pending always carries one'
);

select * from finish();
rollback;
