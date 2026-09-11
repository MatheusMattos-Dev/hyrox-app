/**
 * "Glicolítica" não diz nada a quem está a ler a aula antes de treinar. As
 * definições abaixo são as do glossário do Manual Técnico do próprio curso —
 * capítulo 03, Fisiologia aplicada — para o app não inventar fisiologia.
 */
const VIAS: Record<string, string> = {
  Fosfagénica: "Potência máxima, duração de segundos.",
  Glicolítica: "Potência elevada, de dezenas de segundos a minutos.",
  Oxidativa: "Depende do oxigénio: potência baixa, duração longa.",
  "Fosfagénica e glicolítica": "Picos máximos repetidos, com pouca recuperação entre eles.",
  "Glicolítica e oxidativa": "Esforço forte mantido, por cima de uma base contínua.",
  Variável: "Muda ao longo da sessão, conforme o bloco.",
};

export function explicarVia(via: string | null): string | null {
  return via ? (VIAS[via] ?? null) : null;
}
