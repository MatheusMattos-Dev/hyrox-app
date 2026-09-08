import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DEMO_COOKIE } from "@/lib/supabase/config";

export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase?.auth.signOut();

  const response = NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  response.cookies.delete(DEMO_COOKIE);
  return response;
}
