import { Barra, TituloFantasma } from "@/components/Esqueleto";

/** A biblioteca é uma grade de duas colunas com a placa em 16:9. */
export default function Loading() {
  return (
    <main className="px-5 pt-10" aria-busy="true" aria-label="A carregar os movimentos">
      <TituloFantasma />
      <Barra className="mt-4 h-12 w-full" />
      <ul className="mt-8 grid grid-cols-2 gap-x-3 gap-y-6">
        {Array.from({ length: 6 }, (_, i) => (
          <li key={i}>
            <Barra className="aspect-video w-full" />
            <Barra className="mt-2 h-4 w-4/5" />
            <Barra className="mt-1.5 h-3 w-2/5" />
          </li>
        ))}
      </ul>
    </main>
  );
}
