import { lerBlocoPrincipal } from "@/lib/bloco-principal";

/**
 * Os 32 minutos da sessão. O livro escreve-os com estrutura — partes "A." e
 * "B.", listas, cabeçalhos como "4 rondas" — e ler isso de pé, no meio do
 * treino, exige que a estrutura esteja à vista em vez de dissolvida no texto.
 */
export function BlocoPrincipal({ texto }: { texto: string }) {
  const pedacos = lerBlocoPrincipal(texto);

  return (
    <div className="space-y-3">
      {pedacos.map((pedaco, indice) => {
        const chave = `${pedaco.tipo}-${indice}`;

        if (pedaco.tipo === "cabecalho") {
          return (
            <p key={chave} className="rotulo pt-1 text-[11px] text-texto-fraco">
              {pedaco.texto}
            </p>
          );
        }

        if (pedaco.tipo === "parte") {
          return (
            <p key={chave} className="flex gap-3">
              <span className="tnum w-5 shrink-0 text-[15px] font-semibold text-texto-fraco">
                {pedaco.marca}
              </span>
              <span className="min-w-0 flex-1 text-[17px] leading-snug">{pedaco.texto}</span>
            </p>
          );
        }

        if (pedaco.tipo === "item") {
          return (
            <p key={chave} className="flex gap-3">
              <span aria-hidden="true" className="w-5 shrink-0 text-center text-texto-fraco">
                ·
              </span>
              <span className="min-w-0 flex-1 text-[17px] leading-snug">{pedaco.texto}</span>
            </p>
          );
        }

        return (
          <p key={chave} className="text-[15px] leading-snug text-texto-fraco">
            {pedaco.texto}
          </p>
        );
      })}
    </div>
  );
}
