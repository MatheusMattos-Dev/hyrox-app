import Link from "next/link";
import { MovementGlyph } from "@/components/MovementGlyph";
import type { Movement } from "@/lib/types";

export function MovementTile({ movement }: { movement: Movement }) {
  return (
    <Link href={`/movimentos/${movement.slug}`} className="group block">
      <MovementMedia movement={movement} />
      <p className="mt-2 text-[14px] font-semibold leading-tight text-ink">{movement.name}</p>
      {movement.category ? <p className="text-[12px] text-graphite">{movement.category}</p> : null}
    </Link>
  );
}

export function MovementMedia({
  movement,
  className = "aspect-[4/3]",
}: {
  movement: Movement;
  className?: string;
}) {
  if (movement.gif_url) {
    return (
      // O material é GIF/WebP animado: <img> mantém a animação sem otimização do Next.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={movement.gif_url}
        alt={`Execução do movimento ${movement.name}`}
        loading="lazy"
        className={`w-full rounded-panel bg-paper-alt object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`relative w-full rounded-panel border border-line bg-paper-alt ${className}`}
      role="img"
      aria-label={`Desenho do movimento ${movement.name}. GIF ainda não cadastrado.`}
    >
      <div className="absolute inset-0 flex items-center justify-center p-[13%] text-graphite">
        <MovementGlyph slug={movement.slug} name={movement.name} />
      </div>
    </div>
  );
}
