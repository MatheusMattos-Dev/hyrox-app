import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Retorno do login com Google: troca o code pela sessão e leva o aluno para o curso. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/hoje";
  const supabase = await createClient();

  if (code && supabase) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next.startsWith("/") ? next : "/hoje"}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?erro=login`);
}
