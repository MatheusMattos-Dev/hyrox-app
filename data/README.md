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

As quebras de linha do bloco principal vêm da geometria, não de uma lista de palavras: a
posição em que cada linha termina diz se ela quebrou por falta de largura na coluna — e deve
voltar a juntar-se — ou porque o autor a quebrou. O teste é se a primeira palavra da linha
seguinte teria cabido na folga que sobrou.

O parser confere que leu exatamente 250 aulas e falha alto se alguma página fugir do
padrão do livro, em vez de gravar aula pela metade. O importador faz upsert por
`number`, então reimportar atualiza em vez de duplicar.

## Os GIFs

As execuções vêm de uma biblioteca de treino funcional (milhares de GIFs de 1920×1080, 1 a 5 MB
cada — peso impossível num telefone em ginásio). O preparo casa cada movimento do curso com uma
execução, reduz para 720 px e converte para WebP animado:

```bash
npm run gifs -- "C:/caminho/para/a/biblioteca"   # biblioteca -> data/gifs/*.webp
npm run import gifs                              # data/gifs -> storage do Supabase
```

O corte foi de 77 MB para 5,7 MB. O mapeamento de cada movimento para a sua execução está em
[scripts/preparar-gifs.mjs](../scripts/preparar-gifs.mjs), e o critério foi o ponto técnico que
o livro pede: o agachamento é o de vista lateral porque só ele mostra o calcanhar no chão, o
terra é o de landmine porque é o único com barra junto à perna, a corrida é a de fundo, de
perfil, porque o ponto é o contacto sob o centro de massa.

As execuções vêm de duas bibliotecas que se completam: uma de treino funcional e peso
corporal, outra de equipamento de academia. É a segunda que dá os padrões de força com barra —
e as aulas pedem barra: "agachamento com barra nas costas", "desenvolvimento em pé com barra".

[MovementGlyph](../src/components/MovementGlyph.tsx) continua no código como reserva, para
quando um movimento novo entrar antes da sua execução.

## Os exercícios de aquecimento

Os doze movimentos do livro saem do parser. Os do aquecimento são uma curadoria à parte, em
[aquecimento.json](aquecimento.json), para o parser continuar fiel ao PDF — e o importador
junta os dois na tabela `movements`, separados pela categoria.

As 250 aulas usam só **catorze linhas distintas** de aquecimento, o que torna possível
reconhecer o que cada uma nomeia sem adivinhação:
[src/lib/aquecimento.ts](../src/lib/aquecimento.ts) tem um padrão por exercício, e a aula
mostra uma fila com as execuções que a sua linha citou. Três desses padrões reaproveitam
movimentos do livro — "agachamentos com pausa" aponta para o agachamento, "avanços
controlados" para o unilateral, "trote" para a corrida.

## Alternativas por falta de equipamento

Cem das 250 aulas pedem trenó, sandbag, wall ball ou barra fixa — coisa que academia comum não
tem. [alternativas.json](alternativas.json) dá uma saída para cada um desses movimentos, com o
motivo escrito ("sem trenó", "sem barra"), e a ficha do movimento mostra a secção *Não tem o
equipamento?*.

O critério é **falta de equipamento, nunca variedade**. O programa é de 50 semanas e o progresso
mede-se no mesmo gesto: o próprio livro diz que "a estrutura repete-se; o que muda é a carga",
e o bloco *Da última vez* só faz sentido se o exercício for o mesmo de duas semanas atrás.

## Movimentos citados no texto

[src/lib/vincular-movimentos.tsx](../src/lib/vincular-movimentos.tsx) liga, no meio do texto da
tabela de níveis, os movimentos que o app já tem — "agachamento e levantamento terra se não
houver trenó" diz o que fazer e agora deixa ver como se faz.

O casamento respeita fronteira de palavra, e isso não é zelo excessivo: a mesma tabela tem
"manter o **extremo** superior da zona", e sem a guarda o "remo" dentro de "extremo" viraria um
link para o remoergómetro.

`data/gifs/` fica fora do git: é material derivado, e o que vale está no storage.
