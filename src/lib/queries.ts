import { cookies } from "next/headers";
import { createClient } from "./supabase/server";
import { DEMO_COOKIE, isSupabaseConfigured } from "./supabase/config";
import { sampleLessons, sampleModules, sampleMovements, sampleMovementsForLesson } from "./sample-data";
import type {
  CourseProgress,
  Lesson,
  LessonDetail,
  LessonWithState,
  LessonLog,
  LogEntry,
  Module,
  Movement,
  Viewer,
} from "./types";

export const DEMO_PROGRESS_COOKIE = "mc_demo_progress";
export const DEMO_LOGS_COOKIE = "mc_demo_logs";

/**
 * No modo demonstração os registos ficam num cookie, e cookie tem teto de 4 KB.
 * Guardamos abaixo disso e vamos largando os mais antigos até caber.
 */
export const DEMO_LOGS_TETO_BYTES = 3600;

export async function readDemoLogs(): Promise<Record<string, LessonLog>> {
  const store = await cookies();
  const raw = store.get(DEMO_LOGS_COOKIE)?.value;
  if (!raw) return {};

  try {
    return JSON.parse(raw) as Record<string, LessonLog>;
  } catch {
    return {};
  }
}

async function readDemoProgress(): Promise<Set<string>> {
  const store = await cookies();
  const raw = store.get(DEMO_PROGRESS_COOKIE)?.value ?? "";
  return new Set(raw.split(",").filter(Boolean));
}

async function isDemoSession(): Promise<boolean> {
  const store = await cookies();
  return store.get(DEMO_COOKIE)?.value === "1";
}

export async function getViewer(): Promise<Viewer | null> {
  const supabase = await createClient();

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const metadata = user.user_metadata ?? {};
      return {
        id: user.id,
        name: (metadata.full_name as string) ?? (metadata.name as string) ?? "Atleta",
        email: user.email ?? null,
        avatarUrl: (metadata.avatar_url as string) ?? (metadata.picture as string) ?? null,
        isDemo: false,
      };
    }
  }

  if (await isDemoSession()) {
    return {
      id: "demo",
      name: "Atleta convidado",
      email: null,
      avatarUrl: null,
      isDemo: true,
    };
  }

  return null;
}

/** Ids das aulas concluídas pelo usuário atual. */
async function getCompletedLessonIds(): Promise<Set<string>> {
  const supabase = await createClient();

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from("lesson_progress")
        .select("lesson_id")
        .eq("user_id", user.id)
        .not("completed_at", "is", null);

      return new Set((data ?? []).map((row) => row.lesson_id as string));
    }
  }

  return readDemoProgress();
}

async function fetchModules(): Promise<Module[]> {
  const supabase = await createClient();
  if (!supabase) return sampleModules;

  const { data } = await supabase.from("modules").select("*").order("position");
  return (data as Module[] | null) ?? [];
}

async function fetchLessons(): Promise<Lesson[]> {
  const supabase = await createClient();
  if (!supabase) return sampleLessons;

  const { data } = await supabase
    .from("lessons")
    .select("*")
    .eq("is_published", true)
    .order("number");

  return (data as Lesson[] | null) ?? [];
}

function withState(
  lessons: Lesson[],
  modules: Module[],
  completed: Set<string>,
): LessonWithState[] {
  const moduleById = new Map(modules.map((module) => [module.id, module]));

  return lessons.map((lesson) => {
    const parent = lesson.module_id ? moduleById.get(lesson.module_id) : undefined;
    return {
      ...lesson,
      module: parent ? { slug: parent.slug, title: parent.title } : null,
      completed: completed.has(lesson.id),
    };
  });
}

export type LessonFilters = {
  moduleSlug?: string;
  query?: string;
  onlyPending?: boolean;
};

