begin;

create extension if not exists pgtap with schema extensions;
set search_path to extensions, public, auth;
select plan(7);

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

select * from finish();
rollback;
