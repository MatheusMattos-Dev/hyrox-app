import relacao from "../../data/alternativas.json";

/**
 * Cem das 250 aulas pedem trenó, sandbag, wall ball ou barra fixa — coisa que
 * academia comum não tem. Cada alternativa existe por falta de equipamento,
 * não por variedade: o programa é de 50 semanas e o progresso mede-se no mesmo
 * gesto. Por isso são várias por movimento — se não há barra nem kettlebell,
 * uma opção só não resolve — e cada uma diz o que exige, não o que falta.
 */
export type Alternativa = { slug: string; com: string };

const POR_MOVIMENTO = new Map<string, Alternativa[]>();

for (const item of relacao) {
  const atual = POR_MOVIMENTO.get(item.substitui) ?? [];
  atual.push({ slug: item.movimento, com: item.com });
  POR_MOVIMENTO.set(item.substitui, atual);
}

export function alternativasDe(slug: string): Alternativa[] {
  return POR_MOVIMENTO.get(slug) ?? [];
}
