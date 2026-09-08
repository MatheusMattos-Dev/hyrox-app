/**
 * O ano inteiro visto como uma volta: 250 aulas fechando o circuito.
 * As dez marcas na pista são os dez mesociclos; o traço laranja é o quanto já andou.
 */
export function Circuito({
  completed,
  total,
  sobreEscuro = false,
}: {
  completed: number;
  total: number;
  sobreEscuro?: boolean;
}) {
  const razao = total > 0 ? Math.min(1, completed / total) : 0;
  const percentagem = Math.round(razao * 100);
  const pista = sobreEscuro ? "var(--color-line-ink)" : "var(--color-line)";
  const marca = sobreEscuro ? "var(--color-paper)" : "var(--color-ink)";
  const partida = sobreEscuro ? "var(--color-paper)" : "var(--color-ink)";

  return (
    <svg
      viewBox="0 0 300 148"
      className="w-full"
      role="img"
      aria-label={`${completed} de ${total} aulas concluídas, ${percentagem}% do percurso`}
    >
      <path d={PISTA} pathLength={1} fill="none" stroke={pista} strokeWidth="1.5" />

      {/* Uma marca por mesociclo, a cada cinco semanas. */}
      <path
        d={PISTA}
        pathLength={1}
        fill="none"
        stroke={marca}
        strokeOpacity="0.3"
        strokeWidth="9"
        strokeDasharray="0.003 0.097"
      />

      {razao > 0 ? (
        <path
          d={PISTA}
          pathLength={1}
          fill="none"
          stroke="var(--color-ember)"
          strokeWidth="3.5"
          strokeDasharray={`${razao} ${1 - razao}`}
        />
      ) : null}

      {/* Linha de partida, no topo. */}
      <rect x="148.5" y="1" width="3" height="10" fill={partida} />
    </svg>
  );
}

const PISTA = "M150 6 H212 A68 68 0 0 1 212 142 H88 A68 68 0 0 1 88 6 Z";
