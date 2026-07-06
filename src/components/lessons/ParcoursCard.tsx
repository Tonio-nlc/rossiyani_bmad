import Link from "next/link";

import { CARD_BASE_CLASS } from "@/components/ui/card-styles";
import type { TLessonPath } from "@/types/lessons";

interface ParcoursCardProps {
  path: TLessonPath;
}

export function ParcoursCard({ path }: ParcoursCardProps) {
  return (
    <Link
      href={`/lessons/${path.slug}`}
      className={CARD_BASE_CLASS}
      style={{ borderLeftWidth: 3, borderLeftColor: path.color }}
    >
      <h3 className="text-sm font-bold text-ink">{path.title}</h3>

      <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-ink-3">
        {path.description}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="rounded-[5px] bg-[#F2F0EC] px-2 py-0.5 text-[10px] font-bold text-ink-3">
          {path.levelRange}
        </span>
        <span className="rounded-[5px] bg-[#F2F0EC] px-2 py-0.5 text-[10px] font-bold text-ink-3">
          {path.lessonCount} leçon{path.lessonCount > 1 ? "s" : ""}
        </span>
      </div>
    </Link>
  );
}
