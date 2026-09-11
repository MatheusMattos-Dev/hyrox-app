import { Barra } from "@/components/Esqueleto";

/** A aula tem forma própria: número, título de três linhas, ficha e blocos. */
export default function Loading() {
  return (
    <main className="px-5 pt-10" aria-busy="true" aria-label="A carregar a aula">
      <Barra className="h-4 w-36" />
      <Barra className="mt-5 h-3 w-52" />

      <div className="mt-3 flex items-start gap-4">
        <Barra className="h-7 w-12 shrink-0" />
        <span className="min-w-0 flex-1">
          <Barra className="h-8 w-full" />
          <Barra className="mt-2 h-8 w-3/4" />
        </span>
      </div>

      <div className="mt-8 border-t border-borda">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="flex gap-4 border-b border-borda py-3.5">
            <Barra className="h-4 w-24 shrink-0" />
            <Barra className="h-4 flex-1" />
          </div>
        ))}
      </div>

      <Barra className="mt-8 h-5 w-40" />
      <Barra className="mt-4 h-4 w-full" />
      <Barra className="mt-2 h-4 w-5/6" />
      <Barra className="mt-2 h-4 w-2/3" />
    </main>
  );
}
