"use client";

/**
 * Sem isto, uma falha do Supabase entregava ao aluno a tela de erro crua do
 * Next — em inglês e fora do tema. Nesta versão a prop de nova tentativa
 * chama-se `retry`.
 */
export default function Error({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <main className="px-5 pt-10">
      <h1 className="display text-[38px] uppercase">Deu erro</h1>
      <p className="mt-4 max-w-[34ch] text-[16px] leading-snug text-texto-fraco">
        Não foi possível carregar esta tela. Costuma ser a ligação — o seu progresso e os seus
        registos estão guardados.
      </p>

      <button
        type="button"
        onClick={retry}
        className="rotulo mt-6 w-full bg-ember px-5 py-4 text-[12px] text-ink"
      >
        Tentar de novo
      </button>
    </main>
  );
}
