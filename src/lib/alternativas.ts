import alternativas from "../../data/alternativas.json";

/**
 * Cem das 250 aulas pedem trenó, sandbag, wall ball ou barra fixa — coisa que
 * academia comum não tem. Cada alternativa aqui existe por falta de
 * equipamento, não por variedade: o programa é de 50 semanas e o progresso
 * mede-se no mesmo gesto.
 */
export type Alternativa = { slug: string; motivo: string };

const POR_MOVIMENTO = new Map<string, Alternativa[]>();

for (const item of alternativas) {
  const atual = POR_MOVIMENTO.get(item.substitui) ?? [];
  atual.push({ slug: item.slug, motivo: item.motivo });
  POR_MOVIMENTO.set(item.substitui, atual);
}

export function alternativasDe(slug: string): Alternativa[] {
  return POR_MOVIMENTO.get(slug) ?? [];
}
