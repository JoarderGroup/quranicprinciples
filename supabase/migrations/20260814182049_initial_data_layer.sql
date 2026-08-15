-- Quranic Principles Phase 2 data layer.
-- This migration is project-ref agnostic and must be applied through Supabase.

create extension if not exists pgcrypto;

do $$ begin
  create type public.locale as enum ('en', 'ar', 'bn');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.publication_status as enum ('draft', 'published');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.rendering_depth as enum ('seed', 'spark', 'story', 'source');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.command_type as enum ('amr', 'nahy', 'wasiyyah');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.faculty as enum ('qalb', 'nafs', 'aql', 'lisan', 'basar', 'sam', 'yad', 'jawarih');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.card_ratio as enum ('9:16', '1:1', '4:5', 'a4');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.user_role as enum ('owner', 'editor', 'rawi');
exception when duplicate_object then null; end $$;

create schema if not exists private;

create table if not exists public.profile (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'rawi',
  created_at timestamptz not null default now()
);

create table if not exists public.department (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name_ar text not null,
  name_translit text not null,
  name_en text not null,
  name_bn text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.principle (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  issue_no integer not null check (issue_no > 0),
  name_ar text not null,
  name_translit text not null,
  name_en text not null,
  name_bn text not null,
  root_letters text not null,
  status public.publication_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  check ((status = 'draft' and published_at is null) or (status = 'published' and published_at is not null))
);

create table if not exists public.essay (
  id uuid primary key default gen_random_uuid(),
  principle_id uuid not null references public.principle(id) on delete restrict,
  locale public.locale not null,
  title text not null,
  body_md text not null,
  author text not null,
  word_count integer not null check (word_count >= 0),
  supersedes_id uuid references public.essay(id) on delete restrict,
  submitted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  check (supersedes_id is null or supersedes_id <> id)
);

create table if not exists public.rendering (
  id uuid primary key default gen_random_uuid(),
  essay_id uuid not null references public.essay(id) on delete cascade,
  depth public.rendering_depth not null,
  locale public.locale not null,
  body_md text not null,
  approved_by uuid references auth.users(id) on delete restrict,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  unique (essay_id, depth, locale),
  check ((approved_by is null and approved_at is null) or (approved_by is not null and approved_at is not null))
);

create table if not exists public.ayah_ref (
  id uuid primary key default gen_random_uuid(),
  essay_id uuid not null references public.essay(id) on delete cascade,
  surah smallint not null check (surah between 1 and 114),
  ayah smallint not null check (ayah > 0),
  root text not null,
  translation_edition text not null,
  created_at timestamptz not null default now(),
  unique (essay_id, surah, ayah, translation_edition)
);

create table if not exists public.soul_tag (
  id uuid primary key default gen_random_uuid(),
  essay_id uuid not null references public.essay(id) on delete cascade,
  command_type public.command_type not null,
  faculty public.faculty not null,
  ayah_ref_id uuid not null references public.ayah_ref(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.card (
  id uuid primary key default gen_random_uuid(),
  principle_id uuid not null references public.principle(id) on delete cascade,
  rendering_id uuid not null references public.rendering(id) on delete cascade,
  ratio public.card_ratio not null,
  locale public.locale not null,
  image_path text not null,
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (rendering_id, ratio, locale)
);

create table if not exists public.issue (
  id uuid primary key default gen_random_uuid(),
  number integer not null unique check (number > 0),
  title text not null,
  principle_id uuid not null references public.principle(id) on delete restrict,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists essay_principle_id_idx on public.essay(principle_id);
create index if not exists rendering_essay_id_idx on public.rendering(essay_id);
create index if not exists ayah_ref_essay_id_idx on public.ayah_ref(essay_id);
create index if not exists soul_tag_essay_id_idx on public.soul_tag(essay_id);
create index if not exists soul_tag_ayah_ref_id_idx on public.soul_tag(ayah_ref_id);
create index if not exists card_rendering_id_idx on public.card(rendering_id);

create or replace function public.reject_essay_body_update()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.body_md is distinct from old.body_md then
    raise exception 'essay.body_md is append-only; create a revision with supersedes_id instead'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists essay_body_is_append_only on public.essay;
create trigger essay_body_is_append_only
before update on public.essay
for each row execute function public.reject_essay_body_update();

create or replace function private.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select role from public.profile where id = auth.uid()
$$;

create or replace function private.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select coalesce(private.current_user_role() = 'owner', false)
$$;

create or replace function private.is_editor()
returns boolean
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select coalesce(private.current_user_role() = 'editor', false)
$$;

create or replace function private.is_rawi()
returns boolean
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select coalesce(private.current_user_role() = 'rawi', false)
$$;

create or replace function private.is_public_essay(target_essay_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.essay e
    join public.principle p on p.id = e.principle_id
    where e.id = target_essay_id
      and p.status = 'published'
      and exists (
        select 1 from public.rendering r
        where r.essay_id = e.id and r.approved_by is not null
      )
  )
$$;

create or replace function private.is_public_rendering(target_rendering_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.rendering r
    where r.id = target_rendering_id
      and r.approved_by is not null
      and private.is_public_essay(r.essay_id)
  )
$$;

create or replace function private.is_public_issue(target_issue_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.issue i
    join public.principle p on p.id = i.principle_id
    where i.id = target_issue_id
      and i.published_at is not null
      and p.status = 'published'
  )
$$;

revoke all on schema private from public;
grant usage on schema private to anon, authenticated;
revoke all on all functions in schema private from public;
grant execute on all functions in schema private to anon, authenticated;

alter table public.profile enable row level security;
alter table public.department enable row level security;
alter table public.principle enable row level security;
alter table public.essay enable row level security;
alter table public.rendering enable row level security;
alter table public.ayah_ref enable row level security;
alter table public.soul_tag enable row level security;
alter table public.card enable row level security;
alter table public.issue enable row level security;

-- Policy definitions are kept in this forward-only migration so a fresh database
-- has its RLS guarantees before any content is inserted.
drop policy if exists "owner manages profiles" on public.profile;
create policy "owner manages profiles" on public.profile for all to authenticated
  using (private.is_owner()) with check (private.is_owner());

drop policy if exists "editor reads profiles" on public.profile;
create policy "editor reads profiles" on public.profile for select to authenticated
  using (private.is_editor());

drop policy if exists "owner manages departments" on public.department;
create policy "owner manages departments" on public.department for all to authenticated
  using (private.is_owner()) with check (private.is_owner());

drop policy if exists "editor reads departments" on public.department;
create policy "editor reads departments" on public.department for select to authenticated
  using (private.is_editor());

drop policy if exists "owner manages principles" on public.principle;
create policy "owner manages principles" on public.principle for all to authenticated
  using (private.is_owner()) with check (private.is_owner());

drop policy if exists "editor reads principles" on public.principle;
create policy "editor reads principles" on public.principle for select to authenticated
  using (private.is_editor());

drop policy if exists "anon reads published principles" on public.principle;
create policy "anon reads published principles" on public.principle for select to anon
  using (status = 'published');

drop policy if exists "owner manages essays" on public.essay;
create policy "owner manages essays" on public.essay for all to authenticated
  using (private.is_owner()) with check (private.is_owner());

drop policy if exists "editor manages essays" on public.essay;
create policy "editor manages essays" on public.essay for all to authenticated
  using (private.is_editor()) with check (private.is_editor());

drop policy if exists "rawi reads own essays" on public.essay;
create policy "rawi reads own essays" on public.essay for select to authenticated
  using (private.is_rawi() and submitted_by = auth.uid());

drop policy if exists "rawi submits own essays" on public.essay;
create policy "rawi submits own essays" on public.essay for insert to authenticated
  with check (private.is_rawi() and submitted_by = auth.uid());

drop policy if exists "anon reads public essays" on public.essay;
create policy "anon reads public essays" on public.essay for select to anon
  using (private.is_public_essay(id));

drop policy if exists "owner manages renderings" on public.rendering;
create policy "owner manages renderings" on public.rendering for all to authenticated
  using (private.is_owner()) with check (private.is_owner());

drop policy if exists "editor manages renderings" on public.rendering;
create policy "editor manages renderings" on public.rendering for all to authenticated
  using (private.is_editor()) with check (private.is_editor());

drop policy if exists "anon reads approved renderings" on public.rendering;
create policy "anon reads approved renderings" on public.rendering for select to anon
  using (private.is_public_rendering(id));

drop policy if exists "owner manages ayah refs" on public.ayah_ref;
create policy "owner manages ayah refs" on public.ayah_ref for all to authenticated
  using (private.is_owner()) with check (private.is_owner());

drop policy if exists "editor reads ayah refs" on public.ayah_ref;
create policy "editor reads ayah refs" on public.ayah_ref for select to authenticated
  using (private.is_editor());

drop policy if exists "anon reads public ayah refs" on public.ayah_ref;
create policy "anon reads public ayah refs" on public.ayah_ref for select to anon
  using (private.is_public_essay(essay_id));

drop policy if exists "owner manages soul tags" on public.soul_tag;
create policy "owner manages soul tags" on public.soul_tag for all to authenticated
  using (private.is_owner()) with check (private.is_owner());

drop policy if exists "editor manages soul tags" on public.soul_tag;
create policy "editor manages soul tags" on public.soul_tag for all to authenticated
  using (private.is_editor()) with check (private.is_editor());

drop policy if exists "anon reads public soul tags" on public.soul_tag;
create policy "anon reads public soul tags" on public.soul_tag for select to anon
  using (private.is_public_essay(essay_id));

drop policy if exists "owner manages cards" on public.card;
create policy "owner manages cards" on public.card for all to authenticated
  using (private.is_owner()) with check (private.is_owner());

drop policy if exists "editor reads cards" on public.card;
create policy "editor reads cards" on public.card for select to authenticated
  using (private.is_editor());

drop policy if exists "anon reads public cards" on public.card;
create policy "anon reads public cards" on public.card for select to anon
  using (private.is_public_rendering(rendering_id));

drop policy if exists "owner manages issues" on public.issue;
create policy "owner manages issues" on public.issue for all to authenticated
  using (private.is_owner()) with check (private.is_owner());

drop policy if exists "editor reads issues" on public.issue;
create policy "editor reads issues" on public.issue for select to authenticated
  using (private.is_editor());

drop policy if exists "anon reads published issues" on public.issue;
create policy "anon reads published issues" on public.issue for select to anon
  using (private.is_public_issue(id));

create or replace function public.soul_index_aggregate()
returns jsonb
language sql
stable
security invoker
set search_path = public, pg_temp
as $$
  with covered as (
    select st.essay_id, st.command_type, st.faculty, ar.surah
    from public.soul_tag st
    join public.ayah_ref ar on ar.id = st.ayah_ref_id
    join public.essay e on e.id = st.essay_id
    join public.principle p on p.id = e.principle_id
    where p.status = 'published'
      and exists (
        select 1 from public.rendering r
        where r.essay_id = e.id and r.approved_by is not null
      )
  ), faculty_buckets as (
    select faculty, count(*)::integer as count, array_agg(distinct essay_id order by essay_id) as essay_ids
    from covered group by faculty
  ), command_buckets as (
    select command_type, count(*)::integer as count, array_agg(distinct essay_id order by essay_id) as essay_ids
    from covered group by command_type
  ), surah_buckets as (
    select surah, count(*)::integer as count, array_agg(distinct essay_id order by essay_id) as essay_ids
    from covered group by surah
  )
  select jsonb_build_object(
    'total_commands', (select count(*)::integer from covered),
    'total_published_essays', (select count(distinct essay_id)::integer from covered),
    'distinct_faculties', (select count(distinct faculty)::integer from covered),
    'essay_ids', coalesce((select jsonb_agg(distinct essay_id) from covered), '[]'::jsonb),
    'faculty', coalesce((select jsonb_agg(jsonb_build_object('faculty', faculty, 'count', count, 'essay_ids', to_jsonb(essay_ids)) order by count desc, faculty) from faculty_buckets), '[]'::jsonb),
    'command_type', coalesce((select jsonb_agg(jsonb_build_object('command_type', command_type, 'count', count, 'essay_ids', to_jsonb(essay_ids)) order by command_type) from command_buckets), '[]'::jsonb),
    'surah', coalesce((select jsonb_agg(jsonb_build_object('surah', surah, 'count', count, 'essay_ids', to_jsonb(essay_ids)) order by surah) from surah_buckets), '[]'::jsonb)
  );
$$;

revoke all on function public.soul_index_aggregate() from public;
grant execute on function public.soul_index_aggregate() to anon, authenticated;

grant usage on schema public to anon, authenticated;
grant select on public.principle, public.essay, public.rendering, public.ayah_ref, public.soul_tag, public.card, public.issue to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;

insert into public.department (key, name_ar, name_translit, name_en, name_bn)
values
  ('root', 'الأصل', 'Al-Aṣl', 'The Root', 'মূল'),
  ('incident', 'الواقعة', 'Al-Wāqiʿah', 'The Incident', 'ঘটনা'),
  ('mirror', 'المرآة', 'Al-Mirʾāh', 'The Mirror', 'আয়না'),
  ('knot', 'العقدة', 'Al-ʿUqdah', 'The Knot', 'গিঁট'),
  ('trace', 'الأثر', 'Al-Athar', 'The Trace', 'পদচিহ্ন'),
  ('deed', 'العمل', 'Al-ʿAmal', 'The Deed', 'আমল'),
  ('voice', 'الصوت', 'Aṣ-Ṣawt', 'The Voice', 'কণ্ঠ'),
  ('words', 'المفردات', 'Al-Mufradāt', 'The Words', 'শব্দ'),
  ('question', 'السؤال', 'As-Suʾāl', 'The Question', 'প্রশ্ন'),
  ('map', 'الخريطة', 'Al-Kharīṭah', 'The Map', 'মানচিত্র')
on conflict (key) do update set
  name_ar = excluded.name_ar,
  name_translit = excluded.name_translit,
  name_en = excluded.name_en,
  name_bn = excluded.name_bn;
