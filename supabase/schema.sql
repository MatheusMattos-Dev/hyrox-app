-- Master Class — esquema do banco.
-- Rode este arquivo no SQL Editor do Supabase (uma vez, no projeto novo).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- perfis

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Cria o perfil assim que o aluno entra pela primeira vez com o Google.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------- conteúdo

create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  subtitle text,
  position int not null default 0
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid references public.modules on delete set null,
  number int not null unique,
  slug text not null unique,
  title text not null,
  summary text,
  content text,
  media_url text,
  media_type text not null default 'none' check (media_type in ('video', 'gif', 'none')),
  duration_min int,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  -- estrutura da sessao (ver 002-estrutura-das-aulas.sql)
  week int,
  mesocycle int,
  weekday text,
  deload boolean not null default false,
  session_type text,
  stimulus text,
  pathway text,
  tag text,
  equipment text,
  space text,
  warmup text[],
  technique_cue text,
  technique_sheet text,
  main_block text,
  levels jsonb,
  cooldown text,
  coaching text,
  watch_error text,
  log_what text
);

create index if not exists lessons_module_idx on public.lessons (module_id, number);
create index if not exists lessons_week_idx on public.lessons (week, number);

create table if not exists public.movements (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text,
  gif_url text,
  description text,
  cues text[],
  common_errors text[],
  position int not null default 0
);

create table if not exists public.lesson_movements (
  lesson_id uuid not null references public.lessons on delete cascade,
  movement_id uuid not null references public.movements on delete cascade,
  position int not null default 0,
  primary key (lesson_id, movement_id)
);

-- ---------------------------------------------------------------- progresso

create table if not exists public.lesson_progress (
  user_id uuid not null references auth.users on delete cascade,
  lesson_id uuid not null references public.lessons on delete cascade,
  completed_at timestamptz,
  seconds_watched int not null default 0,
  last_seen_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create index if not exists lesson_progress_user_idx on public.lesson_progress (user_id);

-- Registo do treino: o que o aluno anotou depois de dar a aula. Um por aula.
create table if not exists public.lesson_logs (
  user_id uuid not null references auth.users on delete cascade,
  lesson_id uuid not null references public.lessons on delete cascade,
  performed_on date not null default current_date,
  level text check (level in ('n1', 'n2', 'n3')),
  rpe smallint check (rpe between 1 and 10),
  -- O que anotar muda por tipo de sessão; quem nomeia os campos é src/lib/log-fields.ts.
  fields jsonb not null default '{}'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create index if not exists lesson_logs_user_idx
  on public.lesson_logs (user_id, performed_on desc);

-- ---------------------------------------------------------------- RLS

alter table public.profiles enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.movements enable row level security;
alter table public.lesson_movements enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.lesson_logs enable row level security;

-- Conteúdo do curso: qualquer aluno logado lê. Escrita só pela service role
-- (usada pelo script de importação), que ignora RLS.
drop policy if exists "conteudo legivel por alunos" on public.modules;
create policy "conteudo legivel por alunos" on public.modules
  for select to authenticated using (true);

drop policy if exists "conteudo legivel por alunos" on public.lessons;
create policy "conteudo legivel por alunos" on public.lessons
  for select to authenticated using (is_published);

drop policy if exists "conteudo legivel por alunos" on public.movements;
create policy "conteudo legivel por alunos" on public.movements
  for select to authenticated using (true);

drop policy if exists "conteudo legivel por alunos" on public.lesson_movements;
create policy "conteudo legivel por alunos" on public.lesson_movements
  for select to authenticated using (true);

-- Perfil e progresso: cada aluno enxerga e escreve apenas as próprias linhas.
drop policy if exists "perfil proprio" on public.profiles;
create policy "perfil proprio" on public.profiles
  for all to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "progresso proprio" on public.lesson_progress;
create policy "progresso proprio" on public.lesson_progress
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "registo proprio" on public.lesson_logs;
create policy "registo proprio" on public.lesson_logs
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------- storage

-- Bucket público para os GIFs de movimentos e imagens de apoio.
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;
