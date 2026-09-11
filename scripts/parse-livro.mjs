#!/usr/bin/env node
// Lê data/fonte/250-Aulas.pdf e escreve data/lessons.json + data/modules.json +
// data/movements.json + data/lesson-movements.json.
//
//   node scripts/parse-livro.mjs
//
// O livro é rigorosamente templatizado: uma aula por página, sempre com os mesmos
// blocos. O parser trabalha em cima dessa regularidade e falha alto se uma página
// fugir do padrão, em vez de gravar aula pela metade.

import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { writeFileSync } from "node:fs";
import path from "node:path";

const PDF = path.resolve("data/fonte/250-Aulas.pdf");

const MESOCICLOS = [
  { slug: "fundacao-e-avaliacao", title: "Fundação e avaliação", subtitle: "Padrões primários, peso corporal, estabelecer referências" },
  { slug: "capacidade-de-trabalho", title: "Capacidade de trabalho", subtitle: "Densidade, base aeróbia, tolerar volume" },
  { slug: "forca-de-base", title: "Força de base", subtitle: "Padrões carregados, progressão dupla" },
  { slug: "potencia-e-ciclo", title: "Potência e ciclo", subtitle: "Movimentos explosivos, EMOM, taxa de força" },
  { slug: "resistencia-muscular", title: "Resistência muscular", subtitle: "Séries longas, wall balls, ergómetros" },
  { slug: "forca-especifica", title: "Força específica", subtitle: "Trenó, transportes, unilateral pesado" },
  { slug: "tolerancia-glicolitica", title: "Tolerância glicolítica", subtitle: "Intervalos, tampão de lactato, MLSS" },
  { slug: "hibrido-corrida-estacao", title: "Híbrido corrida↔estação", subtitle: "Transições, compromisso de prova" },
  { slug: "especificidade-de-prova", title: "Especificidade de prova", subtitle: "Formatos e distâncias oficiais" },
  { slug: "simulacao-e-consolidacao", title: "Simulação e consolidação", subtitle: "Chippers, provas completas, reteste" },
];

// A tabela de níveis tem uma variante fixa por TIPO de sessão. Reproduzimos as cinco
// aqui porque as colunas da tabela do PDF colam entre si na extração de texto.
const NIVEIS = {
  FORÇA: {
    n1: { carga: "Carga a 60% do estimado, amplitude parcial se necessário", repeticoes: "Menos 2 rep por série", alteracao: "Substituir barra por halteres ou kettlebells" },
    n2: { carga: "Carga de trabalho conforme prescrito", repeticoes: "Repetições prescritas", alteracao: "Prescrição de referência" },
    n3: { carga: "Carga a subir a cada série até ao limite técnico", repeticoes: "Repetições prescritas + série extra", alteracao: "Acrescentar tempo de execução 3110" },
  },
  AERÓBIO: {
    n1: { carga: "Reduzir para 60% do tempo total", repeticoes: "Menos uma ronda ou série", alteracao: "Caminhada rápida ou bicicleta em vez de corrida" },
    n2: { carga: "Tempo e séries conforme prescrito", repeticoes: "Séries prescritas", alteracao: "Prescrição de referência" },
    n3: { carga: "Tempo total prescrito + 10%", repeticoes: "Séries prescritas + 1", alteracao: "Manter o extremo superior da zona" },
  },
  ESTAÇÕES: {
    n1: { carga: "Carga a 60% da de competição", repeticoes: "Metade da distância por série", alteracao: "Agachamento e levantamento terra se não houver trenó" },
    n2: { carga: "Carga de competição da sua categoria", repeticoes: "Distância prescrita", alteracao: "Prescrição de referência" },
    n3: { carga: "Carga de competição + 20 kg no trenó", repeticoes: "Distância prescrita", alteracao: "Reduzir descanso para 45 s" },
  },
  TÉCNICA: {
    n1: { carga: "Velocidade calculada a 90%", repeticoes: "Menos 2 séries", alteracao: "Regressão do movimento técnico" },
    n2: { carga: "Velocidade calculada a 97%", repeticoes: "Séries prescritas", alteracao: "Prescrição de referência" },
    n3: { carga: "Velocidade calculada a 100%", repeticoes: "Séries prescritas + 1", alteracao: "Versão completa do movimento técnico" },
  },
  MISTA: {
    n1: { carga: "Metade das distâncias e repetições", repeticoes: "Carga a 60%", alteracao: "Formato mantido, volume reduzido" },
    n2: { carga: "Distâncias e cargas conforme prescrito", repeticoes: "Carga de competição", alteracao: "Prescrição de referência" },
    n3: { carga: "Distâncias prescritas", repeticoes: "Carga de competição + 10%", alteracao: "Sem paragens planeadas" },
  },
};

