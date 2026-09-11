# Master Class

App web do curso: 250 aulas, aula por aula, com a biblioteca de movimentos em GIF a um toque.
Feito para o celular (o layout trava em 512 px e a navegação fica na barra inferior), com login
pelo Google e progresso salvo por aluno.

Next.js 16 (App Router) · TypeScript · Tailwind v4 · Supabase (auth, Postgres e storage).

## Rodar agora

```bash
npm install
npm run dev
```

Sem as chaves do Supabase o app abre em **modo demonstração**: 250 aulas de exemplo, 12
movimentos e progresso guardado num cookie do navegador. Serve para ver a interface antes de
o conteúdo real existir.

## Ligar o Supabase (login com Google + banco)

1. Crie o projeto em [supabase.com](https://supabase.com).
2. **SQL Editor** → cole e rode `supabase/schema.sql`. Isso cria as tabelas, as políticas de
   acesso (cada aluno só enxerga o próprio progresso) e o bucket `media`.
3. **Authentication → Providers → Google**: ative e cole o Client ID e o Client Secret do
   [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
   No Google, o *Authorized redirect URI* é o que o Supabase mostra nessa mesma tela
   (`https://SEU-PROJETO.supabase.co/auth/v1/callback`).
4. **Authentication → URL Configuration**: em *Redirect URLs*, adicione
   `http://localhost:3000/auth/callback` e, depois do deploy, `https://SEU-DOMINIO/auth/callback`.
5. Copie `.env.local.example` para `.env.local` e preencha as chaves de
   **Project Settings → API**.

Se o projeto já existia antes do caderno de treino, rode também
`supabase/003-registo-do-treino.sql` e `supabase/004-quadro-do-movimento.sql` no
SQL Editor. São idempotentes.

Reinicie o `npm run dev`. A tela de entrada passa a mostrar o botão do Google, e qualquer conta
Google entra no curso.

## Importar as aulas e os GIFs

O conteúdo vem do PDF do livro, em `data/fonte/250-Aulas.pdf`:

```bash
node scripts/parse-livro.mjs   # PDF -> data/*.json (250 aulas, 10 mesociclos, 12 movimentos)
npm run import all             # data/*.json -> Supabase
```

Os GIFs de execução saem de uma biblioteca de treino funcional e passam por um preparo que
reduz e converte para WebP animado antes de subir:

```bash
npm run gifs -- "CAMINHO/DA/BIBLIOTECA"   # -> data/gifs/*.webp
npm run import gifs                        # -> storage do Supabase
```

Dez dos doze movimentos têm execução; dois ficam com o desenho do app. Detalhes e o porquê em
[data/README.md](data/README.md).

O importador usa a `SUPABASE_SERVICE_ROLE_KEY` e faz upsert: rodar de novo atualiza o que
mudou em vez de duplicar.

## Aparência

Papel quente, tinta quase preta e o laranja-brasa reservado ao que é ação: progresso, botão,
aula concluída, o nível de referência. O amarelo-corda marca o que pede atenção — semana de
descarga e erro a vigiar. As duas telas escuras (a entrada e o cartão de continuar) são o
contraponto, e são o que dá uso ao `--line-on-ink`. Tokens em
[src/app/globals.css](src/app/globals.css):

Há dois níveis de token. A **paleta literal** não muda com o tema — serve às superfícies
que são escuras nos dois modos (a entrada, o cartão de hoje) e aos pares fixos, como texto de
tinta sobre laranja. Os **papéis** trocam entre claro e escuro, e é por eles que as telas pedem.

| Papel | Onde entra |
| --- | --- |
| `fundo` `superficie` `borda` | fundo da tela, cartões e campos, linhas |
| `texto` `texto-fraco` | texto principal e secundário |

| Paleta literal | Onde entra |
| --- | --- |
| `ember` `ember-dark` | progresso, botão, aula concluída |
| `rope` | descarga e erro a vigiar |
| `ink-2` `line-ink` `paper` | a entrada e o cartão de hoje, escuros nos dois modos |
| `ink` | texto sobre laranja e sobre dourado, que não muda |

O modo escuro segue o sistema e pode ser trocado à mão em **Perfil → Aparência**. A escolha
vai para o `localStorage` e um script no `<head>` a aplica antes da primeira pintura, senão
quem escolheu escuro veria um lampejo de papel a cada carregamento.

Três famílias, três funções: **Big Shoulders** (`.display`) nos títulos e nos números grandes —
o Google unificou "Big Shoulders Display" nessa família; **IBM Plex Mono** (`.rotulo`, `.tnum`)
nos rótulos em caixa alta e em todo número de dado, que é o que faz as colunas alinharem; e
**IBM Plex Sans** no corpo. A voz do coach — coaching, erro a vigiar e registo — fica em IBM
Plex Serif, a serifa da mesma superfamília, para separar conversa de prescrição.

**Ember é cor de preenchimento, não de texto.** Sobre papel ele dá 2,72:1 — reprova para
texto. Então botão laranja leva texto em `ink` (5,42:1), links vão em `ink` sublinhado, e a
tarja de descarga é `rope` de fundo com `ink` por cima (8,96:1). Sobre a superfície escura o
ember pode ser texto: ali dá 5,81:1. O foco é `currentColor`, para servir nos dois fundos.

`--container`, `--pad-inline` e `--pad-section` ficam declarados mas ainda não ligados: são de
página larga, e o app é uma coluna de telefone de 512 px com passo lateral fixo.

As imagens são desenhadas no próprio app, sem material de terceiros:
[Circuito](src/components/Circuito.tsx) é a volta do ano com o progresso em cima,
[MapaDoAno](src/components/MapaDoAno.tsx) põe as 250 aulas em dez linhas de vinte e cinco, e
[MovementGlyph](src/components/MovementGlyph.tsx) desenha cada movimento enquanto o GIF não
chega — e continua a servir de reserva depois.

## Estrutura

| Caminho | O que tem |
| --- | --- |
| `src/app/(app)/` | As telas de dentro do curso: Hoje, Aulas, Movimentos, Perfil |
| `src/app/login/` | Entrada com Google |
| `src/app/auth/` | Callback do OAuth, saída e entrada de demonstração |
| `src/lib/queries.ts` | Toda a leitura de dados, com o fallback de demonstração |
| `src/lib/log-fields.ts` | O que cada tipo de sessão pede para anotar |
| `src/components/AncorasDaAula.tsx` | Barra grudada com os blocos da aula |
| `src/lib/sample-data.ts` | Lê `data/*.json` no modo demonstração |
| `scripts/parse-livro.mjs` | Extrai as 250 aulas do PDF do livro |
| `src/proxy.ts` | Renova a sessão e protege as rotas |
| `supabase/schema.sql` | Tabelas, RLS e bucket |
| `scripts/import.mjs` | Importação de conteúdo e upload dos GIFs |

## Como o conteúdo se organiza

- **Mesociclo** (`modules`) — 10 blocos de 5 semanas, de "Fundação e avaliação" a
  "Simulação e consolidação". A quinta semana de cada um é de descarga.
- **Aula** (`lessons`) — uma por dia útil, numerada de 1 a 250. Cada uma guarda a posição no
  ano (semana, mesociclo, dia), a classificação (tipo, estímulo, via, selo), equipamento e
  espaço, e os blocos da sessão: aquecimento, bloco técnico, bloco principal, os três
  níveis (`levels`), arrefecimento, coaching, erro a vigiar e registo.
- **Movimento** (`movements`) — a ficha de execução com GIF, pontos e erros comuns.
- **`lesson_movements`** liga cada aula ao movimento do seu bloco técnico. É isso que faz o
  GIF certo aparecer dentro da aula.
- **Registo** (`lesson_logs`) — o caderno de treino: um registo por aula, com o dia, o nível
  usado, o esforço no fim, as notas e os campos que aquela sessão pede. Guardar um registo
  marca a aula como concluída. Dentro da aula, o bloco *Da última vez* traz o registo mais
  recente de outra aula do mesmo tipo de sessão — é com esse número que o aluno decide a
  carga de hoje. O que perguntar em cada tipo de sessão está em
  [src/lib/log-fields.ts](src/lib/log-fields.ts) — as 250 aulas usam exatamente cinco frases
  de registo, uma por tipo, então o formulário pergunta campo a campo em vez de abrir uma
  caixa de texto.

Em **Aulas** os filtros são dois e combinam entre si — tipo de sessão e mesociclo — e ambos
sobrevivem à busca. O selo do tipo, dentro da aula, leva para todas as daquele tipo: é assim
que se compara o progresso numa modalidade só.

A tela da aula passa dos 2.700 px, então tem uma barra que gruda no topo com os blocos que
aquela aula tem — aquecimento, técnico, principal, níveis, arrefecimento e registo. Ela marca
em qual bloco você está: por rolagem normalmente, mas o clique ganha enquanto o salto
acontece, senão o caminho até o destino marcaria os blocos por que passa.

A semana-tipo se repete o ano inteiro: segunda é força, terça é aeróbio, quarta é estações
e trenó, quinta é técnica e potência, sexta é sessão mista ou teste.

## Deploy

Suba na Vercel apontando para este repositório, repita as três variáveis do `.env.local` nas
*Environment Variables* do projeto e acrescente `https://SEU-DOMINIO/auth/callback` nas
*Redirect URLs* do Supabase.
