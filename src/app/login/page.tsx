import { FundoDaEntrada } from "@/components/FundoDaEntrada";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * A entrada é a única tela que um visitante não autenticado vê, e o RLS não lhe
 * mostra nada do curso. Então nada aqui vem do banco: o que ela conta é a forma
 * do programa, que é fixa — cinco dias, cinquenta semanas, dez mesociclos.
 */
const SEMANA = [
  { dia: "Seg", sessao: "Força" },
  { dia: "Ter", sessao: "Aeróbio" },
  { dia: "Qua", sessao: "Estações e trenó" },
  { dia: "Qui", sessao: "Técnica e potência" },
  { dia: "Sex", sessao: "Mista ou teste" },
];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; erro?: string }>;
}) {
  const { next, erro } = await searchParams;

  return (
    <div className="relative min-h-dvh bg-ink-2 text-paper">
      <FundoDaEntrada />
      <main className="relative mx-auto flex min-h-dvh max-w-lg flex-col px-6 pb-8 pt-10">
        <header className="rotulo text-[12px] text-ember">Master Class</header>

        <div className="mt-8">
          <h1 className="display text-[60px] uppercase">
            Motor
            <br />
            humano
            <br />
            híbrido
          </h1>
          <p className="mt-5 flex items-baseline gap-3">
            <span className="display text-[46px] text-ember">250</span>
            <span className="max-w-[18ch] text-[16px] leading-tight text-paper/70">
              aulas prontas a dar, uma por dia útil
            </span>
          </p>
        </div>

        <section className="mt-8">
          <h2 className="rotulo border-b border-line-ink pb-1.5 text-[11px] text-paper/50">
            A semana-tipo
          </h2>
          <ul>
            {SEMANA.map((linha) => (
              <li
                key={linha.dia}
                className="flex items-baseline gap-4 border-b border-line-ink py-2"
              >
                <span className="rotulo w-10 shrink-0 text-[11px] text-ember">{linha.dia}</span>
                <span className="text-[15px]">{linha.sessao}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[13px] leading-snug text-paper/65">
            Cinquenta semanas, dez mesociclos. A estrutura repete-se; o que muda é a carga, e a
            quinta semana de cada mesociclo é de descarga.
          </p>
        </section>

        <div className="mt-auto pt-8">
          {erro ? (
            <p className="mb-4 text-sm text-ember">O login não foi concluído. Tente novamente.</p>
          ) : null}

          {isSupabaseConfigured ? (
            <>
              <GoogleSignInButton next={next ?? "/hoje"} />
              <p className="mt-3 text-center text-[13px] text-paper/65">
                Qualquer conta Google entra.
              </p>
            </>
          ) : (
            <form action="/auth/demo" method="post">
              <button
                type="submit"
                className="rotulo w-full bg-ember px-6 py-4 text-[13px] text-ink"
              >
                Ver o app com dados de exemplo
              </button>
              <p className="mt-3 text-[13px] leading-relaxed text-paper/55">
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
