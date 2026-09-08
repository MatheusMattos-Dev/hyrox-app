import Link from "next/link";
import { Circuito } from "@/components/Circuito";
import { LessonRow } from "@/components/LessonRow";
import { MovementTile } from "@/components/MovementTile";
import { capitalizar, capitalizarTitulo } from "@/lib/format";
import { getCurrentLesson, getProgress, getViewer, listLessons, listMovements } from "@/lib/queries";

export default async function TodayPage() {
  const [viewer, progress, current, movements] = await Promise.all([
    getViewer(),
    getProgress(),
    getCurrentLesson(),
    listMovements(),
  ]);

  const upcoming = current
    ? (await listLessons()).filter((lesson) => lesson.number > current.number).slice(0, 4)
    : [];

  const firstName = viewer?.name?.split(" ")[0] ?? "Atleta";

  return (
    <main className="px-5 pt-10">
      <header className="flex items-baseline justify-between">
        <span className="rotulo text-[11px] text-ember">Master Class</span>
        <Link href="/perfil" className="text-[13px] font-semibold text-graphite">
          {firstName}
        </Link>
      </header>

      <section className="relative mt-6">
        <Circuito completed={progress.completed} total={progress.total} />
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="display text-[92px] font-bold">
            {String(progress.completed).padStart(3, "0")}
          </span>
          <span className="rotulo mt-2 text-[10px] text-graphite">
            de {progress.total} aulas
          </span>
        </div>
      </section>

      {current ? (
        <section className="mt-8">
          <h2 className="rotulo text-[11px] text-graphite">
            {progress.completed === 0 ? "Comece por aqui" : "Continuar de onde parou"}
          </h2>
          <Link
            href={`/aulas/${current.slug}`}
            className="mt-3 block bg-ink-2 p-5 text-paper"
          >
            <span className="flex items-baseline gap-3">
              <span className="tnum text-[14px] font-semibold text-ember">
                {String(current.number).padStart(3, "0")}
              </span>
              {current.weekday ? (
                <span className="rotulo text-[10px] text-paper/55">
                  {capitalizar(current.weekday)}
                  {current.session_type ? ` · ${capitalizar(current.session_type)}` : ""}
                </span>
              ) : null}
            </span>
            <span className="display mt-2 block text-[32px] font-bold">
              {capitalizarTitulo(current.title)}
            </span>
            {current.module ? (
              <span className="mt-3 block text-[13px] text-paper/55">{current.module.title}</span>
            ) : null}
            <span className="rotulo mt-5 inline-block bg-ember px-4 py-2 text-[12px] text-paper">
              Abrir aula
            </span>
          </Link>
        </section>
      ) : null}

      {upcoming.length > 0 ? (
        <section className="mt-9">
          <div className="flex items-baseline justify-between border-b border-ink pb-1.5">
            <h2 className="rotulo text-[12px]">Na sequência</h2>
            <Link href="/aulas" className="text-[13px] font-semibold text-graphite">
              Todas
            </Link>
          </div>
          <ul>
            {upcoming.map((lesson) => (
              <LessonRow key={lesson.id} lesson={lesson} />
            ))}
          </ul>
        </section>
      ) : null}

      {movements.length > 0 ? (
        <section className="mt-9 pb-10">
          <div className="flex items-baseline justify-between border-b border-ink pb-1.5">
            <h2 className="rotulo text-[12px]">Movimentos</h2>
            <Link href="/movimentos" className="text-[13px] font-semibold text-graphite">
              Biblioteca
            </Link>
          </div>
          <ul className="no-scrollbar -mx-5 mt-4 flex gap-3 overflow-x-auto px-5">
            {movements.slice(0, 8).map((movement) => (
              <li key={movement.id} className="w-[136px] shrink-0">
                <MovementTile movement={movement} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
