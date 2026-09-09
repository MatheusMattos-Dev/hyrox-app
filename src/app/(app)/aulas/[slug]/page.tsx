import Link from "next/link";
import { notFound } from "next/navigation";
import { CompleteButton } from "@/components/CompleteButton";
import { LessonMedia } from "@/components/LessonMedia";
import { LogForm } from "@/components/LogForm";
import { MovementMedia } from "@/components/MovementTile";
import { capitalizar, capitalizarTitulo } from "@/lib/format";
import { getLessonBySlug } from "@/lib/queries";
import type { LessonDetail } from "@/lib/types";

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = await getLessonBySlug(slug);

  if (!lesson) notFound();

  const movement = lesson.movements[0] ?? null;
  const numero = String(lesson.number).padStart(3, "0");

  return (
    <main className="px-5 pt-10 pb-12">
      <Link href="/aulas" className="text-[14px] font-semibold text-graphite">
        Voltar para as aulas
      </Link>

      <header className="mt-5">
        <p className="tnum rotulo text-[10px] text-graphite">
          {lesson.week ? `Semana ${String(lesson.week).padStart(2, "0")}` : null}
          {lesson.mesocycle ? ` · Mesociclo ${String(lesson.mesocycle).padStart(2, "0")}` : null}
          {lesson.weekday ? ` · ${capitalizar(lesson.weekday)}` : null}
        </p>

        <div className="mt-3 flex items-start gap-4">
          <span className="tnum shrink-0 bg-ember px-2.5 py-1 text-[14px] font-semibold text-ink">
            {numero}
          </span>
          <h1 className="display text-[40px] uppercase">
            {capitalizarTitulo(lesson.title)}
          </h1>
        </div>

        <ul className="mt-4 flex flex-wrap gap-1.5">
          {[lesson.session_type, lesson.stimulus, lesson.pathway, lesson.tag]
            .filter(Boolean)
            .map((chip) => (
              <li
                key={chip}
                className="border border-line bg-paper-alt px-2.5 py-1 text-[12px] font-semibold text-graphite"
              >
                {chip === lesson.tag ? chip : capitalizar(String(chip))}
              </li>
            ))}
        </ul>
      </header>

      {lesson.deload ? (
        <p className="mt-5 border-l-2 border-rope bg-paper-alt px-4 py-3 text-[14px] leading-snug">
          <strong className="font-bold">Semana de descarga.</strong> Reduza o volume desta sessão
          para cerca de 45%: menos séries, menos distância, carga mais leve. A técnica fica
          integral — o que baixa é o volume.
        </p>
      ) : null}

      {lesson.equipment || lesson.space ? (
        <dl className="mt-5 border-t border-line text-[14px]">
          {lesson.equipment ? (
            <div className="flex gap-4 border-b border-line py-2.5">
              <dt className="w-24 shrink-0 font-semibold">Equipamento</dt>
              <dd className="text-graphite">{lesson.equipment}</dd>
            </div>
          ) : null}
          {lesson.space ? (
            <div className="flex gap-4 border-b border-line py-2.5">
              <dt className="w-24 shrink-0 font-semibold">Espaço</dt>
              <dd className="text-graphite">{lesson.space}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      {lesson.media_url ? (
        <div className="mt-6">
          <LessonMedia lesson={lesson} />
        </div>
      ) : null}

      {lesson.warmup?.length ? (
        <Bloco titulo="Aquecimento" minutos={10}>
          <ul>
            {lesson.warmup.map((item) => (
              <li
                key={item}
                className="border-b border-line py-2.5 text-[15px] leading-snug last:border-0"
              >
                {item}
              </li>
            ))}
          </ul>
        </Bloco>
      ) : null}

      {movement || lesson.technique_cue ? (
        <Bloco titulo="Bloco técnico" minutos={8}>
          {movement ? (
            <Link href={`/movimentos/${movement.slug}`} className="flex items-center gap-4">
              <span className="w-[84px] shrink-0">
                <MovementMedia movement={movement} className="aspect-square" />
              </span>
              <span className="min-w-0">
                <span className="block text-[16px] font-bold leading-tight">{movement.name}</span>
                {lesson.technique_cue ? (
                  <span className="mt-1 block text-[14px] leading-snug text-graphite">
                    {lesson.technique_cue}
                  </span>
                ) : null}
                <span className="mt-2 block text-[13px] font-semibold underline underline-offset-4">
                  Ver execução
                </span>
              </span>
            </Link>
          ) : (
            <p className="text-[15px] leading-snug">{lesson.technique_cue}</p>
          )}
          {lesson.technique_sheet ? (
            <p className="mt-3 text-[13px] text-graphite">
              Manual técnico: ficha {lesson.technique_sheet}, capítulo 06.
            </p>
          ) : null}
        </Bloco>
      ) : null}

      {lesson.main_block ? (
        <Bloco titulo="Bloco principal" minutos={32} destaque>
          <p className="whitespace-pre-line text-[15px] leading-relaxed">{lesson.main_block}</p>
        </Bloco>
      ) : null}

      {lesson.levels ? <Niveis lesson={lesson} /> : null}

      {lesson.cooldown ? (
        <Bloco titulo="Arrefecimento" minutos={10}>
          <p className="text-[15px] leading-snug">{lesson.cooldown}</p>
        </Bloco>
      ) : null}

      <section className="mt-9 space-y-4">
        {lesson.coaching ? <Nota titulo="Coaching" texto={lesson.coaching} /> : null}
        {lesson.watch_error ? (
          <Nota titulo="Erro a vigiar" texto={lesson.watch_error} alerta />
        ) : null}
      </section>

      <div className="mt-9">
        <LogForm lesson={lesson} />
      </div>

      <div className="mt-4">
        <CompleteButton lessonId={lesson.id} completed={lesson.completed} />
      </div>

      <nav className="mt-8 flex gap-3 border-t border-line pt-4">
        {lesson.previous ? (
          <Link href={`/aulas/${lesson.previous.slug}`} className="flex-1">
            <span className="tnum rotulo block text-[10px] text-graphite">
              Aula {String(lesson.previous.number).padStart(3, "0")}
            </span>
            <span className="mt-1 block text-[14px] font-semibold leading-tight">
              {capitalizarTitulo(lesson.previous.title)}
            </span>
          </Link>
        ) : (
          <span className="flex-1" />
        )}

        {lesson.next ? (
          <Link href={`/aulas/${lesson.next.slug}`} className="flex-1 text-right">
            <span className="tnum rotulo block text-[10px] text-graphite">
              Aula {String(lesson.next.number).padStart(3, "0")}
            </span>
            <span className="mt-1 block text-[14px] font-semibold leading-tight">
              {capitalizarTitulo(lesson.next.title)}
            </span>
          </Link>
        ) : null}
      </nav>
    </main>
  );
}

function Bloco({
  titulo,
  minutos,
  destaque = false,
  children,
}: {
  titulo: string;
  minutos: number;
  destaque?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <div className="flex items-baseline justify-between border-b border-ink pb-1.5">
        <h2 className="rotulo text-[12px]">{titulo}</h2>
        <span className="tnum text-[13px] text-graphite">{minutos} min</span>
      </div>
      <div className={destaque ? "mt-3 border border-line bg-paper-alt p-4" : "mt-3"}>{children}</div>
    </section>
  );
}

function Niveis({ lesson }: { lesson: LessonDetail }) {
  const niveis = [
    { chave: "n1", nome: "N1 Base", resumo: "Ainda a construir o padrão sob fadiga" },
    { chave: "n2", nome: "N2 Padrão", resumo: "A prescrição de referência" },
    { chave: "n3", nome: "N3 Avançado", resumo: "Mantém a mecânica com fadiga elevada" },
  ] as const;

  return (
    <section className="mt-8">
      <div className="flex items-baseline justify-between border-b border-ink pb-1.5">
        <h2 className="rotulo text-[12px]">Os três níveis</h2>
        <span className="text-[13px] text-graphite">mesmo estímulo, três escalas</span>
      </div>

      <ul className="mt-3 space-y-3">
        {niveis.map(({ chave, nome, resumo }) => {
          const nivel = lesson.levels![chave];
          const referencia = chave === "n2";

          return (
            <li
              key={chave}
              className={`p-4 ${referencia ? "border-2 border-ink" : "border border-line"}`}
            >
              <div>
                <span className="block text-[15px] font-bold">
                  {nome}
                </span>
                <span className="mt-0.5 block text-[12px] leading-tight text-graphite">{resumo}</span>
              </div>
              <dl className="mt-3 text-[14px]">
                <Campo rotulo="Carga / distância" valor={nivel.carga} />
                <Campo rotulo="Repetições" valor={nivel.repeticoes} />
                <Campo rotulo="Alteração" valor={nivel.alteracao} ultimo />
              </dl>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Campo({ rotulo, valor, ultimo = false }: { rotulo: string; valor: string; ultimo?: boolean }) {
  return (
    <div className={`flex gap-3 py-1.5 ${ultimo ? "" : "border-b border-line"}`}>
      <dt className="w-[104px] shrink-0 text-[13px] text-graphite">{rotulo}</dt>
      <dd className="min-w-0 flex-1 leading-snug">{valor}</dd>
    </div>
  );
}

function Nota({ titulo, texto, alerta = false }: { titulo: string; texto: string; alerta?: boolean }) {
  return (
    <div className={`border-l-2 pl-4 ${alerta ? "border-rope" : "border-line"}`}>
      <p className="rotulo text-[11px]">{titulo}</p>
      <p className="prose-coach mt-1">{texto}</p>
    </div>
  );
}
