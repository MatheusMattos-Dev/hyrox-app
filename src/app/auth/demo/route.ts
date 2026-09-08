import { NextResponse } from "next/server";
import { DEMO_COOKIE } from "@/lib/supabase/config";

/** Entrada de demonstração: permite navegar pelo app antes do Supabase estar ligado. */
export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/hoje", request.url), { status: 303 });
  response.cookies.set(DEMO_COOKIE, "1", {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
  });
  return response;
}
