"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function GoogleSignInButton({ next = "/hoje" }: { next?: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function signIn() {
    setStatus("loading");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    if (error) setStatus("error");
  }

  return (
    <div>
      <button
        type="button"
        onClick={signIn}
        disabled={status === "loading"}
        className="rotulo flex w-full items-center justify-center gap-3 bg-paper px-6 py-4 text-[13px] text-ink transition-opacity disabled:opacity-60"
      >
        <GoogleMark />
        {status === "loading" ? "Abrindo o Google…" : "Entrar com Google"}
      </button>
      {status === "error" ? (
        <p className="mt-3 text-sm text-rope">
          Não deu para abrir o login do Google. Confira as chaves do Supabase e tente de novo.
        </p>
      ) : null}
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.2 17.6 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.9 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.9c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.3-10.1 7.3-17.5z"
      />
      <path
        fill="#FBBC05"
        d="M10.4 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.8-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.8-6.1z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.4 2.3-6.4 0-11.7-3.7-13.6-9.1l-7.8 6.1C6.5 42.6 14.6 48 24 48z"
      />
    </svg>
  );
}
