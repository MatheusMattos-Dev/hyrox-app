export type MediaType = "video" | "gif" | "none";

export type Module = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  position: number;
};

export type Level = {
  carga: string;
  repeticoes: string;
  alteracao: string;
};

export type Levels = {
  n1: Level;
  n2: Level;
  n3: Level;
};

export type Lesson = {
  id: string;
  module_id: string | null;
  number: number;
  slug: string;
  title: string;
  summary: string | null;
  media_url: string | null;
  media_type: MediaType;
  duration_min: number | null;

  /** Onde a aula cai no ano: semana 1 a 50, mesociclo 1 a 10, dia útil. */
  week: number | null;
  mesocycle: number | null;
  weekday: string | null;
  /** A quinta semana de cada mesociclo desce o volume para ~45%. */
  deload: boolean;

  session_type: string | null;
  stimulus: string | null;
  pathway: string | null;
  tag: string | null;
  equipment: string | null;
  space: string | null;

  warmup: string[] | null;
  technique_cue: string | null;
  technique_sheet: string | null;
  main_block: string | null;
  levels: Levels | null;
  cooldown: string | null;
  coaching: string | null;
  watch_error: string | null;
  log_what: string | null;
};

export type Movement = {
  id: string;
  slug: string;
  name: string;
  category: string | null;
  gif_url: string | null;
  description: string | null;
  cues: string[] | null;
  common_errors: string[] | null;
};

export type LessonLog = {
  lesson_id: string;
  /** Dia em que treinou, no formato YYYY-MM-DD. Pode não ser o dia do registo. */
  performed_on: string;
  /** Qual das três prescrições foi usada. */
  level: "n1" | "n2" | "n3" | null;
  /** Sensação de esforço no fim, de 1 a 10. */
  rpe: number | null;
  /** Respostas do formulário, com as chaves definidas em lib/log-fields.ts. */
  fields: Record<string, string>;
  notes: string | null;
};

export type LessonWithState = Lesson & {
  module: Pick<Module, "slug" | "title"> | null;
  completed: boolean;
};

export type LessonDetail = LessonWithState & {
  movements: Movement[];
  log: LessonLog | null;
  previous: Pick<Lesson, "number" | "slug" | "title"> | null;
  next: Pick<Lesson, "number" | "slug" | "title"> | null;
};

export type CourseProgress = {
  total: number;
  completed: number;
};

/** Um registo com a aula a que pertence, para listar no perfil. */
export type LogEntry = LessonLog & {
  lesson: Pick<Lesson, "number" | "slug" | "title" | "session_type">;
};

export type Viewer = {
  id: string;
  name: string;
  email: string | null;
  avatarUrl: string | null;
  isDemo: boolean;
};
