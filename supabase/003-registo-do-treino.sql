-- Registo do treino: o que o aluno anotou depois de dar a aula.
-- Rode uma vez no SQL Editor do Supabase. É idempotente.

create table if not exists public.lesson_logs (
  user_id uuid not null references auth.users on delete cascade,
  lesson_id uuid not null references public.lessons on delete cascade,

  -- Quando treinou. Pode não ser o dia em que registou.
  performed_on date not null default current_date,

  -- Qual das três prescrições foi usada.
  level text check (level in ('n1', 'n2', 'n3')),

  -- Sensação de esforço no fim, de 1 a 10.
  rpe smallint check (rpe between 1 and 10),

  -- O que o livro manda anotar muda por tipo de sessão (carga e repetições na
  -- força, distância e ritmo no aeróbio...), então os campos ficam em jsonb e
  -- quem dá nome a eles é src/lib/log-fields.ts.
  fields jsonb not null default '{}'::jsonb,

  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  primary key (user_id, lesson_id)
);

create index if not exists lesson_logs_user_idx
  on public.lesson_logs (user_id, performed_on desc);

alter table public.lesson_logs enable row level security;

-- Cada aluno só enxerga e escreve o próprio registo.
drop policy if exists "registo proprio" on public.lesson_logs;
create policy "registo proprio" on public.lesson_logs
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
