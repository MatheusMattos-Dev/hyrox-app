import Link from "next/link";
import { notFound } from "next/navigation";
import { MovementMedia } from "@/components/MovementTile";
import { getMovementBySlug } from "@/lib/queries";

export default async function MovementPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const movement = await getMovementBySlug(slug);

  if (!movement) notFound();

  return (
    <main className="px-5 pt-10 pb-12">
      <Link href="/movimentos" className="text-[14px] font-semibold text-graphite">
        Voltar para a biblioteca
      </Link>

      <div className="mt-4">
        <MovementMedia movement={movement} className="aspect-[4/3]" />
      </div>

      <header className="mt-6">
        <h1 className="display text-[42px] uppercase">
          {movement.name}
        </h1>
        {movement.category ? <p className="mt-2 text-[14px] text-graphite">{movement.category}</p> : null}
      </header>

      {movement.description ? <p className="prose-coach mt-5">{movement.description}</p> : null}

      {movement.cues?.length ? (
        <section className="mt-8">
          <h2 className="rotulo border-b border-ink pb-1.5 text-[12px]">
            Pontos de execução
          </h2>
          <ul>
            {movement.cues.map((cue) => (
              <li key={cue} className="border-b border-line py-3 text-[15px] leading-snug">
                {cue}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {movement.common_errors?.length ? (
        <section className="mt-8">
          <h2 className="rotulo border-b border-ink pb-1.5 text-[12px]">
            Erros que custam tempo
          </h2>
          <ul className="mt-3">
            {movement.common_errors.map((error) => (
              <li
                key={error}
                className="mb-2 border-l-2 border-rope py-1 pl-4 text-[15px] leading-snug"
              >
                {error}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
