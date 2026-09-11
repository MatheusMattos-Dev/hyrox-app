/**
 * O aquecimento vem do livro como texto corrido — "Ativação: 20 pontes de
 * glúteo, 15 remadas com banda, 10 burpees a ritmo lento". São dez dos sessenta
 * minutos da sessão e até aqui não tinham nenhuma ilustração.
 *
 * As 250 aulas usam só catorze linhas distintas de aquecimento, então dá para
 * reconhecer o que cada uma nomeia sem adivinhação: cada padrão abaixo aponta
 * para um movimento que existe na biblioteca.
 */
const PADROES: Array<{ teste: RegExp; slug: string }> = [
  { teste: /pontes? de gl[úu]teo/i, slug: "ponte-de-gluteo" },
  { teste: /remadas? com banda/i, slug: "remada-com-banda" },
  { teste: /abdu[çc][õo]es com banda/i, slug: "abducao-com-banda" },
  { teste: /avan[çc]os? com rota[çc][ãa]o/i, slug: "avanco-com-rotacao" },
  { teste: /balan[çc]os? de perna/i, slug: "balanco-de-perna" },
  { teste: /rota[çc][õo]es de ombro com bast[ãa]o/i, slug: "rotacao-de-ombro-com-bastao" },
  { teste: /eleva[çc][õo]es de calcanhar/i, slug: "elevacao-de-calcanhar" },
  { teste: /joelhos altos/i, slug: "joelhos-altos" },
  { teste: /calcanhares aos gl[úu]teos/i, slug: "calcanhares-aos-gluteos" },
  { teste: /passada lateral/i, slug: "passada-lateral" },
  { teste: /saltos? [àa] corda/i, slug: "salto-a-corda" },
  { teste: /burpees?/i, slug: "burpee-lento" },

  { teste: /skierg/i, slug: "skierg" },

  // Estes já existem como movimento do livro: o aquecimento reaproveita.
  { teste: /agachamentos? (com pausa|livres)/i, slug: "agachamento" },
  { teste: /avan[çc]os controlados/i, slug: "unilateral" },
  { teste: /(remo suave|de erg)/i, slug: "remo-skierg" },
  { teste: /(trote|corrida)/i, slug: "corrida" },
];

/** Os movimentos que estas linhas de aquecimento nomeiam, sem repetir. */
export function slugsDoAquecimento(linhas: string[] | null): string[] {
  if (!linhas?.length) return [];

  const texto = linhas.join(" ");
  const encontrados: string[] = [];

  for (const { teste, slug } of PADROES) {
    if (teste.test(texto) && !encontrados.includes(slug)) encontrados.push(slug);
  }

  return encontrados;
}
