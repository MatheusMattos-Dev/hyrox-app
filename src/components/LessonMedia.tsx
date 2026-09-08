import type { Lesson } from "@/lib/types";

function toEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }
    if (parsed.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${parsed.pathname}`;
    }
    if (parsed.hostname.includes("vimeo.com") && !parsed.hostname.startsWith("player.")) {
      return `https://player.vimeo.com/video${parsed.pathname}`;
    }
    if (parsed.hostname.includes("vimeo.com") || parsed.hostname.includes("iframe")) {
      return url;
    }
    return null;
  } catch {
    return null;
  }
}

/** Área de mídia da aula. Aceita embed, arquivo de vídeo ou GIF; sem mídia, vira o placar da aula. */
export function LessonMedia({ lesson }: { lesson: Lesson }) {
  const url = lesson.media_url;

  if (url && lesson.media_type === "gif") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={`Demonstração da aula ${lesson.number}`}
        className="aspect-video w-full rounded-panel bg-paper-alt object-cover"
      />
    );
  }

  if (url && lesson.media_type === "video") {
    const embed = toEmbedUrl(url);

    if (embed) {
      return (
        <div className="aspect-video w-full overflow-hidden rounded-panel bg-paper-alt">
          <iframe
            src={embed}
            title={lesson.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className="h-full w-full border-0"
          />
        </div>
      );
    }

    return (
      <video
        src={url}
        controls
        playsInline
        preload="metadata"
        className="aspect-video w-full rounded-panel bg-paper-alt"
      />
    );
  }

  return (
    <div className="flex aspect-[16/9] w-full flex-col justify-between rounded-panel border border-line bg-paper-alt p-5">
      <span className="rotulo text-[11px] text-graphite">Aula em texto</span>
      <span className="display text-[72px] text-line">
        {String(lesson.number).padStart(3, "0")}
      </span>
    </div>
  );
}
