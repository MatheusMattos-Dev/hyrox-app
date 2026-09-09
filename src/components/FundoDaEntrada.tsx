import Image from "next/image";

/**
 * Fundo da tela de entrada: a foto do treino sob um véu de tinta. A foto já
 * traz as linhas da pista, então não há desenho por cima — o texto corre de
 * alto a baixo e o que ele precisa é de campo calmo, não de mais uma camada.
 */
export function FundoDaEntrada() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <Image
        src="/entrada-treino.webp"
        alt=""
        fill
        priority
        sizes="(max-width: 512px) 100vw, 512px"
        // O recorte puxa para a esquerda, onde está o atleta no trenó.
        className="object-cover object-[36%_center]"
      />

      {/* Fechado no topo, sob o título; mais fechado ainda no miolo, sob a lista. */}
      <div className="absolute inset-0 bg-gradient-to-b from-ink-2 from-25% via-ink-2/88 via-60% to-ink-2/62" />

      {/* Só o calor da pista chega ao rodapé, atrás do botão. */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/2"
        style={{
          background:
            "radial-gradient(120% 100% at 50% 100%, rgba(255,75,31,0.18) 0%, rgba(255,75,31,0) 70%)",
        }}
      />
    </div>
  );
}
