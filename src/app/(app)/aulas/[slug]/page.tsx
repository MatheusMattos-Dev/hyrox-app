import Link from "next/link";
import { notFound } from "next/navigation";
import { AncorasDaAula, type Ancora } from "@/components/AncorasDaAula";
import { BlocoPrincipal } from "@/components/BlocoPrincipal";
import { CompleteButton } from "@/components/CompleteButton";
import { LessonMedia } from "@/components/LessonMedia";
import { LogForm } from "@/components/LogForm";
import { UltimoRegisto } from "@/components/UltimoRegisto";
import { MovementMedia } from "@/components/MovementTile";
import { RailDeMovimentos } from "@/components/RailDeMovimentos";
import { capitalizar, capitalizarTitulo } from "@/lib/format";
import { getLessonBySlug } from "@/lib/queries";
import { explicarVia } from "@/lib/vias";
import { vincularMovimentos } from "@/lib/vincular-movimentos";
import type { LessonDetail } from "@/lib/types";

/** Os minutos de cada bloco. Ficam aqui para o resumo e os blocos concordarem. */
const MINUTOS = { aquecimento: 10, tecnico: 8, principal: 32, arrefecimento: 10 };

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = await getLessonBySlug(slug);

  if (!lesson) notFound();

  const movement = lesson.movements[0] ?? null;
  const numero = String(lesson.number).padStart(3, "0");

  const ancoras: Ancora[] = [
    lesson.warmup?.length ? { id: "aquecimento", rotulo: "Aquecimento" } : null,
    movement || lesson.technique_cue ? { id: "tecnico", rotulo: "Técnico" } : null,
    lesson.main_block ? { id: "principal", rotulo: "Principal" } : null,
    lesson.levels ? { id: "niveis", rotulo: "Níveis" } : null,
    lesson.cooldown ? { id: "arrefecimento", rotulo: "Arrefecimento" } : null,
    { id: "registo", rotulo: "Registo" },
  ].filter((ancora): ancora is Ancora => ancora !== null);

  return (
    <main className="px-5 pt-10 pb-12">
      <Link href="/aulas" className="text-[14px] font-semibold text-texto-fraco">
        Voltar para as aulas
      </Link>

      <header className="mt-5">
        <p className="tnum rotulo text-[10px] text-texto-fraco">
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

        {lesson.session_type ? (
          <Link
            href={`/aulas?tipo=${encodeURIComponent(lesson.session_type)}`}
            className="mt-4 inline-block border border-borda bg-superficie px-2.5 py-1 text-[12px] font-semibold text-texto-fraco underline underline-offset-4"
          >
            {capitalizar(lesson.session_type)}
          </Link>
        ) : null}
      </header>

      {lesson.deload ? (
        <p className="mt-5 border-l-2 border-rope bg-superficie px-4 py-3 text-[14px] leading-snug">
          <strong className="font-bold">Semana de descarga.</strong> Reduza o volume desta sessão
          para cerca de 45%: menos séries, menos distância, carga mais leve. A técnica fica
          integral — o que baixa é o volume.
        </p>
      ) : null}

      <dl className="mt-5 border-t border-borda text-[14px]">
        {lesson.stimulus ? (
          <Ficha rotulo="O que treina">{capitalizar(lesson.stimulus)}</Ficha>
        ) : null}
        {lesson.pathway ? (
          <Ficha rotulo="Via">
            {capitalizar(lesson.pathway)}
            {explicarVia(lesson.pathway) ? (
              <span className="mt-0.5 block text-[13px] leading-snug text-texto-fraco">
                {explicarVia(lesson.pathway)}
              </span>
            ) : null}
          </Ficha>
        ) : null}
        {lesson.duration_min ? (
          <Ficha rotulo="Duração">
            <span className="tnum">{lesson.duration_min} min</span>
            <span className="tnum text-texto-fraco">
              {` · ${MINUTOS.aquecimento} + ${MINUTOS.tecnico} + ${MINUTOS.principal} + ${MINUTOS.arrefecimento}`}
            </span>
          </Ficha>
        ) : null}
        {lesson.equipment ? <Ficha rotulo="Equipamento">{lesson.equipment}</Ficha> : null}
        {lesson.space ? <Ficha rotulo="Espaço">{lesson.space}</Ficha> : null}
      </dl>

      {lesson.media_url ? (
        <div className="mt-6">
          <LessonMedia lesson={lesson} />
        </div>
      ) : null}

      <AncorasDaAula ancoras={ancoras} />

      {lesson.warmup?.length ? (
        <Bloco id="aquecimento" titulo="Aquecimento" minutos={MINUTOS.aquecimento}>
          <ul>
            {lesson.warmup.map((item) => (
              <li
                key={item}
                className="border-b border-borda py-2.5 text-[15px] leading-snug last:border-0"
              >
                {item}
              </li>
            ))}
          </ul>

          {lesson.warmupMovements.length > 0 ? (
            <div className="mt-4">
              <RailDeMovimentos movements={lesson.warmupMovements} />
            </div>
          ) : null}
        </Bloco>
      ) : null}

      {movement || lesson.technique_cue ? (
        <Bloco id="tecnico" titulo="Bloco técnico" minutos={MINUTOS.tecnico}>
          {movement ? (
            <Link href={`/movimentos/${movement.slug}`} className="flex items-center gap-4">
              <span className="w-[112px] shrink-0">
                <MovementMedia movement={movement} />
              </span>
              <span className="min-w-0">
                <span className="block text-[16px] font-bold leading-tight">{movement.name}</span>
                {lesson.technique_cue ? (
                  <span className="mt-1 block text-[14px] leading-snug text-texto-fraco">
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
            <p className="mt-3 text-[13px] text-texto-fraco">
              Manual técnico: ficha {lesson.technique_sheet}, capítulo 06.
            </p>
          ) : null}
        </Bloco>
      ) : null}

      {lesson.main_block ? (
        <Bloco id="principal" titulo="Bloco principal" minutos={MINUTOS.principal} destaque>
          <BlocoPrincipal texto={lesson.main_block} />
        </Bloco>
      ) : null}

      {lesson.levels ? <Niveis lesson={lesson} /> : null}

      {lesson.cooldown ? (
        <Bloco id="arrefecimento" titulo="Arrefecimento" minutos={MINUTOS.arrefecimento}>
          <p className="text-[15px] leading-snug">{lesson.cooldown}</p>
        </Bloco>
      ) : null}

      <section className="mt-9 space-y-4">
        {lesson.coaching ? <Nota titulo="Coaching" texto={lesson.coaching} /> : null}
        {lesson.watch_error ? (
          <Nota titulo="Erro a vigiar" texto={lesson.watch_error} alerta />
        ) : null}
      </section>

      <div id="registo" className="mt-9 scroll-mt-16">
        {lesson.previousLog ? (
          <div className="mb-4">
            <UltimoRegisto entry={lesson.previousLog} />
          </div>
        ) : null}
        <LogForm lesson={lesson} />
      </div>

      <div className="mt-4">
        <CompleteButton lessonId={lesson.id} completed={lesson.completed} />
      </div>

      {lesson.tag ? (
        <p className="rotulo mt-8 text-[10px] text-texto-fraco">Fonte · {lesson.tag}</p>
      ) : null}

      <nav className="mt-8 flex gap-3 border-t border-borda pt-4">
        {lesson.previous ? (
          <Link href={`/aulas/${lesson.previous.slug}`} className="flex-1">
            <span className="tnum rotulo block text-[10px] text-texto-fraco">
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
            <span className="tnum rotulo block text-[10px] text-texto-fraco">
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

/** Uma linha da ficha da sessão: rótulo à esquerda, conteúdo à direita. */
function Ficha({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 border-b border-borda py-2.5">
      <dt className="w-[104px] shrink-0 font-semibold">{rotulo}</dt>
      <dd className="min-w-0 flex-1">{children}</dd>
    </div>
  );
}

function Bloco({
  id,
  titulo,
  minutos,
  destaque = false,
  children,
}: {
  id: string;
  titulo: string;
  minutos: number;
  destaque?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-8 scroll-mt-16">
      <div className="flex items-baseline justify-between border-b border-texto pb-1.5">
        <h2 className="rotulo text-[12px]">{titulo}</h2>
        <span className="tnum text-[13px] text-texto-fraco">{minutos} min</span>
      </div>
      <div className={destaque ? "mt-3 border border-borda bg-superficie p-4" : "mt-3"}>{children}</div>
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
    <section id="niveis" className="mt-8 scroll-mt-16">
      <div className="flex items-baseline justify-between border-b border-texto pb-1.5">
        <h2 className="rotulo text-[12px]">Os três níveis</h2>
        <span className="text-[13px] text-texto-fraco">mesmo estímulo, três escalas</span>
      </div>

      <ul className="mt-3 space-y-3">
        {niveis.map(({ chave, nome, resumo }) => {
          const nivel = lesson.levels![chave];
          const referencia = chave === "n2";

          return (
            <li
              key={chave}
              className={`p-4 ${referencia ? "border-2 border-texto" : "border border-borda"}`}
            >
              <div>
                <span className="block text-[15px] font-bold">
                  {nome}
                </span>
                <span className="mt-0.5 block text-[12px] leading-tight text-texto-fraco">{resumo}</span>
              </div>
              <dl className="mt-3 text-[14px]">
                <Campo
                  rotulo="Carga / distância"
                  valor={vincularMovimentos(nivel.carga, lesson.linkableMovements)}
                />
                <Campo
                  rotulo="Repetições"
                  valor={vincularMovimentos(nivel.repeticoes, lesson.linkableMovements)}
                />
                <Campo
                  rotulo="Alteração"
                  valor={vincularMovimentos(nivel.alteracao, lesson.linkableMovements)}
                  ultimo
                />
              </dl>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Campo({
  rotulo,
  valor,
  ultimo = false,
}: {
  rotulo: string;
  valor: React.ReactNode;
  ultimo?: boolean;
}) {
  return (
    <div className={`flex gap-3 py-1.5 ${ultimo ? "" : "border-b border-borda"}`}>
      <dt className="w-[104px] shrink-0 text-[13px] text-texto-fraco">{rotulo}</dt>
      <dd className="min-w-0 flex-1 leading-snug">{valor}</dd>
    </div>
  );
}

function Nota({ titulo, texto, alerta = false }: { titulo: string; texto: string; alerta?: boolean }) {
  return (
    <div className={`border-l-2 pl-4 ${alerta ? "border-rope" : "border-borda"}`}>
      <p className="rotulo text-[11px]">{titulo}</p>
      <p className="prose-coach mt-1">{texto}</p>
    </div>
  );
}