export async function listLessons(filters: LessonFilters = {}): Promise<LessonWithState[]> {
  const [lessons, modules, completed] = await Promise.all([
    fetchLessons(),
    fetchModules(),
    getCompletedLessonIds(),
  ]);

  let result = withState(lessons, modules, completed);

  if (filters.moduleSlug) {
    result = result.filter((lesson) => lesson.module?.slug === filters.moduleSlug);
  }

  if (filters.onlyPending) {
    result = result.filter((lesson) => !lesson.completed);
  }

  const query = filters.query?.trim().toLowerCase();
  if (query) {
    result = result.filter((lesson) => {
      const haystack = [
        lesson.number,
        lesson.title,
        lesson.session_type,
        lesson.stimulus,
        lesson.weekday,
        lesson.equipment,
        lesson.module?.title,
        lesson.week ? `semana ${lesson.week}` : "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }

  return result;
}

export type ModuleSummary = Module & { total: number; completed: number };

export async function listModuleSummaries(): Promise<ModuleSummary[]> {
  const [lessons, modules, completed] = await Promise.all([
    fetchLessons(),
    fetchModules(),
    getCompletedLessonIds(),
  ]);

  return modules.map((module) => {
    const moduleLessons = lessons.filter((lesson) => lesson.module_id === module.id);
    return {
      ...module,
      total: moduleLessons.length,
      completed: moduleLessons.filter((lesson) => completed.has(lesson.id)).length,
    };
  });
}

export async function getProgress(): Promise<CourseProgress> {
  const [lessons, completed] = await Promise.all([fetchLessons(), getCompletedLessonIds()]);
  return {
    total: lessons.length,
    completed: lessons.filter((lesson) => completed.has(lesson.id)).length,
  };
}

/** A próxima aula não concluída — o ponto de retomada na tela inicial. */
export async function getCurrentLesson(): Promise<LessonWithState | null> {
  const lessons = await listLessons();
  return lessons.find((lesson) => !lesson.completed) ?? lessons[lessons.length - 1] ?? null;
}

async function fetchLessonMovements(lesson: Lesson): Promise<Movement[]> {
  const supabase = await createClient();
  if (!supabase) return sampleMovementsForLesson(lesson.number);

  const { data } = await supabase
    .from("lesson_movements")
    .select("position, movements(*)")
    .eq("lesson_id", lesson.id)
    .order("position");

  return ((data ?? []) as unknown as Array<{ movements: Movement | Movement[] | null }>)
    .flatMap((row) => (Array.isArray(row.movements) ? row.movements : [row.movements]))
    .filter((movement): movement is Movement => Boolean(movement));
}

export async function getLessonBySlug(slug: string): Promise<LessonDetail | null> {
  const lessons = await listLessons();
  const index = lessons.findIndex((lesson) => lesson.slug === slug);
  if (index === -1) return null;

  const lesson = lessons[index];
  const [movements, log] = await Promise.all([
    fetchLessonMovements(lesson),
    getLessonLog(lesson.id),
  ]);
  const neighbour = (offset: number) => {
    const found = lessons[index + offset];
    return found ? { number: found.number, slug: found.slug, title: found.title } : null;
  };

  return {
    ...lesson,
    movements,
    log,
    previous: neighbour(-1),
    next: neighbour(1),
  };
}

/** O registo do usuário para uma aula, se já existir. */
export async function getLessonLog(lessonId: string): Promise<LessonLog | null> {
  const supabase = await createClient();

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from("lesson_logs")
        .select("lesson_id, performed_on, level, rpe, fields, notes")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .maybeSingle();

      return (data as LessonLog | null) ?? null;
    }
  }

  return (await readDemoLogs())[lessonId] ?? null;
}

/** Os registos mais recentes, do mais novo para o mais antigo. */
export async function listRecentLogs(limite = 8): Promise<LogEntry[]> {
  const supabase = await createClient();
  const lessons = await listLessons();
  const porId = new Map(lessons.map((lesson) => [lesson.id, lesson]));

  const juntar = (registos: LessonLog[]): LogEntry[] =>
    registos.flatMap((registo) => {
      const lesson = porId.get(registo.lesson_id);
      if (!lesson) return [];
      return [
        {
          ...registo,
          lesson: {
            number: lesson.number,
            slug: lesson.slug,
            title: lesson.title,
            session_type: lesson.session_type,
          },
        },
      ];
    });

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from("lesson_logs")
        .select("lesson_id, performed_on, level, rpe, fields, notes")
        .eq("user_id", user.id)
        .order("performed_on", { ascending: false })
        .limit(limite);

      return juntar((data as LessonLog[] | null) ?? []);
    }
  }

  const demo = Object.values(await readDemoLogs()).sort((a, b) =>
    b.performed_on.localeCompare(a.performed_on),
  );

  return juntar(demo.slice(0, limite));
}

export type MovementFilters = { query?: string; category?: string };

export async function listMovements(filters: MovementFilters = {}): Promise<Movement[]> {
  const supabase = await createClient();
  let movements: Movement[];

  if (supabase) {
    const { data } = await supabase.from("movements").select("*").order("position").order("name");
    movements = (data as Movement[] | null) ?? [];
  } else {
    movements = sampleMovements;
  }

  if (filters.category) {
    movements = movements.filter((movement) => movement.category === filters.category);
  }

  const query = filters.query?.trim().toLowerCase();
  if (query) {
    movements = movements.filter((movement) =>
      `${movement.name} ${movement.category ?? ""} ${movement.description ?? ""}`
        .toLowerCase()
        .includes(query),
    );
  }

  return movements;
}

export async function listMovementCategories(): Promise<string[]> {
  const movements = await listMovements();
  return [...new Set(movements.map((movement) => movement.category).filter(Boolean))] as string[];
}

export async function getMovementBySlug(slug: string): Promise<Movement | null> {
  const movements = await listMovements();
  return movements.find((movement) => movement.slug === slug) ?? null;
}

export { isSupabaseConfigured };
