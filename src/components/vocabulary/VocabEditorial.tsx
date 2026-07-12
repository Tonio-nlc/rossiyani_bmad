import type { ReactNode } from "react";

import { displayRussianGraphemes } from "@/lib/russian/display-russian";
import {
  LESSON_STEP_EYEBROW_CLASS,
  LESSON_STEP_SECTION_CLASS,
  LESSON_STEP_TITLE_CLASS,
} from "@/lib/design/lesson-composition";
import { cn } from "@/lib/utils";

export function VocabSection({
  eyebrow,
  title,
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn(LESSON_STEP_SECTION_CLASS, className)}>
      <header>
        <p className={LESSON_STEP_EYEBROW_CLASS}>{eyebrow}</p>
        <h2 className={LESSON_STEP_TITLE_CLASS}>{title}</h2>
      </header>
      <div className="mt-6 space-y-5">{children}</div>
    </section>
  );
}

export function VocabStep({
  children,
  showArrow = true,
}: {
  children: ReactNode;
  showArrow?: boolean;
}) {
  return (
    <div className="space-y-4">
      {children}
      {showArrow ? (
        <p className="text-center text-sm text-ink-3" aria-hidden="true">
          ↓
        </p>
      ) : null}
    </div>
  );
}

export function VocabChipRow({ chips }: { chips: string[] }) {
  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <span
          key={chip}
          className="rounded-full border border-border/80 bg-bg/40 px-3 py-1 text-sm text-ink-2"
        >
          {chip}
        </span>
      ))}
    </div>
  );
}

function RussianGraphemeText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const graphemes = displayRussianGraphemes(text);

  return (
    <span className={cn("font-russian", className)}>
      {graphemes.map((grapheme, index) => (
        <span key={`${index}-${grapheme}`} className="inline">
          {grapheme}
        </span>
      ))}
    </span>
  );
}

export function VocabRussianDisplay({
  children,
  size = "lg",
}: {
  children: ReactNode;
  size?: "md" | "lg" | "xl";
}) {
  const sizeClass =
    size === "xl"
      ? "text-[2rem] leading-tight"
      : size === "lg"
        ? "text-2xl leading-tight"
        : "text-lg leading-relaxed";

  if (typeof children === "string") {
    return (
      <p className={cn("text-ink", sizeClass)}>
        <RussianGraphemeText text={children} />
      </p>
    );
  }

  return (
    <p className={cn("font-russian text-ink", sizeClass)}>{children}</p>
  );
}

export function VocabMutedLabel({ children }: { children: ReactNode }) {
  return <p className="text-sm text-ink-3">{children}</p>;
}

export function VocabShortBlock({ children }: { children: ReactNode }) {
  return (
    <p className="max-w-reading text-[15px] leading-[1.7] text-ink-2">
      {children}
    </p>
  );
}

const CYRILLIC_RE = /[\u0400-\u04FF]/;

function ExploreItem({ item }: { item: string }) {
  if (CYRILLIC_RE.test(item)) {
    return <RussianGraphemeText text={item} className="text-[15px] leading-relaxed text-ink-2" />;
  }

  return <>{item}</>;
}

export function VocabExploreBlock({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li
            key={item}
            className="text-[15px] leading-relaxed text-ink-2"
          >
            <ExploreItem item={item} />
          </li>
        ))}
      </ul>
    </div>
  );
}
