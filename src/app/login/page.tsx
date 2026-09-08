import { Circuito } from "@/components/Circuito";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { listModuleSummaries } from "@/lib/queries";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; erro?: string }>;
}) {
  const { next, erro } = await searchParams;
  const modules = await listModuleSummaries();
  const totalLessons = modules.reduce((sum, module) => sum + module.total, 0) || 250;

  return (
    <div className="bg-ink-2 text-paper">
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col px-6 pb-10 pt-14">
        <header className="rotulo text-[12px] text-ember">Master Class</header>

        <div className="relative mt-10">
          <Circuito completed={0} total={totalLessons} sobreEscuro />
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="display text-[112px] font-bold">{totalLessons}</span>
            <span className="rotulo mt-2 text-[10px] text-paper/55">aulas · 50 semanas</span>
          </div>
        </div>

        <p className="mt-8 max-w-[30ch] text-[16px] leading-snug text-paper/70">
          O curso completo, aula por aula, no bolso — com a execução de cada movimento a um
          toque.
        </p>

        <ul className="mt-8 flex-1">
          {modules.slice(0, 5).map((module) => (
            <li
              key={module.id}
              className="flex items-baseline justify-between border-b border-line-ink py-2.5 text-[14px]"
            >
              <span>{module.title}</span>
              <span className="tnum text-paper/50">{module.total}</span>
            </li>
          ))}
          {modules.length > 5 ? (
            <li className="tnum py-2.5 text-[14px] text-paper/50">
              + {modules.length - 5} mesociclos
            </li>
          ) : null}
        </ul>

        <div className="mt-10 space-y-4">
          {erro ? (
            <p className="text-sm text-ember">O login não foi concluído. Tente novamente.</p>
          ) : null}

          {isSupabaseConfigured ? (
            <GoogleSignInButton next={next ?? "/hoje"} />
          ) : (
            <form action="/auth/demo" method="post" className="space-y-4">
              <button
                type="submit"
                className="rotulo w-full bg-ember px-6 py-4 text-[13px] text-paper"
              >
                Ver o app com dados de exemplo
              </button>
              <p className="text-[13px] leading-relaxed text-paper/55">
                O login com Google entra em cena assim que as chaves do Supabase estiverem no
                <code className="mx-1 bg-paper/10 px-1 py-0.5 font-mono text-paper">
                  .env.local
                </code>
                . Enquanto isso, o app roda com 250 aulas de exemplo.
              </p>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
