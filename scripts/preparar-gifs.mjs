/**
 * Prepara os GIFs de execução a partir de uma biblioteca de treino funcional.
 *
 *   node scripts/preparar-gifs.mjs "C:/caminho/para/a/biblioteca"
 *
 * A biblioteca de origem tem milhares de GIFs de 1920x1080 com 1 a 5 MB cada —
 * peso impossível para um telefone em ginásio. Aqui cada movimento do curso é
 * casado com uma execução, reduzido e convertido para WebP animado, que corta
 * uns 90% do tamanho sem perder a leitura do movimento.
 *
 * O que fica em data/gifs/ é o que o importador sobe para o Supabase.
 */
import sharp from "sharp";
import { existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { join, sep } from "node:path";
import { fileURLToPath } from "node:url";

const LARGURA = 720;
const QUALIDADE = 70;

// Os de aquecimento aparecem em miniatura e são muitos: pesam menos de propósito.
const LARGURA_LEVE = 520;
const QUALIDADE_LEVE = 58;
const DESTINO = fileURLToPath(new URL("../data/gifs/", import.meta.url));

/**
 * Cada movimento do curso e a execução escolhida para ele. O critério foi o
 * ponto técnico que o livro pede em cada um — daí a preferência por vista
 * lateral no agachamento e no terra, que é onde se vê o calcanhar no chão e a
 * barra junto à perna, e pela corrida de fundo, de perfil, onde se vê o
 * contacto sob o centro de massa.
 *
 * Os padrões de força são com barra porque é isso que as aulas prescrevem:
 * "agachamento com barra nas costas", "desenvolvimento em pé com barra".
 */
const ESCOLHAS = [
  { slug: "agachamento", arquivo: "Barbell-Full-Squat-(Side-POV)" },
  { slug: "levantamento-terra", arquivo: "Barbell-Deadlift-(side-POV)-(male)" },
  { slug: "empurrar-vertical", arquivo: "Barbell-Standing-Military-Press-(without-rack)" },
  { slug: "puxada", arquivo: "Shoulder-Grip-Pull-up_Back" },
  { slug: "unilateral", arquivo: "Bodyweight-Forward-Lunge-(Smaller-Stance-Upright-Torso)" },
  { slug: "levantamento-tecnico", arquivo: "Barbell-Clean-High-Pull" },
  { slug: "corrida", arquivo: "Long-Distance-Running_Cardio" },
  { slug: "remo-skierg", arquivo: "Rowing-(with-rowing-machine)" },
  { slug: "treno", arquivo: "Power-Sled-Push-(male)" },
  { slug: "wall-ball", arquivo: "Medicine-Ball-Throw-Squat-with-Wall" },
  { slug: "burpee-broad-jump", arquivo: "Burpee-Long-Jump-with-Push-up-(male)" },
  // As 10 aulas deste movimento prescrevem "avanços com sandbag, 100 m".
  { slug: "transporte-com-carga", arquivo: "Weighted-Bag-Walking-Lunge-(male)" },

  // Os exercícios que as linhas de aquecimento nomeiam. São 750 linhas de
  // aquecimento nas 250 aulas, e até aqui nenhuma tinha ilustração.
  { slug: "ponte-de-gluteo", arquivo: "Heel-Glute-Bridge-(male)", leve: true },
  { slug: "remada-com-banda", arquivo: "Band-bent-over-row-(male)", leve: true },
  { slug: "abducao-com-banda", arquivo: "Resistance-Band-Standing-Hip-Abduction", leve: true },
  { slug: "avanco-com-rotacao", arquivo: "Lunge-Twist-(male)", leve: true },
  { slug: "balanco-de-perna", arquivo: "Wall-Supported-Front-Leg-Swing-(male)", leve: true },
  { slug: "rotacao-de-ombro-com-bastao", arquivo: "Stick-Shoulder-Mobilization-in-Abduction", leve: true },
  { slug: "elevacao-de-calcanhar", arquivo: "Standing-Calf-Raise-(On-a-staircase)", leve: true },
  { slug: "joelhos-altos", arquivo: "CARDIO/High-Knee-Run-(male)", leve: true },
  { slug: "calcanhares-aos-gluteos", arquivo: "Butt-Kick-(VERSION-2)-(male)", leve: true },
  { slug: "passada-lateral", arquivo: "Mini-Side Shuffles-Slight-Knee-Raise-(male)", leve: true },
  { slug: "salto-a-corda", arquivo: "CARDIO/High-Jump-Rope-(male)", leve: true },
  { slug: "burpee-lento", arquivo: "BURPEE/Burpee_Cardio-FIX", leve: true },
  { slug: "skierg", arquivo: "Ski-Ergometer", leve: true },

  // As alternativas por falta de equipamento. 100 das 250 aulas pedem trenó,
  // sandbag, wall ball ou barra fixa — coisa que academia comum não tem.
  { slug: "empurrar-placa", arquivo: "PESO/Plate-Push-(male)", leve: true },
  { slug: "thruster-com-halteres", arquivo: "HALTERES/PERNA/Dumbbell-Thruster", leve: true },
  { slug: "avanco-com-halteres", arquivo: "Dumbbell-Walking-Lunges", leve: true },
  { slug: "bicicleta-de-assalto", arquivo: "Assault-Bike-Run", leve: true },
  { slug: "agachamento-frontal-kettlebell", arquivo: "KETTLEBELL/PERNA/Kettlebell-Front-Squat", leve: true },
  { slug: "terra-com-halteres", arquivo: "HALTERES/PERNA/Dumbbell-Deadlift", leve: true },
  { slug: "desenvolvimento-com-halteres", arquivo: "Dumbbell-Standing-Palms-In-Press", leve: true },
  { slug: "clean-com-kettlebell", arquivo: "Kettlebell-Clean-and-Press", leve: true },
  { slug: "puxada-na-polia", arquivo: "Cable-Close-Grip-Front-Lat-Pulldown", leve: true },
  { slug: "bicicleta-estatica", arquivo: "Stationary-Bike-Run", leve: true },
  { slug: "agachamento-goblet-halteres", arquivo: "HALTERES/PERNA/Dumbbell-Front-Squat", leve: true },
  { slug: "agachamento-peso-corporal", arquivo: "Bodyweight-Squat-(male)_Thighs-SIDE-POV", leve: true },
  { slug: "terra-com-kettlebell", arquivo: "KETTLEBELL/PERNA/Kettlebell-deadlift", leve: true },
  { slug: "desenvolvimento-com-kettlebell", arquivo: "Kettlebell-Alternating-Press", leve: true },
  { slug: "remada-invertida", arquivo: "Ring-Inverted-Row-parallel-to-the-floor", leve: true },
  { slug: "agachamento-bulgaro", arquivo: "Bulgarian-Split-Squat-with-Chair", leve: true },
  { slug: "clean-com-halteres", arquivo: "HALTERES/PERNA/Dumbbell-Clean_Thighs", leve: true },
  { slug: "caminhada-rapida", arquivo: "CARDIO/Briskly-Walking_Cardio", leve: true },
  { slug: "thruster-com-kettlebell", arquivo: "Kettlebell-Thruster", leve: true },
  { slug: "agachamento-com-press", arquivo: "Bodyweight-Squat-Overhead-Press", leve: true },
];

/** Movimentos sem execução à altura. Ficam com o desenho do app. */
const SEM_ORIGEM = {};

function listar(raiz) {
  const encontrados = [];
  const andar = (dir) => {
    for (const entrada of readdirSync(dir, { withFileTypes: true })) {
      const caminho = join(dir, entrada.name);
      if (entrada.isDirectory()) andar(caminho);
      else if (entrada.name.toLowerCase().endsWith(".gif")) encontrados.push(caminho);
    }
  };
  andar(raiz);
  return encontrados;
}

const raiz = process.argv[2];
if (!raiz || !existsSync(raiz)) {
  console.error("Passe a pasta da biblioteca de GIFs.");
  console.error('  node scripts/preparar-gifs.mjs "C:/Users/voce/Downloads/biblioteca"');
  process.exit(1);
}

const catalogo = listar(raiz);
console.log(`biblioteca: ${catalogo.length} GIFs em ${raiz}\n`);

mkdirSync(DESTINO, { recursive: true });

let totalAntes = 0;
let totalDepois = 0;
const faltando = [];

for (const { slug, arquivo, leve } of ESCOLHAS) {
  // O padrão é escrito com barra normal; o caminho vem com a do sistema.
  const alvo = arquivo.split("/").join(sep);
  const origem = catalogo.find((c) => c.includes(alvo));

  if (!origem) {
    faltando.push(`${slug} (procurava "${arquivo}")`);
    continue;
  }

  // Sem recorte: a origem já vem em 16:9, que é a proporção em que o app mostra.
  const saida = join(DESTINO, `${slug}.webp`);
  await sharp(origem, { animated: true, limitInputPixels: false })
    .resize({ width: leve ? LARGURA_LEVE : LARGURA })
    .webp({ quality: leve ? QUALIDADE_LEVE : QUALIDADE, effort: 5 })
    .toFile(saida);

  const antes = statSync(origem).size;
  const depois = statSync(saida).size;
  totalAntes += antes;
  totalDepois += depois;

  const kb = (n) => `${Math.round(n / 1024)} KB`;
  console.log(
    `${slug.padEnd(22)} ${kb(antes).padStart(8)} -> ${kb(depois).padStart(7)}   ${origem.split(/[\/]/).slice(-2).join("/")}`,
  );
}

console.log(
  `\ntotal: ${Math.round(totalAntes / 1024 / 1024)} MB -> ${Math.round(totalDepois / 1024)} KB`,
);

for (const [slug, motivo] of Object.entries(SEM_ORIGEM)) {
  console.log(`sem GIF: ${slug} — ${motivo}`);
}

if (faltando.length > 0) {
  throw new Error(`Não achei na biblioteca:\n  ${faltando.join("\n  ")}`);
}
