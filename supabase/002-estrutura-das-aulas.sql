-- Master Class — migração 002
-- Ajusta a tabela `lessons` à estrutura real do livro "Motor Humano Híbrido":
-- cada aula é uma sessão com aquecimento, bloco técnico, bloco principal,
-- três níveis, arrefecimento e notas de coaching.
--
-- Rode este arquivo no SQL Editor do Supabase depois do schema.sql.
-- É seguro rodar mais de uma vez.

alter table public.lessons
  add column if not exists week int,
  add column if not exists mesocycle int,
  add column if not exists weekday text,
  add column if not exists deload boolean not null default false,
  add column if not exists session_type text,
  add column if not exists stimulus text,
  add column if not exists pathway text,
  add column if not exists tag text,
  add column if not exists equipment text,
  add column if not exists space text,
  add column if not exists warmup text[],
  add column if not exists technique_cue text,
  add column if not exists technique_sheet text,
  add column if not exists main_block text,
  add column if not exists levels jsonb,
  add column if not exists cooldown text,
  add column if not exists coaching text,
  add column if not exists watch_error text,
  add column if not exists log_what text;

-- A busca por semana e por dia da semana é o caminho natural de quem dá as aulas.
create index if not exists lessons_week_idx on public.lessons (week, number);
