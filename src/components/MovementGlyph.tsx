/**
 * Um desenho por movimento, para a biblioteca não ficar de caixas vazias até os GIFs
 * chegarem — e para continuar a servir de reserva quando um GIF faltar.
 * A gramática é sempre a mesma: o equipamento, mais a direção do esforço.
 */
export function MovementGlyph({ slug, name }: { slug: string; name: string }) {
  const desenho = DESENHOS[slug];

  return (
    <svg
      viewBox="0 0 64 64"
      className="h-full w-full"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label={name}
    >
      {desenho ?? <Iniciais name={name} />}
    </svg>
  );
}

function Iniciais({ name }: { name: string }) {
  const letras = name
    .split(/\s+/)
    .slice(0, 2)
    .map((palavra) => palavra.charAt(0).toUpperCase())
    .join("");

  return (
    <text
      x="32"
      y="41"
      textAnchor="middle"
      fill="currentColor"
      stroke="none"
      fontSize="26"
      fontWeight="800"
    >
      {letras}
    </text>
  );
}

/** Barra com discos, na altura pedida. Os discos são blocos cheios para lerem como discos. */
function Barra(y: number) {
  return (
    <>
      <path d={`M6 ${y} H58`} />
      <rect x="13" y={y - 11} width="6" height="22" fill="currentColor" stroke="none" />
      <rect x="45" y={y - 11} width="6" height="22" fill="currentColor" stroke="none" />
    </>
  );
}

function SetaBaixo(x: number, y1: number, y2: number) {
  return (
    <>
      <path d={`M${x} ${y1} V${y2}`} />
      <path d={`M${x - 5} ${y2 - 6} L${x} ${y2} L${x + 5} ${y2 - 6}`} />
    </>
  );
}

function SetaCima(x: number, y1: number, y2: number) {
  return (
    <>
      <path d={`M${x} ${y1} V${y2}`} />
      <path d={`M${x - 5} ${y2 + 6} L${x} ${y2} L${x + 5} ${y2 + 6}`} />
    </>
  );
}

const DESENHOS: Record<string, React.ReactNode> = {
  agachamento: (
    <>
      {Barra(20)}
      {SetaBaixo(32, 30, 52)}
    </>
  ),

  "levantamento-terra": (
    <>
      {Barra(46)}
      {SetaCima(32, 36, 14)}
    </>
  ),

  "empurrar-vertical": (
    <>
      {Barra(18)}
      {SetaCima(32, 44, 28)}
      <path d="M12 56 H52" />
    </>
  ),

  puxada: (
    <>
      {Barra(16)}
      {SetaBaixo(32, 26, 48)}
    </>
  ),

  unilateral: (
    <>
      <path d="M32 8 V56" strokeDasharray="4 5" />
      <path d="M38 32 H60" />
      <rect x="41" y="21" width="6" height="22" fill="currentColor" stroke="none" />
      <rect x="53" y="21" width="6" height="22" fill="currentColor" stroke="none" />
    </>
  ),

  "levantamento-tecnico": (
    <>
      {Barra(48)}
      <path d="M32 40 C24 30 24 22 32 12" strokeDasharray="4 5" />
      <path d="M27 17 L32 12 L37 18" />
    </>
  ),

  corrida: (
    <>
      <path d="M8 20 H44" />
      <path d="M8 32 H56" />
      <path d="M8 44 H38" />
      <path d="M48 26 L56 32 L48 38" />
    </>
  ),

  "remo-skierg": (
    <>
      <path d="M18 12 H46" />
      <path d="M32 12 V26" strokeDasharray="4 4" />
      <rect x="20" y="26" width="24" height="26" rx="2" />
      <path d="M20 40 H44" />
    </>
  ),

  treno: (
    <>
      <path d="M14 44 H50 L44 30 H20 Z" />
      <path d="M32 30 V14" />
      <path d="M22 14 H42" />
      <path d="M10 52 H54" />
    </>
  ),

  "transporte-com-carga": (
    <>
      <path d="M12 30 a8 8 0 0 1 16 0" />
      <path d="M10 30 H30 V50 H10 Z" />
      <path d="M36 30 a8 8 0 0 1 16 0" />
      <path d="M34 30 H54 V50 H34 Z" />
    </>
  ),

  "wall-ball": (
    <>
      <path d="M10 10 H54" />
      <circle cx="32" cy="46" r="10" />
      <path d="M32 34 C22 28 22 18 30 13" strokeDasharray="4 4" />
    </>
  ),

  "burpee-broad-jump": (
    <>
      <path d="M8 50 H56" />
      <path d="M12 50 C18 20 42 20 50 50" strokeDasharray="5 5" />
      <circle cx="12" cy="50" r="3" fill="currentColor" stroke="none" />
      <circle cx="50" cy="50" r="3" fill="currentColor" stroke="none" />
    </>
  ),
};
