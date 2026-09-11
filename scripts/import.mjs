#!/usr/bin/env node
// Importa módulos, aulas, movimentos e GIFs para o Supabase.
//
//   node scripts/import.mjs all
//   node scripts/import.mjs lessons
//   node scripts/import.mjs gifs
//
// Cada etapa lê o arquivo correspondente em ./data (JSON ou CSV) e faz upsert
// pelo campo `slug` (ou `number`, no caso das aulas), então rodar de novo é seguro.

import { createClient } from "@supabase/supabase-js";
import { readFile, readdir } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "data");
const BUCKET = "media";

loadEnvFile(path.join(ROOT, ".env.local"));

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Faltam NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local.\n" +
      "A service role key está em Supabase > Project Settings > API. Nunca use ela no navegador.",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

const RUNNERS = defineRunners();
const step = process.argv[2] ?? "all";
const steps = step === "all" ? ["modules", "movements", "lessons", "links", "gifs"] : [step];

for (const name of steps) {
  const runner = RUNNERS[name];
  if (!runner) {
    console.error(`Etapa desconhecida: ${name}. Use: ${Object.keys(RUNNERS).join(", ")} ou all.`);
    process.exit(1);
  }
  await runner();
}

// ------------------------------------------------------------------ etapas

function defineRunners() {
  return {
    async modules() {
      const rows = await readData("modules");
      if (!rows) return;

      const payload = rows.map((row, index) => ({
        slug: row.slug,
        title: row.title,
        subtitle: row.subtitle || null,
        position: toInt(row.position) ?? index + 1,
      }));

      await upsert("modules", payload, "slug");
    },

    async movements() {
      // Os doze do livro saem do parser; os de aquecimento são uma curadoria
      // à parte, num arquivo próprio, para o parser continuar fiel ao PDF.
      const doLivro = await readData("movements");
      const doAquecimento = (await readData("aquecimento")) ?? [];
      if (!doLivro) return;

      const rows = [...doLivro, ...doAquecimento];
      const payload = rows.map((row, index) => ({
        slug: row.slug,
        name: row.name,
        category: row.category || null,
        gif_url: row.gif_url || null,
        description: row.description || null,
        cues: toList(row.cues),
        common_errors: toList(row.common_errors),
        position: toInt(row.position) ?? index + 1,
      }));

      await upsert("movements", payload, "slug");
    },

    async lessons() {
      const rows = await readData("lessons");
      if (!rows) return;

      const { data: modules } = await supabase.from("modules").select("id, slug");
      const moduleIdBySlug = new Map((modules ?? []).map((m) => [m.slug, m.id]));

      const payload = rows.map((row) => {
        const number = toInt(row.number);
        if (!number) throw new Error(`Aula sem "number": ${JSON.stringify(row).slice(0, 120)}`);

        return {
          number,
          slug: row.slug || `aula-${number}`,
          title: row.title,
          summary: row.summary || null,
          content: row.content || null,
          module_id: row.module ? (moduleIdBySlug.get(row.module) ?? null) : null,
          media_url: row.media_url || null,
          media_type: row.media_type || (row.media_url ? "video" : "none"),
          duration_min: toInt(row.duration_min),
          is_published: row.is_published === undefined ? true : toBool(row.is_published),
          week: toInt(row.week),
          mesocycle: toInt(row.mesocycle),
          weekday: row.weekday || null,
          deload: row.deload === undefined ? false : toBool(row.deload),
          session_type: row.session_type || null,
          stimulus: row.stimulus || null,
          pathway: row.pathway || null,
          tag: row.tag || null,
          equipment: row.equipment || null,
          space: row.space || null,
          warmup: toList(row.warmup),
          technique_cue: row.technique_cue || null,
          technique_sheet: row.technique_sheet || null,
          main_block: row.main_block || null,
          levels: row.levels ?? null,
          cooldown: row.cooldown || null,
          coaching: row.coaching || null,
          watch_error: row.watch_error || null,
          log_what: row.log_what || null,
        };
      });

      await upsert("lessons", payload, "number");
    },

    // data/lesson-movements.json: [{ "lesson": 12, "movements": ["wall-balls", "corrida"] }]
    async links() {
      const rows = await readData("lesson-movements");
      if (!rows) return;

      const [{ data: lessons }, { data: movements }] = await Promise.all([
        supabase.from("lessons").select("id, number"),
        supabase.from("movements").select("id, slug"),
      ]);

      const lessonIdByNumber = new Map((lessons ?? []).map((l) => [l.number, l.id]));
      const movementIdBySlug = new Map((movements ?? []).map((m) => [m.slug, m.id]));

      const payload = [];
      for (const row of rows) {
        const lessonId = lessonIdByNumber.get(toInt(row.lesson));
        if (!lessonId) continue;

        const slugs = Array.isArray(row.movements) ? row.movements : toList(row.movements) ?? [];
        slugs.forEach((slug, index) => {
          const movementId = movementIdBySlug.get(slug);
          if (movementId) {
            payload.push({ lesson_id: lessonId, movement_id: movementId, position: index + 1 });
          }
        });
      }

      await upsert("lesson_movements", payload, "lesson_id,movement_id");
    },

    // Sobe data/gifs/<slug>.gif para o storage e liga cada arquivo ao movimento.
    async gifs() {
      const dir = path.join(DATA_DIR, "gifs");
      if (!existsSync(dir)) {
        console.log("gifs: pasta data/gifs não existe, pulando.");
        return;
      }

      const files = (await readdir(dir)).filter((file) => /\.(gif|webp|mp4|png|jpe?g)$/i.test(file));
      if (files.length === 0) {
        console.log("gifs: nenhum arquivo em data/gifs.");
        return;
      }

      let uploaded = 0;
      for (const file of files) {
        const slug = path.parse(file).name;
        const body = await readFile(path.join(dir, file));
        const objectPath = `movements/${file}`;

        const { error } = await supabase.storage.from(BUCKET).upload(objectPath, body, {
          contentType: contentTypeFor(file),
          upsert: true,
        });

        if (error) {
          console.error(`gifs: falha em ${file}: ${error.message}`);
          continue;
        }

        const { data } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);
        const { error: updateError } = await supabase
          .from("movements")
          .update({ gif_url: data.publicUrl })
          .eq("slug", slug);

        if (updateError) {
          console.error(`gifs: subiu ${file}, mas não achou o movimento "${slug}".`);
          continue;
        }

        uploaded += 1;
      }

      console.log(`gifs: ${uploaded} de ${files.length} arquivos ligados aos movimentos.`);
    },
  };
}

