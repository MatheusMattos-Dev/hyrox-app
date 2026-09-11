import Link from "next/link";
import { LessonRow } from "@/components/LessonRow";
import { ProgressRule } from "@/components/ProgressRule";
import { capitalizar, capitalizarTitulo } from "@/lib/format";
import {
  getCurrentLesson,
  listLessons,
  listModuleSummaries,
  listSessionTypes,
} from "@/lib/queries";
import type { LessonWithState } from "@/lib/types";

export default async function LessonsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; bloco?: string; tipo?: string }>;
}) {
  const { q, bloco, tipo } = await searchParams;
  const [modules, tipos, lessons, atual] = await Promise.all([
    listModuleSummaries(),
    listSessionTypes(),
    listLessons({ query: q, moduleSlug: bloco, sessionType: tipo }),
    getCurrentLesson(),
  ]);

  const filtering = Boolean(q?.trim() || bloco || tipo);
  const activeModule = modules.find((module) => module.slug === bloco);
  // O progresso sai do próprio resultado, para bater com qualquer combinação
  // de filtros em vez de com um deles só.
  const concluidas = lessons.filter((lesson) => lesson.completed).length;

  /** Mantém os outros filtros ao trocar um deles. */
  const comFiltros = (mudanca: { bloco?: string; tipo?: string }) => {
    const params = new URLSearchParams();
    if (q?.trim()) params.set("q", q);

    const novoBloco = "bloco" in mudanca ? mudanca.bloco : bloco;
    const novoTipo = "tipo" in mudanca ? mudanca.tipo : tipo;
    if (novoBloco) params.set("bloco", novoBloco);
    if (novoTipo) params.set("tipo", novoTipo);

    const busca = params.toString();
    return busca ? `/aulas?${busca}` : "/aulas";
  };

  return (
    <main className="pt-10">
      <header className="px-5">
        <h1 className="display text-[38px] uppercase">Aulas</h1>

        <form action="/aulas" className="mt-4">
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Buscar por número ou assunto"
            className="w-full border border-borda bg-superficie px-4 py-3 text-[15px] text-texto placeholder:text-texto-fraco focus:border-texto focus:outline-none"
          />
          {bloco ? <input type="hidden" name="bloco" value={bloco} /> : null}
          {tipo ? <input type="hidden" name="tipo" value={tipo} /> : null}
        </form>
      </header>

      {/* São 250 aulas numa página de vinte mil pixels: sem isto, quem está na
          aula 137 tem de rolar 136 linhas para se encontrar. */}
      {atual && !filtering ? (
        <section className="mt-6 px-5">
          <div className="flex items-baseline justify-between border-b border-texto pb-1.5">
            <h2 className="rotulo text-[12px]">Onde você está</h2>
            <a href="#aula-atual" className="text-[13px] font-semibold underline underline-offset-4">
              Ver na lista
            </a>
          </div>
          <Link href={`/aulas/${atual.slug}`} className="mt-3 flex items-start gap-4">
            <span className="tnum shrink-0 bg-ember px-2.5 py-1 text-[14px] font-semibold text-ink">
              {String(atual.number).padStart(3, "0")}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[16px] font-semibold leading-snug">
                {capitalizarTitulo(atual.title)}
              </span>
              <span className="rotulo mt-1 block text-[10px] text-texto-fraco">
                {atual.week ? `Semana ${String(atual.week).padStart(2, "0")}` : null}
                {atual.weekday ? ` · ${capitalizar(atual.weekday)}` : null}
                {atual.session_type ? ` · ${capitalizar(atual.session_type)}` : null}
              </span>
            </span>
          </Link>
        </section>
      ) : null}

      <FiltroLinha rotulo="Tipo de sessão">
        <Chip href={comFiltros({ tipo: undefined })} label="Tudo" active={!tipo} />
        {tipos.map((item) => (
          <Chip
            key={item.tipo}
            href={comFiltros({ tipo: item.tipo })}
            label={capitalizar(item.tipo)}
            active={tipo === item.tipo}
          />
        ))}
      </FiltroLinha>

      <FiltroLinha rotulo="Mesociclo">
        <Chip href={comFiltros({ bloco: undefined })} label="Tudo" active={!bloco} />
        {modules.map((module) => (
          <Chip
            key={module.id}
            href={comFiltros({ bloco: module.slug })}
            label={module.title}
            active={bloco === module.slug}
          />
        ))}
      </FiltroLinha>

      {filtering && lessons.length > 0 ? (
        <section className="mt-5 px-5">
          {activeModule?.subtitle ? (
            <p className="text-[14px] leading-snug text-texto-fraco">{activeModule.subtitle}</p>
          ) : null}
          <p className="tnum mt-3 text-[13px] text-texto-fraco">
            {concluidas} de {lessons.length} concluídas
          </p>
          <div className="mt-2">
            <ProgressRule completed={concluidas} total={lessons.length} />
          </div>
        </section>
      ) : null}

      <section className="mt-6 px-5 pb-12">
        {lessons.length === 0 ? (
          <div className="border border-borda bg-superficie px-5 py-8">
            <p className="text-[15px] font-semibold">Nenhuma aula com esses filtros.</p>
            <p className="mt-1 text-[14px] text-texto-fraco">
              Tente o número da aula ou o nome da estação.
            </p>
            <Link
              href="/aulas"
              className="mt-4 inline-block text-[14px] font-semibold underline underline-offset-4"
            >
              Limpar tudo
            </Link>
          </div>
        ) : filtering ? (
          <ul className="border-t border-borda">
            {lessons.map((lesson) => (
              <LessonRow
                key={lesson.id}
                lesson={lesson}
                showModule={!bloco}
                atual={lesson.id === atual?.id}
              />
            ))}
          </ul>
        ) : (
          modules.map((module) => {
            const doModulo = lessons.filter((lesson) => lesson.module?.slug === module.slug);
            if (doModulo.length === 0) return null;

            return (
              <section key={module.id} className="mb-8">
                <div className="flex items-baseline justify-between border-b border-texto pb-1.5">
                  <h2 className="rotulo text-[12px]">{module.title}</h2>
                  <span className="tnum text-[13px] text-texto-fraco">
                    {module.completed}/{module.total}
                  </span>
                </div>

                {/* A semana é a unidade que o aluno vive: cinco sessões de
                    segunda a sexta. Sem ela, a lista é um rio de 250 linhas. */}
                {agruparPorSemana(doModulo).map(([semana, daSemana]) => (
                  <div key={semana} className="mt-4">
                    <p className="rotulo flex items-baseline gap-2 text-[10px] text-texto-fraco">
                      <span>Semana {String(semana).padStart(2, "0")}</span>
                      {daSemana.some((lesson) => lesson.deload) ? (
                        <span className="bg-rope px-1.5 py-0.5 text-ink">descarga</span>
                      ) : null}
                    </p>
                    <ul className="mt-1.5">
                      {daSemana.map((lesson) => (
                        <LessonRow
                          key={lesson.id}
                          lesson={lesson}
                          atual={lesson.id === atual?.id}
                          dentroDaSemana
                        />
                      ))}
                    </ul>
                  </div>
                ))}
              </section>
            );
          })
        )}
      </section>
    </main>
  );
}

/** As aulas de um mesociclo, em blocos de semana, na ordem do programa. */
function agruparPorSemana(lessons: LessonWithState[]): Array<[number, LessonWithState[]]> {
  const porSemana = new Map<number, LessonWithState[]>();

  for (const lesson of lessons) {
    const semana = lesson.week ?? 0;
    const atual = porSemana.get(semana) ?? [];
    atual.push(lesson);
    porSemana.set(semana, atual);
  }

  return [...porSemana.entries()].sort((a, b) => a[0] - b[0]);
}

/** Uma fila de filtros, com o nome do que ela filtra à esquerda. */
function FiltroLinha({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <p className="rotulo px-5 text-[10px] text-texto-fraco">{rotulo}</p>
      <nav className="no-scrollbar mt-1.5 flex gap-2 overflow-x-auto px-5 pb-1">{children}</nav>
    </div>
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
