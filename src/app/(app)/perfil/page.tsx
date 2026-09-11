import { LogList } from "@/components/LogList";
import { SeletorDeTema } from "@/components/SeletorDeTema";
import { MapaDoAno } from "@/components/MapaDoAno";
import { ProgressRule } from "@/components/ProgressRule";
import {
  getProgress,
  getViewer,
  listLessons,
  listModuleSummaries,
  listRecentLogs,
} from "@/lib/queries";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function ProfilePage() {
  const [viewer, progress, modules, lessons, logs] = await Promise.all([
    getViewer(),
    getProgress(),
    listModuleSummaries(),
    listLessons(),
    listRecentLogs(),
  ]);

  return (
    <main className="px-5 pt-10 pb-12">
      <h1 className="display text-[38px] uppercase">Perfil</h1>

      <section className="mt-6 flex items-center gap-4">
        {viewer?.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={viewer.avatarUrl} alt="" className="h-14 w-14 rounded-full object-cover" />
        ) : (
          <span className="display flex h-14 w-14 items-center justify-center rounded-full bg-texto text-[24px] text-fundo">
            {(viewer?.name ?? "A").charAt(0)}
          </span>
        )}
        <div className="min-w-0">
          <p className="text-[17px] font-bold">{viewer?.name ?? "Atleta"}</p>
          <p className="truncate text-[14px] text-texto-fraco">
            {viewer?.email ?? (viewer?.isDemo ? "Sessão de demonstração" : "")}
          </p>
        </div>
      </section>

      <section className="mt-8">
        <p className="flex items-baseline gap-2">
          <span className="display text-[64px] font-bold">
            {progress.completed}
          </span>
          <span className="text-[15px] text-texto-fraco">de {progress.total} aulas concluídas</span>
        </p>
        <div className="mt-3">
          <ProgressRule completed={progress.completed} total={progress.total} />
        </div>
      </section>

      {lessons.length > 0 ? (
        <section className="mt-9">
          <h2 className="rotulo border-b border-texto pb-1.5 text-[12px]">O ano inteiro</h2>
          <div className="mt-4">
            <MapaDoAno lessons={lessons} />
          </div>
          <p className="mt-3 text-[13px] leading-snug text-texto-fraco">
            Uma linha por mesociclo, uma marca por aula. As cinco últimas de cada linha são a
            semana de descarga.
          </p>
        </section>
      ) : null}

      <section className="mt-9">
        <div className="flex items-baseline justify-between border-b border-texto pb-1.5">
          <h2 className="rotulo text-[12px]">Caderno de treino</h2>
          {logs.length > 0 ? (
            <span className="tnum text-[13px] text-texto-fraco">
              {logs.length} {logs.length === 1 ? "registo" : "registos"}
            </span>
          ) : null}
        </div>
        {logs.length > 0 ? (
          <LogList entries={logs} />
        ) : (
          <p className="mt-4 text-[14px] leading-relaxed text-texto-fraco">
            Ainda sem registos. No fim de cada aula há um formulário com o que aquela sessão
            pede para anotar — carga, ritmo, tempo — e o que você escrever aparece aqui.
          </p>
        )}
      </section>

      <section className="mt-9">
        <h2 className="rotulo border-b border-texto pb-1.5 text-[12px]">Por bloco</h2>
        <ul className="mt-4">
          {modules.map((module) => (
            <li key={module.id} className="mb-4">
              <div className="flex items-baseline justify-between">
                <span className="text-[15px] font-semibold">{module.title}</span>
                <span className="tnum text-[13px] text-texto-fraco">
                  {module.completed}/{module.total}
                </span>
              </div>
              <div className="mt-2">
                <ProgressRule completed={module.completed} total={module.total} />
              </div>
            </li>
          ))}
        </ul>
      </section>

      {viewer?.isDemo ? (
        <p className="mt-8 border border-borda bg-superficie p-4 text-[14px] leading-relaxed text-texto-fraco">
          Você está na sessão de demonstração. O progresso fica só neste navegador.
          {isSupabaseConfigured
            ? " Saia e entre com o Google para salvar na sua conta."
            : " Configure o Supabase para ligar o login com Google e salvar o progresso."}
        </p>
      ) : null}

      <section className="mt-9">
        <h2 className="rotulo border-b border-texto pb-1.5 text-[12px]">Preferências</h2>
        <div className="mt-4">
          <SeletorDeTema />
        </div>
      </section>

      <form action="/auth/signout" method="post" className="mt-8">
        <button
          type="submit"
          className="rotulo w-full border border-borda px-5 py-4 text-[13px] text-texto-fraco"
        >
          Sair da conta
        </button>
      </form>
    </main>
  );
}
