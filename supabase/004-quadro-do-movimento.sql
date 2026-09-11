-- Quadro estático de cada execução, para a grade da biblioteca.
-- Rode uma vez no SQL Editor do Supabase. É idempotente.

-- A grade mostra 45 movimentos de uma vez. Servir a animação em todos fazia
-- 11 MB por rolagem; o quadro parado pesa uns 20 KB e a animação fica para a
-- ficha, que é onde se vai ver como o movimento se faz.
alter table public.movements
  add column if not exists poster_url text;
