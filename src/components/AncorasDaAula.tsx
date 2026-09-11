"use client";

import { useEffect, useRef, useState } from "react";

export type Ancora = { id: string; rotulo: string };

/** Onde a barra grudada acaba: é a partir daqui que se está a ler. */
const LINHA_DE_LEITURA = 72;

/**
 * A aula passa dos dois mil pixels e é lida de pé, no meio da sessão. A barra
 * gruda no topo para saltar entre os blocos, e marca em qual deles você está —
 * sem isso ela serviria para ir, mas não para saber onde se está.
 */
export function AncorasDaAula({ ancoras }: { ancoras: Ancora[] }) {
  const [ativa, setAtiva] = useState<string | null>(null);
  const barra = useRef<HTMLUListElement>(null);
  // Enquanto o salto está a acontecer, quem manda é o clique, não a rolagem.
  const travadoAte = useRef(0);

  useEffect(() => {
    let pedido = 0;

    function calcular() {
      pedido = 0;
      if (Date.now() < travadoAte.current) return;

      // No fim da página não há mais rolagem: o último bloco é o que se está a
      // ver, mesmo que o topo dele esteja acima da linha de leitura.
      const fim =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;

      if (fim) {
        setAtiva(ancoras[ancoras.length - 1]?.id ?? null);
        return;
      }

      let atual = ancoras[0]?.id ?? null;
      for (const ancora of ancoras) {
        const secao = document.getElementById(ancora.id);
        if (secao && secao.getBoundingClientRect().top <= LINHA_DE_LEITURA) atual = ancora.id;
      }
      setAtiva(atual);
    }

    function aoRolar() {
      if (pedido === 0) pedido = window.requestAnimationFrame(calcular);
    }

    calcular();
    window.addEventListener("scroll", aoRolar, { passive: true });
    window.addEventListener("resize", aoRolar);
    return () => {
      if (pedido !== 0) window.cancelAnimationFrame(pedido);
      window.removeEventListener("scroll", aoRolar);
      window.removeEventListener("resize", aoRolar);
    };
  }, [ancoras]);

  // A barra rola em separado da página: sem isto, o bloco em que se está pode
  // ficar fora da vista dela justamente quando é o mais útil de ver.
  useEffect(() => {
    const chip = barra.current?.querySelector('[aria-current="true"]');
    chip?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [ativa]);

  return (
    <nav
      aria-label="Blocos da aula"
      className="sticky top-0 z-30 -mx-5 mt-6 border-b border-borda bg-fundo/95 backdrop-blur-sm"
    >
      <ul ref={barra} className="no-scrollbar flex gap-1 overflow-x-auto px-5 py-2">
        {ancoras.map((ancora) => {
          const atual = ativa === ancora.id;

          return (
            <li key={ancora.id} className="shrink-0">
              <a
                href={`#${ancora.id}`}
                onClick={() => {
                  // O salto é suave e demora: sem travar, a rolagem a caminho
                  // marcaria os blocos por que passa e depois o fim da página.
                  travadoAte.current = Date.now() + 900;
                  setAtiva(ancora.id);
                }}
                aria-current={atual ? "true" : undefined}
                className={`rotulo block px-2.5 py-1.5 text-[10px] ${
                  atual ? "bg-texto text-fundo" : "text-texto-fraco"
                }`}
              >
                {ancora.rotulo}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
