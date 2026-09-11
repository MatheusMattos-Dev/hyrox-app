"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/hoje", label: "Hoje", icon: TodayIcon },
  { href: "/aulas", label: "Aulas", icon: LessonsIcon },
  { href: "/movimentos", label: "Movimentos", icon: MovementsIcon },
  { href: "/perfil", label: "Perfil", icon: ProfileIcon },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-borda bg-fundo/92 backdrop-blur-md">
      <ul className="mx-auto flex max-w-lg">
        {ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rotulo relative flex flex-col items-center gap-1.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 text-[10px] font-bold ${
                  active ? "text-texto" : "text-texto-fraco"
                }`}
              >
                {/* A aba ativa não depende só da cor: tem traço e ícone preenchido. */}
                {active ? (
                  <span className="absolute inset-x-0 top-0 h-[2px] bg-ember" aria-hidden="true" />
                ) : null}
                <Icon active={active} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

type IconProps = { active: boolean };

function frame(children: React.ReactNode) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      {children}
    </svg>
  );
}

function TodayIcon({ active }: IconProps) {
  return frame(
    <>
      <path d="M4 3v16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M4 4h13l-2.5 3.5L17 11H4z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        fill={active ? "currentColor" : "none"}
      />
    </>,
  );
}

function LessonsIcon({ active }: IconProps) {
  return frame(
    <>
      <rect
        x="3"
        y="4"
        width="16"
        height="3.4"
        rx="0.6"
        stroke="currentColor"
        strokeWidth="1.6"
        fill={active ? "currentColor" : "none"}
      />
      <rect x="3" y="9.3" width="16" height="3.4" rx="0.6" stroke="currentColor" strokeWidth="1.6" />
      <rect x="3" y="14.6" width="16" height="3.4" rx="0.6" stroke="currentColor" strokeWidth="1.6" />
    </>,
  );
}

function MovementsIcon({ active }: IconProps) {
  return frame(
    <>
      <circle
        cx="11"
        cy="11"
        r="7.6"
        stroke="currentColor"
        strokeWidth="1.6"
        fill={active ? "currentColor" : "none"}
      />
      <path
        d="M9.2 8.1 14 11l-4.8 2.9z"
        fill={active ? "var(--fundo)" : "currentColor"}
      />
    </>,
  );
}

function ProfileIcon({ active }: IconProps) {
  return frame(
    <>
      <circle
        cx="11"
        cy="7.6"
        r="3.6"
        stroke="currentColor"
        strokeWidth="1.6"
        fill={active ? "currentColor" : "none"}
      />
      <path
        d="M4.2 18.4c0-3.4 3-6 6.8-6s6.8 2.6 6.8 6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </>,
  );
}