// Movimentos da biblioteca, identificados pelo bloco técnico de cada aula.
const MOVIMENTOS = [
  { match: "Agachamento", slug: "agachamento", name: "Agachamento", category: "Padrões de força" },
  { match: "Dobra de anca e levantamento terra", slug: "levantamento-terra", name: "Levantamento terra", category: "Padrões de força" },
  { match: "Empurrar vertical", slug: "empurrar-vertical", name: "Empurrar vertical", category: "Padrões de força" },
  { match: "Puxada", slug: "puxada", name: "Puxada", category: "Padrões de força" },
  { match: "Unilateral", slug: "unilateral", name: "Unilateral", category: "Padrões de força" },
  { match: "Levantamento técnico", slug: "levantamento-tecnico", name: "Levantamento técnico", category: "Padrões de força" },
  { match: "Mecânica de corrida", slug: "corrida", name: "Mecânica de corrida", category: "Corrida e ergómetros" },
  { match: "Remo e SkiErg", slug: "remo-skierg", name: "Remo e SkiErg", category: "Corrida e ergómetros" },
  { match: "Trenó", slug: "treno", name: "Trenó", category: "Estações" },
  { match: "Transporte com carga", slug: "transporte-com-carga", name: "Transporte com carga", category: "Estações" },
  { match: "Wall ball", slug: "wall-ball", name: "Wall ball", category: "Estações" },
  { match: "Burpee broad jump", slug: "burpee-broad-jump", name: "Burpee broad jump", category: "Estações" },
];

const DIAS = ["SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA"];

async function readPages() {
  const doc = await getDocument({ url: new URL(`file:///${PDF.replace(/\\/g, "/")}`), useSystemFonts: true }).promise;
  const pages = [];

  for (let p = 1; p <= doc.numPages; p += 1) {
    const content = await (await doc.getPage(p)).getTextContent();
    const linhas = new Map();

    for (const item of content.items) {
      if (!item.str) continue;
      const y = Math.round(item.transform[5]);
      if (!linhas.has(y)) linhas.set(y, []);
      linhas.get(y).push({ x: item.transform[4], w: item.width ?? 0, s: item.str });
    }

    const texto = [...linhas.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([, itens]) => {
        const ord = itens.sort((a, b) => a.x - b.x);
        const ultimo = ord[ord.length - 1];
        // Onde a linha termina na página: é isso que diz se ela quebrou por
        // falta de largura ou porque o autor quis quebrá-la.
        return { s: ord.map((i) => i.s).join("").trim(), fim: ultimo.x + ultimo.w };
      })
      .filter((l) => l.s);

    pages.push(texto);
  }

  return pages;
}

/**
 * Junta linhas partidas por hífen de translineação e remove emoji. Devolve o
 * texto e, em paralelo, onde cada linha termina — quem monta o bloco principal
 * precisa disso para separar quebra de largura de quebra de propósito.
 */
function limpar(itens) {
  const linhas = [];
  const fins = [];

  for (const item of itens) {
    const linha = item.s
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{2B00}-\u{2BFF}]/gu, "")
      .trim();
    if (!linha) continue;

    const anterior = linhas[linhas.length - 1];
    if (anterior && /[‐-]$/.test(anterior)) {
      linhas[linhas.length - 1] = anterior.replace(/[‐-]$/, "") + linha;
      fins[fins.length - 1] = item.fim;
    } else {
      linhas.push(linha);
      fins.push(item.fim);
    }
  }

  return { linhas, fins };
}

/** Onde a coluna de texto do livro termina. Medido no PDF: p90 dos fins é 538,5. */
const MARGEM_DIREITA = 538.7;

/** Marcadores que sempre abrem item novo, mesmo colados à margem. */
const MARCADOR = /^([A-Z]\.|·|•|Série \d|\d+ rondas)/;

/**
 * O PDF quebra linhas pela largura da coluna, e essas quebras têm de ser
 * desfeitas; as que o autor escreveu, não. A diferença está na geometria: uma
 * linha que quebrou por largura vai até à margem, uma que quebrou de propósito
 * para antes. O teste exato é se a primeira palavra da linha seguinte teria
 * cabido na folga que sobrou — se cabia e mesmo assim desceu, a quebra é
 * intencional.
 */
function refluir(linhas, fins) {
  const out = [];
  const fimDeSaida = [];

  for (let i = 0; i < linhas.length; i += 1) {
    const linha = linhas[i];
    const anterior = out[out.length - 1];

    if (!anterior || MARCADOR.test(linha)) {
      out.push(linha);
      fimDeSaida.push(fins[i]);
      continue;
    }

    const folga = MARGEM_DIREITA - fimDeSaida[fimDeSaida.length - 1];
    const primeiraPalavra = linha.split(/\s+/)[0] ?? "";
    // Largura média do caractere nesta linha, para estimar a palavra seguinte.
    const larguraDoCaractere = linha.length > 0 ? (fins[i] - 60) / linha.length : 0;
    const cabia = folga > primeiraPalavra.length * larguraDoCaractere;

    if (cabia) {
      out.push(linha);
      fimDeSaida.push(fins[i]);
    } else {
      out[out.length - 1] = anterior + " " + linha;
      fimDeSaida[fimDeSaida.length - 1] = fins[i];
    }
  }

  return out;
}

