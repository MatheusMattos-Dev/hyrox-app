import Link from "next/link";
import { capitalizar } from "@/lib/format";
import { resumoDoRegisto } from "@/lib/log-fields";
import type { LogEntry } from "@/lib/types";

/**
 * O que o aluno fez na última sessão deste mesmo tipo. Fica acima do
 * formulário porque é com este número que ele decide a carga de hoje.
 */
export function UltimoRegisto({ entry }: { entry: LogEntry }) {
  const linhas = resumoDoRegisto(entry, entry.lesson);
  if (linhas.length === 0 && !entry.notes) return null;

  return (
    <section className="border-l-2 border-texto bg-superficie py-3 pl-4 pr-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="rotulo text-[10px] text-texto-fraco">
          Da última vez
          {entry.lesson.session_type ? ` · ${capitalizar(entry.lesson.session_type)}` : ""}
        </h2>
        <Link
          href={`/aulas/${entry.lesson.slug}`}
          className="tnum shrink-0 text-[12px] text-texto-fraco underline underline-offset-4"
        >
          {String(entry.lesson.number).padStart(3, "0")} · {formatarData(entry.performed_on)}
        </Link>
      </div>

      {linhas.length > 0 ? (
        <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
          {linhas.map((linha) => (
            <div key={linha.chave} className={linha.valor.length > 14 ? "col-span-2" : ""}>
              <dt className="rotulo text-[9px] text-texto-fraco">{linha.rotulo}</dt>
              <dd className="tnum mt-0.5 text-[16px] leading-tight">
                {linha.valor}
                {linha.unidade ? (
                  <span className="ml-1 text-[12px] text-texto-fraco">{linha.unidade}</span>
                ) : null}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      {entry.notes ? (
        <p className="prose-coach mt-3 text-[15px]">{entry.notes}</p>
      ) : null}
    </section>
  );
}

function formatarData(iso: string) {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano.slice(2)}`;
}
