"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  DEMO_LOGS_COOKIE,
  DEMO_LOGS_TETO_BYTES,
  DEMO_PROGRESS_COOKIE,
  readDemoLogs,
} from "@/lib/queries";
import type { LessonLog } from "@/lib/types";

const YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

/** Marca ou desmarca uma aula como concluída para o usuário atual. */
export async function setLessonCompleted(lessonId: string, completed: boolean) {
  const supabase = await createClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;

  if (supabase && user) {
    if (completed) {
      await supabase.from("lesson_progress").upsert(
        {
          user_id: user.id,
          lesson_id: lessonId,
          completed_at: new Date().toISOString(),
          last_seen_at: new Date().toISOString(),
        },
        { onConflict: "user_id,lesson_id" },
      );
    } else {
      await supabase
        .from("lesson_progress")
        .update({ completed_at: null, last_seen_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId);
    }
  } else {
    const store = await cookies();
    const current = new Set((store.get(DEMO_PROGRESS_COOKIE)?.value ?? "").split(",").filter(Boolean));

    if (completed) {
      current.add(lessonId);
    } else {
      current.delete(lessonId);
    }

    store.set(DEMO_PROGRESS_COOKIE, [...current].join(","), {
      maxAge: YEAR_IN_SECONDS,
      path: "/",
      sameSite: "lax",
    });
  }

  revalidatePath("/", "layout");
}

export type RegistoEnviado = {
  performed_on: string;
  level: "n1" | "n2" | "n3" | null;
  rpe: number | null;
  fields: Record<string, string>;
  notes: string | null;
};

/**
 * Grava o registo do treino. Registar é dizer que deu a aula, então também
 * marca a aula como concluída — sem obrigar o aluno a tocar em dois botões.
 */
export async function saveLessonLog(
  lessonId: string,
  registo: RegistoEnviado,
): Promise<{ ok: true } | { ok: false; erro: string }> {
  const supabase = await createClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;

  if (supabase && user) {
    const { error } = await supabase.from("lesson_logs").upsert(
      {
        user_id: user.id,
        lesson_id: lessonId,
        performed_on: registo.performed_on,
        level: registo.level,
        rpe: registo.rpe,
        fields: registo.fields,
        notes: registo.notes,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,lesson_id" },
    );

    // Sem isto o aluno acha que guardou e perde o que anotou.
    if (error) return { ok: false, erro: error.message };
  } else {
    const guardados = await readDemoLogs();
    guardados[lessonId] = { lesson_id: lessonId, ...registo };
    await gravarRegistosDemo(Object.values(guardados));
  }

  await setLessonCompleted(lessonId, true);
  return { ok: true };
}

/** Apaga o registo de uma aula. Não desmarca a aula: concluída ela continua. */
export async function deleteLessonLog(lessonId: string) {
  const supabase = await createClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;

  if (supabase && user) {
    await supabase
      .from("lesson_logs")
      .delete()
      .eq("user_id", user.id)
      .eq("lesson_id", lessonId);
  } else {
    const guardados = await readDemoLogs();
    delete guardados[lessonId];
    await gravarRegistosDemo(Object.values(guardados));
  }

  revalidatePath("/", "layout");
}

async function gravarRegistosDemo(registos: LessonLog[]) {
  const store = await cookies();

  // Do mais recente para o mais antigo, e larga o fim até caber no cookie.
  const recentes = [...registos].sort((a, b) => b.performed_on.localeCompare(a.performed_on));
  let valor = JSON.stringify(mapear(recentes));

  while (recentes.length > 1 && valor.length > DEMO_LOGS_TETO_BYTES) {
    recentes.pop();
    valor = JSON.stringify(mapear(recentes));
  }

  store.set(DEMO_LOGS_COOKIE, valor, {
    maxAge: YEAR_IN_SECONDS,
    path: "/",
    sameSite: "lax",
  });
}

function mapear(registos: LessonLog[]) {
  return Object.fromEntries(registos.map((registo) => [registo.lesson_id, registo]));
}
