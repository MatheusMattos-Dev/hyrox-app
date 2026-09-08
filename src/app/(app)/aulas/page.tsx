import Link from "next/link";
import { LessonRow } from "@/components/LessonRow";
import { ProgressRule } from "@/components/ProgressRule";
import { listLessons, listModuleSummaries } from "@/lib/queries";

export default async function LessonsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; bloco?: string }>;
}) {
  const { q, bloco } = await searchParams;
  const [modules, lessons] = await Promise.all([
    listModuleSummaries(),
    listLessons({ query: q, moduleSlug: bloco }),
  ]);

  const filtering = Boolean(q?.trim() || bloco);
  const activeModule = modules.find((module) => module.slug === bloco);

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
            className="w-full border border-line bg-paper-alt px-4 py-3 text-[15px] text-ink placeholder:text-graphite focus:border-ember focus:outline-none"
          />
          {bloco ? <input type="hidden" name="bloco" value={bloco} /> : null}
        </form>
      </header>

      <nav className="no-scrollbar mt-4 flex gap-2 overflow-x-auto px-5 pb-1">
        <FilterChip href="/aulas" label="Tudo" active={!bloco} />
        {modules.map((module) => (
          <FilterChip
            key={module.id}
            href={`/aulas?bloco=${module.slug}`}
            label={module.title}
            active={bloco === module.slug}
          />
        ))}
      </nav>

      {activeModule ? (
        <section className="mt-5 px-5">
          <p className="text-[14px] leading-snug text-graphite">{activeModule.subtitle}</p>
          <p className="tnum mt-3 text-[13px] text-graphite">
            {activeModule.completed} de {activeModule.total} concluídas
          </p>
          <div className="mt-2">
            <ProgressRule completed={activeModule.completed} total={activeModule.total} />
          </div>
        </section>
      ) : null}

      <section className="mt-6 px-5 pb-12">
        {lessons.length === 0 ? (
          <div className="border border-line bg-paper-alt px-5 py-8">
            <p className="text-[15px] font-semibold">Nenhuma aula com esse termo.</p>
            <p className="mt-1 text-[14px] text-graphite">
              Tente o número da aula ou o nome da estação.
            </p>
            <Link
              href="/aulas"
              className="mt-4 inline-block text-[14px] font-semibold text-ember underline underline-offset-4"
            >
              Limpar busca
            </Link>
          </div>
        ) : filtering ? (
          <ul className="border-t border-line">
            {lessons.map((lesson) => (
              <LessonRow key={lesson.id} lesson={lesson} showModule={!bloco} />
            ))}
          </ul>
        ) : (
          modules.map((module) => {
            const moduleLessons = lessons.filter((lesson) => lesson.module?.slug === module.slug);
            if (moduleLessons.length === 0) return null;

            return (
              <section key={module.id} className="mb-8">
                <div className="flex items-baseline justify-between border-b border-ink pb-1.5">
                  <h2 className="rotulo text-[12px]">{module.title}</h2>
                  <span className="tnum text-[13px] text-graphite">
                    {module.completed}/{module.total}
                  </span>
                </div>
                <ul>
                  {moduleLessons.map((lesson) => (
                    <LessonRow key={lesson.id} lesson={lesson} />
                  ))}
                </ul>
              </section>
            );
          })
        )}
      </section>
    </main>
  );
}

function FilterChip({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`shrink-0 whitespace-nowrap border px-3.5 py-1.5 text-[13px] font-semibold ${
        active ? "border-ember bg-ember text-paper" : "border-line bg-paper-alt text-graphite"
      }`}
    >
      {label}
    </Link>
  );
}
