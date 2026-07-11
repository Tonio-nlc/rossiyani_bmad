import { HERO_TO_SECTION_CLASS, SECTION_GAP_CLASS } from "@/lib/design/rhythm";
import { cn } from "@/lib/utils";

export type PageSectionGap = "default" | "after-hero" | "none";

interface PageSectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  gap?: PageSectionGap;
}

export function PageSection({
  children,
  className,
  id,
  gap = "default",
}: PageSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        gap === "after-hero" && HERO_TO_SECTION_CLASS,
        gap === "default" && SECTION_GAP_CLASS,
        className,
      )}
    >
      {children}
    </section>
  );
}
