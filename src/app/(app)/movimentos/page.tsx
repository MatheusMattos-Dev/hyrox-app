import Link from "next/link";
import { MovementTile } from "@/components/MovementTile";
import { listMovementCategories, listMovements } from "@/lib/queries";

export default async function MovementsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tipo?: string }>;
}) {
  const { q, tipo } = await searchParams;
  const [categories, movements] = await Promise.all([
    listMovementCategories(),
    listMovements({ query: q, category: tipo }),
  ]);

  return (
    <main className="pt-10">
      <header className="px-5">
        <h1 className="display text-[38px] uppercase">Movimentos</h1>
        <p className="mt-1 max-w-[34ch] text-[14px] leading-snug text-texto-fraco">
          Como executar cada movimento, em GIF, para conferir na hora do treino.
        </p>

        <form action="/movimentos" className="mt-4">
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Buscar movimento"
            className="w-full border border-borda bg-superficie px-4 py-3 text-[15px] text-texto placeholder:text-texto-fraco focus:border-texto focus:outline-none"
          />
          {tipo ? <input type="hidden" name="tipo" value={tipo} /> : null}
        </form>
      </header>

      {categories.length > 1 ? (
        <nav className="no-scrollbar mt-4 flex gap-2 overflow-x-auto px-5 pb-1">
          <Chip href="/movimentos" label="Tudo" active={!tipo} />
          {categories.map((category) => (
            <Chip
              key={category}
              href={`/movimentos?tipo=${encodeURIComponent(category)}`}
              label={category}
              active={tipo === category}
            />
          ))}
        </nav>
      ) : null}

      <section className="mt-6 px-5 pb-12">
        {movements.length === 0 ? (
          <div className="border border-borda bg-superficie px-5 py-8">
            <p className="text-[15px] font-semibold">Nenhum movimento encontrado.</p>
            <p className="mt-1 text-[14px] text-texto-fraco">
              A biblioteca cresce conforme os GIFs são importados.
            </p>
            <Link
              href="/movimentos"
              className="mt-4 inline-block text-[14px] font-semibold underline underline-offset-4"
            >
              Ver todos
            </Link>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-x-3 gap-y-6">
            {movements.map((movement) => (
              <li key={movement.id}>
                <MovementTile movement={movement} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function Chip({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`shrink-0 whitespace-nowrap border px-3.5 py-1.5 text-[13px] font-semibold ${
        active ? "border-ember bg-ember text-ink" : "border-borda bg-superficie text-texto-fraco"
      }`}
    >
      {label}
    </Link>
  );
}
