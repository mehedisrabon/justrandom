-- Run in Supabase Dashboard > SQL Editor. RLS is mandatory for ALL user data.
create extension if not exists pgcrypto;
create table if not exists public.practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  book_number smallint not null check (book_number between 1 and 21),
  test_number smallint not null check (test_number between 1 and 4),
  skill text not null check (skill in ('Listening','Reading','Writing','Speaking')),
  attempted_on date not null default current_date,
  correct smallint check (correct between 0 and 40),
  total smallint check (total between 1 and 40),
  band numeric(2,1) check (band between 0 and 9 and mod(band * 2,1)=0),
  duration_minutes smallint check (duration_minutes between 1 and 240),
  notes text not null default '' check (char_length(notes) <= 2000),
  created_at timestamptz not null default now(),
  constraint valid_score check (
    (skill in ('Listening','Reading') and correct is not null and total = 40 and correct <= total)
    or (skill in ('Writing','Speaking') and correct is null and total is null and band is not null)
  )
);
create index if not exists sessions_user_date_idx on public.practice_sessions (user_id, attempted_on desc);
create index if not exists sessions_user_test_idx on public.practice_sessions (user_id, book_number, test_number, skill);

create table if not exists public.practice_breakdowns (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.practice_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  category text not null check (category in ('Passage','Section','Question Type')),
  label text not null check (char_length(label) between 1 and 80),
  correct smallint not null check (correct >= 0 and correct <= 40),
  total smallint not null check (total between 1 and 40 and correct <= total),
  constraint one_breakdown_per_label unique (session_id, category, label)
);
create index if not exists breakdown_user_idx on public.practice_breakdowns (user_id);

alter table public.practice_sessions enable row level security;
alter table public.practice_breakdowns enable row level security;

create policy "Owner reads sessions" on public.practice_sessions for select to authenticated using (user_id = (select auth.uid()));
create policy "Owner inserts sessions" on public.practice_sessions for insert to authenticated with check (user_id = (select auth.uid()));
create policy "Owner deletes sessions" on public.practice_sessions for delete to authenticated using (user_id = (select auth.uid()));
create policy "Owner reads breakdowns" on public.practice_breakdowns for select to authenticated using (user_id = (select auth.uid()));
create policy "Owner inserts breakdowns" on public.practice_breakdowns for insert to authenticated with check (
  user_id = (select auth.uid()) and exists (
    select 1 from public.practice_sessions s where s.id = session_id and s.user_id = (select auth.uid())
  )
);
create policy "Owner deletes breakdowns" on public.practice_breakdowns for delete to authenticated using (user_id = (select auth.uid()));
