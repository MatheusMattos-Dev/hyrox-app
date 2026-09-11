/**
 * Peças de esqueleto para as telas enquanto o servidor responde. Em wifi de
 * ginásio a troca de aba ficava parada sem sinal nenhum de que algo acontecia.
 * O pulso é discreto e respeita quem pediu menos movimento.
 */
export function Barra({ className = "" }: { className?: string }) {
  return <span className={`block animate-pulse rounded-sm bg-texto/10 ${className}`} />;
}

/** Uma linha de aula: bloco do número à esquerda, título e legenda à direita. */
export function LinhaFantasma() {
  return (
    <li className="flex items-start gap-4 border-b border-borda py-3.5">
      <Barra className="mt-0.5 h-6 w-11 shrink-0" />
      <span className="min-w-0 flex-1">
        <Barra className="h-4 w-4/5" />
        <Barra className="mt-2 h-3 w-2/5" />
      </span>
    </li>
  );
}

export function TituloFantasma() {
  return <Barra className="h-9 w-40" />;
}
