begin;

create extension if not exists pgtap with schema extensions;
set search_path to extensions, public, auth;
select plan(27);

-- The fixture uses fixed ids and runs inside this transaction only.
insert into public.principle (id, slug, issue_no, name_ar, name_translit, name_en, name_bn, root_letters, status, published_at)
values
  ('00000000-0000-0000-0000-000000000101', 'fixture-published', 101, 'اسم', 'Ism', 'Fixture published', 'ফিক্সচার', 'ف-ع-ل', 'published', now()),
  ('00000000-0000-0000-0000-000000000102', 'fixture-draft', 102, 'اسم', 'Ism', 'Fixture draft', 'ফিক্সচার', 'ف-ع-ل', 'draft', null);

insert into public.essay (id, principle_id, locale, title, body_md, author, word_count)
values
  ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000101', 'en', 'Published fixture', 'immutable fixture body', 'Fixture', 3),
  ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000102', 'en', 'Draft fixture', 'draft fixture body', 'Fixture', 3);

insert into public.ayah_ref (id, essay_id, surah, ayah, root, translation_edition)
values
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000201', 1, 1, 'ف-ع-ل', 'eng-saheeh'),
  ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000201', 2, 2, 'ف-ع-ل', 'eng-saheeh');

-- A fixture-only approved_by id is safe because the test transaction disables
-- FK triggers for this insert; production always enforces auth.users FK.
set local session_replication_role = replica;
insert into public.rendering (id, essay_id, depth, locale, body_md, approved_by, approved_at)
values
  ('00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000201', 'story', 'en', 'approved fixture', '00000000-0000-0000-0000-000000000001', now()),
  ('00000000-0000-0000-0000-000000000402', '00000000-0000-0000-0000-000000000201', 'seed', 'en', 'unapproved fixture', null, null),
  ('00000000-0000-0000-0000-000000000403', '00000000-0000-0000-0000-000000000202', 'story', 'en', 'draft parent fixture', '00000000-0000-0000-0000-000000000001', now());
set local session_replication_role = origin;

insert into public.soul_tag (essay_id, command_type, faculty, ayah_ref_id)
values
  ('00000000-0000-0000-0000-000000000201', 'amr', 'qalb', '00000000-0000-0000-0000-000000000301'),
  ('00000000-0000-0000-0000-000000000201', 'nahy', 'qalb', '00000000-0000-0000-0000-000000000302');

select throws_ok(
  $$update public.essay set body_md = 'changed' where id = '00000000-0000-0000-0000-000000000201'$$,
  'P0001',
  'essay.body_md is append-only; create a revision with supersedes_id instead',
  'essay body is immutable'
);

select is(
  (select (soul_index_aggregate() ->> 'total_commands')::integer),
  2,
  'aggregation excludes the draft principle'
);

select is(
  (select (soul_index_aggregate() ->> 'total_published_essays')::integer),
  1,
  'aggregation returns the hand-counted published essay total'
);

select is(
  (select (soul_index_aggregate() -> 'faculty' -> 0 ->> 'count')::integer),
  2,
  'faculty bucket is counted exactly'
);

select is(
  (select (soul_index_aggregate() -> 'surah' -> 0 ->> 'surah')::integer),
  1,
  'surah bucket retains drill-down coverage'
);

set local role anon;
select is(
  (select count(*)::integer from public.rendering where id = '00000000-0000-0000-0000-000000000402'),
  0,
  'anon cannot read an unapproved rendering'
);
reset role;

select is(
  (select count(*)::integer from pg_policies where schemaname = 'public' and tablename in ('profile', 'department', 'principle', 'essay', 'rendering', 'ayah_ref', 'soul_tag', 'card', 'issue')),
  27,
  'RLS policy matrix exists for every exposed table'
);

-- ---------------------------------------------------------------------------
-- Per-table RLS proof. The checks above assert the aggregate is correct and
-- that one unapproved rendering is hidden; they do not prove the role matrix
-- itself. Everything below exercises a policy path by acting AS the role, so a
-- typo in a `using` clause fails here instead of reaching a public route.
-- ---------------------------------------------------------------------------

