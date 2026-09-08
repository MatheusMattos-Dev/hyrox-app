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
  themeColor: "#ece7de",
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
    >
      <body>{children}</body>
    </html>
  );
}
