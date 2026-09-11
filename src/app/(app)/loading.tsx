import { Barra, LinhaFantasma, TituloFantasma } from "@/components/Esqueleto";

/** Vale para Hoje, Aulas, Movimentos e Perfil: título, e uma lista abaixo. */
export default function Loading() {
  return (
    <main className="px-5 pt-10" aria-busy="true" aria-label="A carregar">
      <TituloFantasma />
      <Barra className="mt-6 h-12 w-full" />
      <ul className="mt-8 border-t border-borda">
        {Array.from({ length: 6 }, (_, i) => (
          <LinhaFantasma key={i} />
        ))}
      </ul>
    </main>
  );
}
