"use client";

import { useCallback, useSyncExternalStore } from "react";

const OPCOES = [
  { valor: "system", rotulo: "Sistema" },
  { valor: "light", rotulo: "Claro" },
  { valor: "dark", rotulo: "Escuro" },
] as const;

type Tema = (typeof OPCOES)[number]["valor"];

const CHAVE = "mc_tema";
const EVENTO = "mc:tema";

/** O tema vive no localStorage, não no React: aqui só o lemos. */
function assinar(aoMudar: () => void) {
  window.addEventListener(EVENTO, aoMudar);
  window.addEventListener("storage", aoMudar);
  return () => {
    window.removeEventListener(EVENTO, aoMudar);
    window.removeEventListener("storage", aoMudar);
  };
}

function lerCliente(): Tema {
  try {
    const guardado = window.localStorage.getItem(CHAVE);
    return guardado === "dark" || guardado === "light" ? guardado : "system";
  } catch {
    return "system";
  }
}

/** No servidor não há escolha guardada, então o padrão é seguir o sistema. */
function lerServidor(): Tema {
  return "system";
}

/**
 * Segue o sistema por padrão. A escolha manual existe porque quem treina de
 * madrugada costuma ter o telefone em claro e a sala escura.
 */
export function SeletorDeTema() {
  const tema = useSyncExternalStore(assinar, lerCliente, lerServidor);

  const escolher = useCallback((novo: Tema) => {
    try {
      if (novo === "system") {
        window.localStorage.removeItem(CHAVE);
        document.documentElement.removeAttribute("data-theme");
      } else {
        window.localStorage.setItem(CHAVE, novo);
        document.documentElement.setAttribute("data-theme", novo);
      }
    } catch {
      // Navegador com armazenamento bloqueado: o tema vale só para esta visita.
      if (novo === "system") document.documentElement.removeAttribute("data-theme");
      else document.documentElement.setAttribute("data-theme", novo);
    }
    window.dispatchEvent(new Event(EVENTO));
  }, []);

  return (
    <div role="group" aria-labelledby="rotulo-tema">
      <span id="rotulo-tema" className="rotulo block text-[10px] text-texto-fraco">
        Aparência
      </span>
      <div className="mt-1.5 flex gap-2">
        {OPCOES.map((opcao) => (
          <button
            key={opcao.valor}
            type="button"
            onClick={() => escolher(opcao.valor)}
            aria-pressed={tema === opcao.valor}
            className={`rotulo flex-1 border px-3 py-2.5 text-[11px] ${
              tema === opcao.valor
                ? "border-ember bg-ember text-ink"
                : "border-borda bg-superficie text-texto-fraco"
            }`}
          >
            {opcao.rotulo}
          </button>
        ))}
      </div>
    </div>
  );
}
