import Link from "next/link";
import { MovementGlyph } from "@/components/MovementGlyph";
import type { Movement } from "@/lib/types";

export function MovementTile({ movement }: { movement: Movement }) {
  return (
    <Link href={`/movimentos/${movement.slug}`} className="group block">
      <MovementMedia movement={movement} />
      <p className="mt-2 text-[14px] font-semibold leading-tight text-texto">{movement.name}</p>
      {movement.category ? <p className="text-[12px] text-texto-fraco">{movement.category}</p> : null}
    </Link>
  );
}

export function MovementMedia({
  movement,
  className = "aspect-video",
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
        className={`placa w-full rounded-panel bg-[#fcfbfc] object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`relative w-full rounded-panel border border-borda bg-superficie ${className}`}
      role="img"
      aria-label={`Desenho do movimento ${movement.name}. GIF ainda não cadastrado.`}
    >
      <div className="absolute inset-0 flex items-center justify-center p-[13%] text-texto-fraco">
        <MovementGlyph slug={movement.slug} name={movement.name} />
      </div>
    </div>
  );
}
