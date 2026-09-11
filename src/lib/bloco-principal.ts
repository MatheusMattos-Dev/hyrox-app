/**
 * O bloco principal são os 32 minutos da sessão, e o livro escreve-o com
 * estrutura: cabeçalhos ("Por tempo:", "4 rondas:"), partes ("A.", "B.") e
 * itens ("·"). Até aqui tudo isso era achatado num parágrafo corrido, que é a
 * pior forma possível de ler uma prescrição de pé, no meio do treino.
 */
export type Pedaco =
  | { tipo: "cabecalho"; texto: string }
  | { tipo: "parte"; marca: string; texto: string }
  | { tipo: "item"; texto: string }
  | { tipo: "prosa"; texto: string };

const CABECALHO = /^(Série \d+|\d+ rondas?|Por tempo|Por rondas|AMRAP|EMOM[^:]*)\s*:?\s*(.*)$/i;
const PARTE = /^([A-Z])\.\s+(.+)$/;
const ITEM = /^[·•]\s*(.+)$/;

export function lerBlocoPrincipal(bloco: string): Pedaco[] {
  const pedacos: Pedaco[] = [];

  for (const bruta of bloco.split("\n")) {
    const linha = bruta.trim();
    if (!linha) continue;

    const parte = PARTE.exec(linha);
    if (parte) {
      pedacos.push({ tipo: "parte", marca: parte[1], texto: parte[2] });
      continue;
    }

    const item = ITEM.exec(linha);
    if (item) {
      pedacos.push({ tipo: "item", texto: item[1] });
      continue;
    }

    const cabecalho = CABECALHO.exec(linha);
    if (cabecalho) {
      pedacos.push({ tipo: "cabecalho", texto: cabecalho[1] });
      // "4 rondas: 20 wall balls" traz o cabeçalho e o primeiro item juntos.
      if (cabecalho[2]) pedacos.push({ tipo: "item", texto: cabecalho[2] });
      continue;
    }

    pedacos.push({ tipo: "prosa", texto: linha });
  }

  return pedacos;
}
