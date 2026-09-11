import Link from "next/link";
import { MovementMedia } from "@/components/MovementTile";
import type { Movement } from "@/lib/types";

/**
 * Uma fila de execuções para conferir de relance. Nasceu para o aquecimento,
 * que o livro entrega como texto corrido: "20 pontes de glúteo, 15 remadas com
 * banda, 10 burpees a ritmo lento" não diz a ninguém como se faz nenhum deles.
 */
export function RailDeMovimentos({ movements }: { movements: Movement[] }) {
  if (movements.length === 0) return null;

  return (
    <ul className="no-scrollbar -mx-5 flex gap-2.5 overflow-x-auto px-5">
      {movements.map((movement) => (
        <li key={movement.id} className="w-[124px] shrink-0">
          <Link href={`/movimentos/${movement.slug}`} className="block">
            <MovementMedia movement={movement} />
            <span className="mt-1.5 block text-[12px] font-semibold leading-tight">
              {movement.name}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