// ------------------------------------------------------------------ auxiliares

async function upsert(table, rows, onConflict) {
  if (rows.length === 0) {
    console.log(`${table}: nada para importar.`);
    return;
  }

  for (let i = 0; i < rows.length; i += 200) {
    const chunk = rows.slice(i, i + 200);
    const { error } = await supabase.from(table).upsert(chunk, { onConflict });
    if (error) {
      console.error(`${table}: ${error.message}`);
      process.exit(1);
    }
  }

  console.log(`${table}: ${rows.length} registros importados.`);
}

async function readData(name) {
  const found = ["json", "csv"].filter((ext) => existsSync(path.join(DATA_DIR, `${name}.${ext}`)));
  if (found.length > 1) {
    console.warn(
      `${name}: existem ${name}.json e ${name}.csv. Vou usar o .json e ignorar o .csv — ` +
        `apague ou renomeie o que não for o bom.`,
    );
  }

  for (const ext of ["json", "csv"]) {
    const file = path.join(DATA_DIR, `${name}.${ext}`);
    if (!existsSync(file)) continue;

    const raw = await readFile(file, "utf8");
    const rows = ext === "json" ? JSON.parse(raw) : parseCsv(raw);
    console.log(`${name}: lendo ${rows.length} linhas de data/${name}.${ext}`);
    return rows;
  }

  console.log(`${name}: nenhum data/${name}.json ou .csv encontrado, pulando.`);
  return null;
}

/** CSV simples com aspas duplas, vírgulas e quebras de linha dentro do campo. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  const input = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];

    if (quoted) {
      if (char === '"' && input[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') quoted = true;
    else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += char;
  }

  if (field || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const [header, ...body] = rows.filter((line) => line.some((cell) => cell.trim() !== ""));
  if (!header) return [];

  return body.map((line) =>
    Object.fromEntries(header.map((key, index) => [key.trim(), (line[index] ?? "").trim()])),
  );
}

function toInt(value) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function toBool(value) {
  if (typeof value === "boolean") return value;
  return ["1", "true", "sim", "yes"].includes(String(value).toLowerCase());
}

/** Aceita array JSON ou texto separado por "|". */
function toList(value) {
  if (Array.isArray(value)) return value.length ? value : null;
  const text = String(value ?? "").trim();
  if (!text) return null;
  return text
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}

function contentTypeFor(file) {
  const ext = path.extname(file).toLowerCase();
  return (
    {
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".mp4": "video/mp4",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
    }[ext] ?? "application/octet-stream"
  );
}

function loadEnvFile(file) {
  if (!existsSync(file)) return;

  const content = readFileSync(file, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key]) continue;
    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}
