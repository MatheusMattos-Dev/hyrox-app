import type { Metadata, Viewport } from "next";
import { Big_Shoulders, IBM_Plex_Mono, IBM_Plex_Sans, IBM_Plex_Serif } from "next/font/google";
import "./globals.css";

// O Google unificou a família: "Big Shoulders Display" hoje é "Big Shoulders".
const bigShoulders = Big_Shoulders({
  variable: "--font-big-shoulders",
  subsets: ["latin"],
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const plexSerif = IBM_Plex_Serif({
  variable: "--font-plex-serif",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Master Class",
  description: "250 aulas de treino, aula por aula, com a biblioteca de movimentos sempre à mão.",
  appleWebApp: {
    capable: true,
    title: "Master Class",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ece7de" },
    { media: "(prefers-color-scheme: dark)", color: "#14120c" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${bigShoulders.variable} ${plexSans.variable} ${plexMono.variable} ${plexSerif.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Aplica a escolha de tema antes da primeira pintura. Sem isto, quem
            escolheu escuro vê um lampejo de papel a cada carregamento. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("mc_tema");if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
