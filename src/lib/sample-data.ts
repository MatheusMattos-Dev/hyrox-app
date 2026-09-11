import lessonsJson from "../../data/lessons.json";
import modulesJson from "../../data/modules.json";
import movementsJson from "../../data/movements.json";
import linksJson from "../../data/lesson-movements.json";
import type { Lesson, Levels, Module, Movement } from "./types";

/**
 * Fonte usada no modo demonstração, quando o Supabase ainda não está ligado:
 * os mesmos arquivos de `data/` que o script de importação manda para o banco.
 * Assim a interface local mostra o conteúdo real, sem inventar aulas.
 */

export const sampleModules: Module[] = modulesJson.map((m) => ({
  id: `module-${m.slug}`,
  slug: m.slug,
  title: m.title,
  subtitle: m.subtitle,
  position: m.position,
}));

export const sampleLessons: Lesson[] = lessonsJson.map((l) => ({
  id: `lesson-${l.number}`,
  module_id: `module-${l.module}`,
  number: l.number,
  slug: l.slug,
  title: l.title,
  summary: l.summary,
  media_url: null,
  media_type: "none" as const,
  duration_min: l.duration_min,
  week: l.week,
  mesocycle: l.mesocycle,
  weekday: l.weekday,
  deload: l.deload,
  session_type: l.session_type,
  stimulus: l.stimulus,
  pathway: l.pathway,
  tag: l.tag,
  equipment: l.equipment,
  space: l.space,
  warmup: l.warmup,
  technique_cue: l.technique_cue,
  technique_sheet: l.technique_sheet,
  main_block: l.main_block,
  levels: l.levels as Levels,
  cooldown: l.cooldown,
  coaching: l.coaching,
  watch_error: l.watch_error,
  log_what: l.log_what,
}));

export const sampleMovements: Movement[] = movementsJson.map((m) => ({
  id: `movement-${m.slug}`,
  slug: m.slug,
  name: m.name,
  category: m.category,
  gif_url: m.gif_url,
  // No modo demonstração não há storage: a grade cai no desenho do app.
  poster_url: null,
  description: m.description,
  cues: m.cues,
  common_errors: m.common_errors,
}));

const movimentosPorAula = new Map(linksJson.map((l) => [l.lesson, l.movements]));

export function sampleMovementsForLesson(lessonNumber: number): Movement[] {
  const slugs = movimentosPorAula.get(lessonNumber) ?? [];
  return slugs
    .map((slug) => sampleMovements.find((movement) => movement.slug === slug))
    .filter((movement): movement is Movement => Boolean(movement));
}