-- A childless draft principle, used only to prove the editor delete path is
-- blocked by RLS rather than by a foreign key.
insert into public.principle (id, slug, issue_no, name_ar, name_translit, name_en, name_bn, root_letters, status, published_at)
values ('00000000-0000-0000-0000-000000000103', 'fixture-childless', 103, 'اسم', 'Ism', 'Fixture childless', 'ফিক্সচার', 'ف-ع-ل', 'draft', null);

set local session_replication_role = replica;
insert into auth.users (id, instance_id, aud, role, email) values
  ('00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'editor@fixture.test'),
  ('00000000-0000-0000-0000-000000000502', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rawi-a@fixture.test'),
  ('00000000-0000-0000-0000-000000000503', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rawi-b@fixture.test');

insert into public.profile (id, role) values
  ('00000000-0000-0000-0000-000000000501', 'editor'),
  ('00000000-0000-0000-0000-000000000502', 'rawi'),
  ('00000000-0000-0000-0000-000000000503', 'rawi');

-- Two rawi-owned essays under the DRAFT principle, so neither becomes public
-- and neither perturbs the aggregate counts asserted above.
insert into public.essay (id, principle_id, locale, title, body_md, author, word_count, submitted_by) values
  ('00000000-0000-0000-0000-000000000601', '00000000-0000-0000-0000-000000000102', 'en', 'Rawi A essay', 'rawi a body', 'A', 3, '00000000-0000-0000-0000-000000000502'),
  ('00000000-0000-0000-0000-000000000602', '00000000-0000-0000-0000-000000000102', 'en', 'Rawi B essay', 'rawi b body', 'B', 3, '00000000-0000-0000-0000-000000000503');
set local session_replication_role = origin;

-- 701 hangs off the APPROVED rendering (must be visible to anon: this is the
-- positive control that keeps the negative card check from passing vacuously).
-- 702 hangs off the UNAPPROVED rendering (must be invisible).
insert into public.card (id, principle_id, rendering_id, ratio, locale, image_path) values
  ('00000000-0000-0000-0000-000000000701', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000401', '1:1', 'en', 'cards/approved.png'),
  ('00000000-0000-0000-0000-000000000702', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000402', '1:1', 'en', 'cards/unapproved.png');

-- 801: published principle but the issue itself is unpublished.
-- 802: issue is published but its principle is a draft.
insert into public.issue (id, number, title, principle_id, published_at) values
  ('00000000-0000-0000-0000-000000000801', 801, 'Unpublished issue', '00000000-0000-0000-0000-000000000101', null),
  ('00000000-0000-0000-0000-000000000802', 802, 'Issue on a draft principle', '00000000-0000-0000-0000-000000000102', now());

-- Child rows of the draft-principle essay: must never surface to anon.
insert into public.ayah_ref (id, essay_id, surah, ayah, root, translation_edition) values
  ('00000000-0000-0000-0000-000000000901', '00000000-0000-0000-0000-000000000202', 3, 3, 'ف-ع-ل', 'eng-saheeh');
insert into public.soul_tag (id, essay_id, command_type, faculty, ayah_ref_id) values
  ('00000000-0000-0000-0000-000000000902', '00000000-0000-0000-0000-000000000202', 'amr', 'lisan', '00000000-0000-0000-0000-000000000901');

-- --- editor is read-only on principle -------------------------------------
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000501","role":"authenticated"}', true);
set local role authenticated;

select is(
  (private.current_user_role())::text,
  'editor',
  'fixture editor resolves through private.current_user_role()'
);

select throws_ok(
  $$insert into public.principle (slug, issue_no, name_ar, name_translit, name_en, name_bn, root_letters)
    values ('editor-inserted', 999, 'x', 'X', 'X', 'X', 'ف')$$,
  '42501',
  null,
  'editor cannot insert a principle'
);

update public.principle set name_en = 'tampered by editor', root_letters = 'ز-ز-ز'
  where id = '00000000-0000-0000-0000-000000000101';
select is(
  (select name_en from public.principle where id = '00000000-0000-0000-0000-000000000101'),
  'Fixture published',
  'editor cannot update principle metadata (no editor write policy exists)'
);

update public.principle set status = 'published', published_at = now()
  where id = '00000000-0000-0000-0000-000000000102';
select is(
  (select status::text from public.principle where id = '00000000-0000-0000-0000-000000000102'),
  'draft',
  'editor cannot flip a principle publication status'
);

-- Deleted against principle 103, which deliberately has no child rows: if this
-- targeted 101/102 the delete would be stopped by the essay FK's `restrict`
-- and the test would pass without RLS doing any work.
delete from public.principle where id = '00000000-0000-0000-0000-000000000103';
select is(
  (select count(*)::integer from public.principle where id = '00000000-0000-0000-0000-000000000103'),
  1,
  'editor cannot delete a principle that has no dependent rows'
);

-- --- rawi isolation --------------------------------------------------------
reset role;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000502","role":"authenticated"}', true);
set local role authenticated;

select is(
  (select count(*)::integer from public.essay where id = '00000000-0000-0000-0000-000000000601'),
  1,
  'rawi reads their own essay'
);

select is(
  (select count(*)::integer from public.essay where id = '00000000-0000-0000-0000-000000000602'),
  0,
  'rawi cannot read a DIFFERENT rawi''s essay'
);

select is(
  (select count(*)::integer from public.essay),
  1,
  'rawi sees exactly one essay in total (no unscoped leak of the corpus)'
);

select throws_ok(
  $$insert into public.essay (principle_id, locale, title, body_md, author, word_count, submitted_by)
    values ('00000000-0000-0000-0000-000000000102', 'en', 'Forged', 'forged', 'X', 1,
            '00000000-0000-0000-0000-000000000503')$$,
  '42501',
  null,
  'rawi cannot submit an essay attributed to another user'
);

-- --- anon denial, per exposed table ---------------------------------------
reset role;
select set_config('request.jwt.claims', '', true);
set local role anon;

select is(
  (select count(*)::integer from public.card where id = '00000000-0000-0000-0000-000000000701'),
  1,
  'anon CAN read a card whose rendering is approved (positive control)'
);

select is(
  (select count(*)::integer from public.card where id = '00000000-0000-0000-0000-000000000702'),
  0,
  'anon cannot read a card built on an unapproved rendering'
);

select is(
  (select count(*)::integer from public.issue where id = '00000000-0000-0000-0000-000000000801'),
  0,
  'anon cannot read an issue with a null published_at'
);

select is(
  (select count(*)::integer from public.issue where id = '00000000-0000-0000-0000-000000000802'),
  0,
  'anon cannot read a published issue whose principle is still a draft'
);

select is(
  (select count(*)::integer from public.principle where id = '00000000-0000-0000-0000-000000000102'),
  0,
  'anon cannot read a draft principle'
);

select is(
  (select count(*)::integer from public.essay where id = '00000000-0000-0000-0000-000000000202'),
  0,
  'anon cannot read an essay whose principle is a draft, even with an approved rendering'
);

select is(
  (select count(*)::integer from public.ayah_ref where id = '00000000-0000-0000-0000-000000000901'),
  0,
  'anon cannot read an ayah_ref belonging to a non-public essay'
);

select is(
  (select count(*)::integer from public.soul_tag where id = '00000000-0000-0000-0000-000000000902'),
  0,
  'anon cannot read a soul_tag belonging to a non-public essay'
);

select is(
  (select count(*)::integer from public.ayah_ref where id = '00000000-0000-0000-0000-000000000301'),
  1,
  'anon CAN read an ayah_ref on a public essay (positive control)'
);

-- department and profile are withheld from anon at the GRANT layer, not only
-- by RLS, so the failure mode here is a hard permission error.
select throws_ok(
  $$select count(*) from public.department$$,
  '42501',
  null,
  'anon has no grant on department'
);

select throws_ok(
  $$select count(*) from public.profile$$,
  '42501',
  null,
  'anon has no grant on profile (role assignments are never client-readable)'
);

reset role;

select * from finish();
rollback;