function juntar(linhas) {
  return linhas.join(" ").replace(/\s+/g, " ").trim();
}

function parseAula(linhasBrutas, numeroEsperado) {
  const { linhas, fins } = limpar(linhasBrutas);
  const idx = linhas.findIndex((l) => /^AULA \d{3}$/.test(l));
  if (idx === -1) return null;

  const number = Number(linhas[idx].slice(5));
  if (number !== numeroEsperado) {
    throw new Error(`Esperava a aula ${numeroEsperado} e li a ${number}.`);
  }

  const cabecalho = linhas.find((l) => /S\s*E\s*M\s*A\s*N\s*A/.test(l)) ?? "";
  const semanaMeso = cabecalho.replace(/\s+/g, "");
  const semana = Number(/SEMANA(\d+)/.exec(semanaMeso)?.[1]);
  const mesociclo = Number(/MESOCICLO(\d+)/.exec(semanaMeso)?.[1]);
  const dia = DIAS.find((d) => semanaMeso.includes(d.replace(/\s/g, "")));

  const title = linhas[idx + 1];

  // Linha do TIPO: "TIPO FORÇA · ESTÍMULO Força máxima · VIA Fosfagénica · HYROX"
  const linhaTipo = linhas.find((l) => /^T\s?IPO/.test(l)) ?? "";
  const tipo = /IPO\s*(.+?)\s*·\s*E\s?STÍMULO/.exec(linhaTipo)?.[1]?.trim();
  const estimulo = /STÍMULO\s*(.+?)\s*·\s*V\s?IA/.exec(linhaTipo)?.[1]?.trim();
  const viaEtag = /IA\s*(.+)$/.exec(linhaTipo)?.[1]?.trim() ?? "";
  const tagMatch = /(H\s?Y\s?R\s?O\s?X|S\s?Í\s?N\s?T\s?E\s?S\s?E|C\s?R\s?O\s?S\s?S\s?F\s?I\s?T)\s*$/.exec(viaEtag);
  const tag = tagMatch ? tagMatch[1].replace(/\s/g, "") : null;
  const via = viaEtag.replace(/·?\s*(H\s?Y\s?R\s?O\s?X|S\s?Í\s?N\s?T\s?E\s?S\s?E|C\s?R\s?O\s?S\s?S\s?F\s?I\s?T)\s*$/, "").replace(/·\s*$/, "").trim();

  // Linha da DURAÇÃO: pode ocupar duas linhas.
  const iDur = linhas.findIndex((l) => /^D\s?URAÇÃO/.test(l));
  const iAquec = linhas.findIndex((l) => /AQUECIMENTO — \d+ MIN/.test(l));
  const blocoDur = juntar(linhas.slice(iDur, iAquec));
  const duracao = Number(/URAÇÃO\s*(\d+)\s*min/.exec(blocoDur)?.[1]);
  const equipamento = /QUIPAMENTO\s*(.+?)\s*·\s*E\s?SPAÇO/.exec(blocoDur)?.[1]?.trim();
  const espaco = /SPAÇO\s*(.+)$/.exec(blocoDur)?.[1]?.trim();

  const iTecnico = linhas.findIndex((l) => /BLOCO TÉCNICO — \d+ MIN/.test(l));
  const iPrincipal = linhas.findIndex((l) => /^Bloco principal — \d+ min/.test(l));
  const iTabela = linhas.findIndex((l) => /^NÍVEL/.test(l));
  const iArref = linhas.findIndex((l) => /ARREFECIMENTO — \d+ MIN/.test(l));
  const iCoach = linhas.findIndex((l) => /COACHING/.test(l));
  const iErro = linhas.findIndex((l) => /ERRO A VIGIAR/.test(l));
  const iRegisto = linhas.findIndex((l) => /REGISTO/.test(l) && !/^NÍVEL/.test(l));

  // Aquecimento: bullets iniciados por "•".
  const aquecimento = [];
  for (const linha of linhas.slice(iAquec + 1, iTecnico)) {
    if (linha.startsWith("•")) aquecimento.push(linha.slice(1).trim());
    else if (aquecimento.length) aquecimento[aquecimento.length - 1] += ` ${linha}`;
  }

  // Bloco técnico: "Movimento — pista técnica. Ver ficha X, cap. 06 do manual."
  const tecnicoTexto = juntar(linhas.slice(iTecnico + 1, iPrincipal));
  const [movimento, ...restoTecnico] = tecnicoTexto.split(" — ");
  const tecnicaCompleta = restoTecnico.join(" — ");
  const ficha = /Ver ficha (.+?), cap\. 06 do manual\./.exec(tecnicaCompleta)?.[1]?.trim() ?? null;
  const tecnica = tecnicaCompleta.replace(/\s*Ver ficha .+?, cap\. 06 do manual\.\s*$/, "").trim();

  // Bloco principal: tudo até a tabela, separando o aviso de descarga.
  const principalLinhas = linhas.slice(iPrincipal + 1, iTabela);
  const iDescarga = principalLinhas.findIndex((l) => l.startsWith("SEMANA DE DESCARGA."));
  const descarga = iDescarga !== -1;
  const principalFins = fins.slice(iPrincipal + 1, iTabela);
  const ate = descarga ? iDescarga : principalLinhas.length;
  const principal = refluir(principalLinhas.slice(0, ate), principalFins.slice(0, ate)).join("\n");

  const arrefecimento = juntar(linhas.slice(iArref + 1, iCoach));
  const coaching = juntar(linhas.slice(iCoach, iErro)).replace(/^COACHING\s*/, "");
  const erro = juntar(linhas.slice(iErro, iRegisto)).replace(/^ERRO A VIGIAR\s*/, "");
  const registo = juntar(linhas.slice(iRegisto, linhas.length - 1)).replace(/^REGISTO\s*/, "");

  const niveis = NIVEIS[tipo];
  if (!niveis) throw new Error(`Aula ${number}: tipo desconhecido "${tipo}".`);

  const movimentoRef = MOVIMENTOS.find((m) => movimento.startsWith(m.match));
  if (!movimentoRef) throw new Error(`Aula ${number}: movimento desconhecido "${movimento}".`);

  return {
    number,
    slug: `aula-${String(number).padStart(3, "0")}`,
    title,
    module: MESOCICLOS[mesociclo - 1].slug,
    week: semana,
    mesocycle: mesociclo,
    weekday: dia,
    deload: descarga,
    session_type: tipo,
    stimulus: estimulo,
    pathway: via,
    tag,
    duration_min: duracao,
    equipment: equipamento,
    space: espaco,
    warmup: aquecimento,
    technique_movement: movimentoRef.slug,
    technique_cue: tecnica,
    technique_sheet: ficha,
    main_block: principal,
    levels: niveis,
    cooldown: arrefecimento,
    coaching,
    watch_error: erro,
    log_what: registo,
    summary: `${tipo} · ${estimulo}. ${coaching}`.slice(0, 240),
  };
}

