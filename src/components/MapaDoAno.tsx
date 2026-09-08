import type { LessonWithState } from "@/lib/types";

/**
 * As 250 aulas em dez linhas de vinte e cinco: uma linha por mesociclo,
 * uma coluna por dia. Preenchido é aula dada; a coluna mais clara é a descarga.
 */
export function MapaDoAno({ lessons }: { lessons: LessonWithState[] }) {
  const ordenadas = [...lessons].sort((a, b) => a.number - b.number);
  const linhas: LessonWithState[][] = [];

  for (let i = 0; i < ordenadas.length; i += 25) {
    linhas.push(ordenadas.slice(i, i + 25));
  }

  return (
    <div className="space-y-[3px]">
      {linhas.map((linha, indice) => (
        <div key={indice} className="flex gap-[3px]">
          {linha.map((lesson) => (
            <span
              key={lesson.id}
              title={`Aula ${lesson.number}`}
              className={`h-[9px] flex-1 ${
                lesson.completed
                  ? "bg-ember"
                  : lesson.deload
                    ? "bg-ink/8"
                    : "bg-ink/20"
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
