import type { Lesson, LessonLog } from "./types";

/**
 * O que anotar muda por tipo de sessão. O livro pede uma coisa em cada um dos
 * cinco tipos — as 250 aulas usam exatamente cinco frases de registo — então o
 * formulário pergunta isso, campo a campo, em vez de abrir uma caixa de texto.
 */
export type CampoRegisto = {
  id: string;
  rotulo: string;
  /** Versão curta, para o caderno, onde o rótulo fica em cima do valor. */
  curto: string;
  dica: string;
  modo: "texto" | "numero";
  sufixo?: string;
};

const CAMPOS: Record<string, CampoRegisto[]> = {
  // "Carga de cada série e número de repetições completadas."
  FORÇA: [
    { id: "carga", rotulo: "Carga por série", curto: "Carga", dica: "60, 65, 70, 70 kg", modo: "texto" },
    { id: "repeticoes", rotulo: "Repetições completadas", curto: "Repetições", dica: "5, 5, 5, 4", modo: "texto" },
  ],

  // "Distância total, frequência cardíaca média e ritmo de cada série."
  AERÓBIO: [
    { id: "distancia", rotulo: "Distância total", curto: "Distância", dica: "8 km", modo: "texto" },
    { id: "fc_media", rotulo: "FC média", curto: "FC média", dica: "148", modo: "numero", sufixo: "bpm" },
    { id: "ritmo", rotulo: "Ritmo de cada série", curto: "Ritmo", dica: "4:52, 4:50, 4:55", modo: "texto" },
  ],

  // "Carga do trenó, distâncias completadas sem paragem e tempo total do circuito."
  ESTAÇÕES: [
    { id: "carga_treno", rotulo: "Carga do trenó", curto: "Trenó", dica: "102 kg", modo: "texto" },
    { id: "sem_paragem", rotulo: "Distâncias sem paragem", curto: "Sem paragem", dica: "25 m, 25 m, 15 m", modo: "texto" },
    { id: "tempo_total", rotulo: "Tempo total do circuito", curto: "Circuito", dica: "18:30", modo: "texto" },
  ],

  // "Velocidades ou ritmos cumpridos e cargas usadas."
  TÉCNICA: [
    { id: "ritmos", rotulo: "Velocidades ou ritmos", curto: "Ritmos", dica: "28 spm, 1:58/500 m", modo: "texto" },
    { id: "cargas", rotulo: "Cargas usadas", curto: "Cargas", dica: "40 kg", modo: "texto" },
  ],

  // "Tempo total, paragens por estação e sensação de esforço no fim."
  MISTA: [
    { id: "tempo_total", rotulo: "Tempo total", curto: "Tempo", dica: "42:10", modo: "texto" },
    { id: "paragens", rotulo: "Paragens por estação", curto: "Paragens", dica: "trenó 2, wall ball 3", modo: "texto" },
  ],
};

export function camposDoRegisto(lesson: Pick<Lesson, "session_type">): CampoRegisto[] {
  return CAMPOS[lesson.session_type ?? ""] ?? [];
}

/** Uma linha de leitura do registo: rótulo curto, valor, e a unidade à parte. */
export type Marcado = { chave: string; rotulo: string; valor: string; unidade?: string };

/**
 * Transforma um registo guardado nas linhas que se leem. É o mesmo resumo no
 * caderno do perfil e no bloco "da última vez" dentro da aula, para os dois
 * nunca divergirem.
 */
export function resumoDoRegisto(
  registo: Pick<LessonLog, "fields" | "level" | "rpe">,
  lesson: Pick<Lesson, "session_type">,
): Marcado[] {
  const linhas: Marcado[] = camposDoRegisto(lesson)
    .filter((campo) => registo.fields[campo.id])
    .map((campo) => ({
      chave: campo.id,
      rotulo: campo.curto,
      valor: registo.fields[campo.id],
      unidade: campo.sufixo,
    }));

  if (registo.level) {
    linhas.push({ chave: "nivel", rotulo: "Nível", valor: registo.level.toUpperCase() });
  }
  if (registo.rpe) {
    linhas.push({ chave: "rpe", rotulo: "Esforço", valor: String(registo.rpe), unidade: "/ 10" });
  }

  return linhas;
}

/** Só guarda o que foi preenchido — campo vazio não vira chave no jsonb. */
export function limparCampos(bruto: Record<string, string>): Record<string, string> {
  const limpo: Record<string, string> = {};

  for (const [chave, valor] of Object.entries(bruto)) {
    const texto = valor.trim();
    if (texto) limpo[chave] = texto;
  }

  return limpo;
}

export const NIVEIS_REGISTO = [
  { valor: "n1", rotulo: "N1" },
  { valor: "n2", rotulo: "N2" },
  { valor: "n3", rotulo: "N3" },
] as const;
