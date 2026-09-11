import Link from "next/link";
import { capitalizar, capitalizarTitulo } from "@/lib/format";
import { resumoDoRegisto } from "@/lib/log-fields";
import type { LogEntry } from "@/lib/types";

/**
 * O caderno de treino, da sessão mais recente para trás. Cada registo é lido
 * como um painel: o rótulo pequeno em cima, o número grande embaixo — que é o
 * que a pessoa procura quando volta para comparar com a semana passada.
 */
export function LogList({ entries }: { entries: LogEntry[] }) {
  return (
    <ul>
      {entries.map((entry) => {
        const marcados = resumoDoRegisto(entry, entry.lesson);

        return (
          <li key={entry.lesson_id} className="border-b border-line py-5 last:border-0">
            <Link href={`/aulas/${entry.lesson.slug}`} className="block">
              <span className="rotulo flex items-baseline justify-between text-[10px] text-graphite">
                <span>
                  {entry.lesson.session_type ? capitalizar(entry.lesson.session_type) : "Aula"}
                  {" · "}
                  <span className="tnum">{String(entry.lesson.number).padStart(3, "0")}</span>
                </span>
                <span className="tnum">{formatarData(entry.performed_on)}</span>
              </span>
              <span className="mt-1 block text-[16px] font-semibold leading-snug">
                {capitalizarTitulo(entry.lesson.title)}
              </span>
            </Link>

            {marcados.length > 0 ? (
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
                {marcados.map((campo) => (
                  <div
                    key={campo.chave}
                    className={campo.valor.length > 14 ? "col-span-2" : ""}
                  >
                    <dt className="rotulo text-[9px] text-graphite">{campo.rotulo}</dt>
                    <dd className="tnum mt-0.5 text-[17px] leading-tight">
                      {campo.valor}
                      {campo.unidade ? (
                        <span className="ml-1 text-[12px] text-graphite">{campo.unidade}</span>
                      ) : null}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}

            {entry.notes ? (
              <p className="prose-coach mt-4 border-l-2 border-line pl-3 text-[15px]">
                {entry.notes}
              </p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function formatarData(iso: string) {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano.slice(2)}`;
}