const paginas = await readPages();
const aulas = [];

for (const pagina of paginas) {
  const proxima = aulas.length + 1;
  if (proxima > 250) break;
  const { linhas: limpa } = limpar(pagina);
  if (!limpa.some((l) => l === `AULA ${String(proxima).padStart(3, "0")}`)) continue;
  aulas.push(parseAula(pagina, proxima));
}

if (aulas.length !== 250) {
  throw new Error(`Li ${aulas.length} aulas, esperava 250.`);
}

const modules = MESOCICLOS.map((m, i) => ({ ...m, position: i + 1 }));

const usados = new Set(aulas.map((a) => a.technique_movement));
const movements = MOVIMENTOS.filter((m) => usados.has(m.slug)).map((m, i) => ({
  slug: m.slug,
  name: m.name,
  category: m.category,
  gif_url: null,
  description: aulas.find((a) => a.technique_movement === m.slug).technique_cue,
  cues: [...new Set(aulas.filter((a) => a.technique_movement === m.slug).map((a) => a.technique_cue))]
    .flatMap((t) => t.split(" · "))
    .map((c) => c.replace(/\.$/, "").trim())
    .filter(Boolean)
    .slice(0, 6),
  common_errors: [...new Set(aulas.filter((a) => a.technique_movement === m.slug).map((a) => a.watch_error))].slice(0, 3),
  position: i + 1,
}));

const links = aulas.map((a) => ({ lesson: a.number, movements: [a.technique_movement] }));

writeFileSync("data/lessons.json", JSON.stringify(aulas, null, 1) + "\n");
writeFileSync("data/modules.json", JSON.stringify(modules, null, 2) + "\n");
writeFileSync("data/movements.json", JSON.stringify(movements, null, 2) + "\n");
writeFileSync("data/lesson-movements.json", JSON.stringify(links, null, 1) + "\n");

console.log(`aulas: ${aulas.length}`);
console.log(`mesociclos: ${modules.length}`);
console.log(`movimentos: ${movements.length} (${movements.map((m) => m.slug).join(", ")})`);
