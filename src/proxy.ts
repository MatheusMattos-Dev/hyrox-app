import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { DEMO_COOKIE, isSupabaseConfigured } from "@/lib/supabase/config";

const PUBLIC_PATHS = ["/login", "/auth"];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { response, userId } = await updateSession(request);

  const isPublic = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
  const isDemo = request.cookies.get(DEMO_COOKIE)?.value === "1";
  const signedIn = Boolean(userId) || isDemo;

  if (!signedIn && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (signedIn && pathname === "/login" && (isSupabaseConfigured ? Boolean(userId) : isDemo)) {
    const url = request.nextUrl.clone();
    url.pathname = "/hoje";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp|mp4)$).*)"],
};
