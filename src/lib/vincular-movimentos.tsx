import Link from "next/link";
import type { Movement } from "./types";

/**
 * Nomes por que o livro chama um movimento e que não são o nome dele na
 * biblioteca. "Mecânica de corrida" aparece no texto como "corrida"; "Remo e
 * SkiErg" aparece como "remo".
 */
const APELIDOS: Array<{ termo: string; slug: string }> = [
  { termo: "corrida", slug: "corrida" },
  { termo: "remo", slug: "remo-skierg" },
];

/**
 * Liga, no meio do texto, os movimentos que o app já tem. Serve às alterações
 * de nível — "agachamento e levantamento terra se não houver trenó" diz o que
 * fazer, e agora deixa ver como se faz.
 *
 * O casamento respeita fronteira de palavra: sem isso "extremo" contém "remo",
 * e a tabela de níveis tem exatamente essa frase.
 */
export function vincularMovimentos(
  texto: string,
  movimentos: Array<Pick<Movement, "slug" | "name">>,
): React.ReactNode {
  const porTermo = new Map<string, string>();

  for (const movimento of movimentos) porTermo.set(movimento.name.toLowerCase(), movimento.slug);
  for (const { termo, slug } of APELIDOS) {
    if (movimentos.some((m) => m.slug === slug)) porTermo.set(termo, slug);
  }

  // Do termo mais longo para o mais curto, para "levantamento terra" ganhar de
  // "levantamento" e não sobrar meia palavra ligada.
  const termos = [...porTermo.keys()].sort((a, b) => b.length - a.length).map(escapar);
  if (termos.length === 0) return texto;

  const padrao = new RegExp(`(?<!\\p{L})(${termos.join("|")})(?!\\p{L})`, "giu");
  const partes: React.ReactNode[] = [];
  let cursor = 0;

  for (const achado of texto.matchAll(padrao)) {
    const inicio = achado.index ?? 0;
    const slug = porTermo.get(achado[0].toLowerCase());
    if (!slug) continue;

    if (inicio > cursor) partes.push(texto.slice(cursor, inicio));
    partes.push(
      <Link
        key={`${slug}-${inicio}`}
        href={`/movimentos/${slug}`}
        className="underline underline-offset-4"
      >
        {achado[0]}
      </Link>,
    );
    cursor = inicio + achado[0].length;
  }

  if (partes.length === 0) return texto;
  if (cursor < texto.length) partes.push(texto.slice(cursor));
  return partes;
}

function escapar(termo: string) {
  return termo.replace(/[.*+?^${}()|[\]\\]/g, (c) => `\\${c}`);
}
