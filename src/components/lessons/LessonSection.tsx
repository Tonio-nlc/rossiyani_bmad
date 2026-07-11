import type { ReactNode } from "react";

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
      <header className="mb-8 md:mb-10">
        <p className="text-[10px] font-bold tracking-[0.12em] text-accent uppercase">
          {eyebrow}
        </p>
      </header>
    );
  }

  if (tone === "conversation") {
    return (
      <header className="mb-6 md:mb-8">
        <p className="text-[10px] font-bold tracking-[0.12em] text-ink-3 uppercase">
          {eyebrow}
        </p>
      </header>
    );
  }

  if (tone === "conclusion") {
    return (
      <header className="mb-8 md:mb-10">
        <p className="text-[10px] font-bold tracking-[0.14em] text-ink-3 uppercase">
          {eyebrow}
        </p>
        <h2 className="mt-3 font-serif text-2xl text-ink md:text-[1.75rem]">
          {title}
        </h2>
      </header>
    );
  }

  return (
    <header className="mb-7 md:mb-8">
      <p className="text-[10px] font-bold tracking-[0.1em] text-ink-3 uppercase">
        {eyebrow}
      </p>
      <h2 className="mt-2 font-serif text-lg text-ink md:text-xl">{title}</h2>
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
        isConclusion && "border-t border-border pt-14 md:pt-16",
        sectionId === "schema" && "isolate",
      )}
    >
      <SectionHeader eyebrow={eyebrow} title={title} tone={headerTone} />

      <div
        className={cn(
          contentSpacing,
          contentMaxWidth,
          sectionId === "schema" && "mx-auto w-full",
          sectionId !== "schema" && contentMaxWidth && "mx-auto w-full",
        )}
      >
        {children}
      </div>

      {showSeparator ? (
        <div className="mt-12 border-b border-border/60" aria-hidden="true" />
      ) : null}
    </section>
  );
}
