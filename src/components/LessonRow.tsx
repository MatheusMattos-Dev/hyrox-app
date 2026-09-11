import Link from "next/link";
import { capitalizar, capitalizarTitulo } from "@/lib/format";
import type { LessonWithState } from "@/lib/types";

/**
 * Linha de placar: o número da aula é o elemento fixo à esquerda.
 * Aula concluída = número em bloco amarelo, sem ícone extra.
 */
export function LessonRow({
  lesson,
  showModule = false,
  atual = false,
  dentroDaSemana = false,
}: {
  lesson: LessonWithState;
  showModule?: boolean;
  /** A aula em que o aluno está. Ganha marca e vira alvo de salto na lista. */
  atual?: boolean;
  /** Numa lista já agrupada por semana, o cabeçalho do grupo diz a semana e a
      descarga — repetir em cada linha só ocupa a coluna da direita. */
  dentroDaSemana?: boolean;
}) {
  const legenda = [
    lesson.weekday ? capitalizar(lesson.weekday) : null,
    lesson.session_type ? capitalizar(lesson.session_type) : null,
    showModule ? lesson.module?.title : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <li id={atual ? "aula-atual" : undefined} className={atual ? "scroll-mt-24" : undefined}>
      <Link
        href={`/aulas/${lesson.slug}`}
        className={`flex items-start gap-4 border-b border-borda py-3.5 active:bg-superficie ${
          atual ? "border-l-2 border-l-ember pl-3" : ""
        }`}
      >
        <span
          className={`tnum mt-0.5 w-11 shrink-0 py-1 text-center text-[14px] font-semibold ${
            lesson.completed ? "bg-ember text-ink" : "text-texto-fraco"
          }`}
        >
          {String(lesson.number).padStart(3, "0")}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold leading-snug text-texto">
            {capitalizarTitulo(lesson.title)}
          </span>
          {legenda ? <span className="mt-0.5 block text-[13px] text-texto-fraco">{legenda}</span> : null}
        </span>

        <span className={`mt-1 shrink-0 text-right ${dentroDaSemana ? "hidden" : ""}`}>
          {lesson.week ? (
            <span className="tnum block text-[13px] text-texto-fraco">S{String(lesson.week).padStart(2, "0")}</span>
          ) : null}
          {lesson.deload ? (
            <span className="rotulo mt-0.5 inline-block bg-rope px-1.5 py-0.5 text-[10px] text-ink">
              descarga
            </span>
          ) : null}
        </span>
      </Link>
    </li>
  );
}
