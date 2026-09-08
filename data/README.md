# Conteúdo do curso

O conteúdo sai do livro **Motor Humano Híbrido — 250 aulas prontas a dar**. Nada aqui é
digitado à mão: o PDF é a fonte, e um parser gera os quatro arquivos que o importador
manda para o Supabase.

```
data/fonte/250-Aulas.pdf
        │
        │  node scripts/parse-livro.mjs
        ▼
lessons.json · modules.json · movements.json · lesson-movements.json
        │
        │  npm run import all
        ▼
     Supabase
```

## Os arquivos

| Arquivo | O que é | Chave |
| --- | --- | --- |
| `lessons.json` | As 250 aulas, com todos os blocos da sessão | `number` |
| `modules.json` | Os 10 mesociclos | `slug` |
| `movements.json` | Os 12 movimentos citados nos blocos técnicos | `slug` |
| `lesson-movements.json` | Qual movimento cada aula treina | aula + movimento |
| `fonte/` | O PDF do livro. Fora do git — é o produto. | — |
| `gifs/` | Os GIFs de execução, um por movimento | nome do arquivo = `slug` |

## Reimportar depois de mexer no livro

Se o PDF mudar, rode os dois comandos em sequência:

```bash
node scripts/parse-livro.mjs
npm run import all
```

O parser confere que leu exatamente 250 aulas e falha alto se alguma página fugir do
padrão do livro, em vez de gravar aula pela metade. O importador faz upsert por
`number`, então reimportar atualiza em vez de duplicar.

## Os GIFs

Coloque os arquivos em `data/gifs/` nomeados pelo slug do movimento:

```
agachamento.gif      levantamento-terra.gif   empurrar-vertical.gif
puxada.gif           unilateral.gif           levantamento-tecnico.gif
corrida.gif          remo-skierg.gif          treno.gif
transporte-com-carga.gif   wall-ball.gif      burpee-broad-jump.gif
```

Depois:

```bash
npm run import gifs
```

Cada arquivo sobe para o bucket `media` do Supabase e o `gif_url` do movimento é
preenchido. A partir daí o GIF aparece no bloco técnico de todas as aulas que treinam
aquele movimento — as 250 já estão ligadas.

Aceita `.gif`, `.webp` e `.mp4`.
