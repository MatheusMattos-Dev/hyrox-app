"use client";

import { useTransition } from "react";
import { setLessonCompleted } from "@/app/actions";

export function CompleteButton({ lessonId, completed }: { lessonId: string; completed: boolean }) {
  const [pending, startTransition] = useTransition();

  function toggle(next: boolean) {
    startTransition(async () => {
      await setLessonCompleted(lessonId, next);
    });
  }

  if (completed) {
    return (
      <div className="flex items-center justify-between gap-4 border border-texto px-5 py-4">
        <span className="rotulo text-[13px] text-texto">Aula concluída</span>
        <button
          type="button"
          onClick={() => toggle(false)}
          disabled={pending}
          className="text-[14px] font-semibold text-texto-fraco underline underline-offset-4 disabled:opacity-50"
        >
          Desfazer
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggle(true)}
      disabled={pending}
      className="rotulo w-full border border-borda px-5 py-4 text-[12px] text-texto-fraco disabled:opacity-60"
    >
      {pending ? "Salvando…" : "Marcar como concluída"}
    </button>
  );
}
