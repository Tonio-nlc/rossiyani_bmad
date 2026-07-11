import type { ReactNode } from "react";

import {
  LESSON_ENDING_CLASS,
  LESSON_STEP_EYEBROW_CLASS,
  LESSON_STEP_SECTION_CLASS,
  LESSON_STEP_TITLE_CLASS,
} from "@/lib/design/lesson-composition";
import type { TLessonSectionHeaderTone } from "@/lib/lessons/lesson-section-rhythm";
import type { TLessonSectionId } from "@/lib/lessons/group-lesson-sections";
import { cn } from "@/lib/utils";

interface LessonSectionProps {
  sectionId: TLessonSectionId;
  eyebrow: string;
  title: string;
  children: ReactNode;
  headerTone: TLessonSectionHeaderTone;
  contentSpacing: string;
  contentMaxWidth?: string;
  marginTop: string;
  marginBottom: string;
  showSeparator?: boolean;
  isConclusion?: boolean;
}

function SectionHeader({
  eyebrow,
  title,
  tone,
}: {
  eyebrow: string;
  title: string;
  tone: TLessonSectionHeaderTone;
}) {
  if (tone === "hidden" || tone === "climax") {
    return null;
  }

  if (tone === "impact") {
    return (
      <header className="mb-6">
        <p className="text-[11px] font-bold tracking-[0.08em] text-accent uppercase">
          {eyebrow}
        </p>
      </header>
    );
  }

  if (tone === "conversation") {
    return (
      <header className="mb-5">
        <p className="text-[11px] font-bold tracking-[0.08em] text-ink-3 uppercase">
          {eyebrow}
        </p>
      </header>
    );
  }

  if (tone === "step") {
    return (
      <header className={cn(LESSON_STEP_SECTION_CLASS, "mb-6")}>
        <p className={LESSON_STEP_EYEBROW_CLASS}>{eyebrow}</p>
        <h2 className={LESSON_STEP_TITLE_CLASS}>{title}</h2>
      </header>
    );
  }

  if (tone === "conclusion") {
    return (
      <header className="mb-6">
        <p className="text-[11px] font-bold tracking-[0.1em] text-ink-3 uppercase">
          {eyebrow}
        </p>
        <h2 className="mt-2 font-serif text-xl leading-snug text-ink md:text-[1.35rem]">
          {title}
        </h2>
      </header>
    );
  }

  return (
    <header className="mb-5">
      <p className="text-[11px] font-bold tracking-[0.08em] text-ink-3 uppercase">
        {eyebrow}
      </p>
      <h2 className="mt-1.5 font-serif text-lg leading-snug text-ink md:text-xl">
        {title}
      </h2>
    </header>
  );
}

export function LessonSection({
  sectionId,
  eyebrow,
  title,
  children,
  headerTone,
  contentSpacing,
  contentMaxWidth,
  marginTop,
  marginBottom,
  showSeparator = false,
  isConclusion = false,
}: LessonSectionProps) {
  return (
    <section
      className={cn(
        "relative",
        marginTop,
        marginBottom,
        isConclusion && LESSON_ENDING_CLASS,
        sectionId === "schema" && "isolate",
      )}
    >
      <SectionHeader eyebrow={eyebrow} title={title} tone={headerTone} />

      <div
        className={cn(
          contentSpacing,
          contentMaxWidth,
          contentMaxWidth && "mx-auto w-full",
        )}
      >
        {children}
      </div>

      {showSeparator ? (
        <div className="mt-10 border-b border-border/60" aria-hidden="true" />
      ) : null}
    </section>
  );
}
