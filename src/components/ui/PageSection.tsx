import { PAGE_SECTION_GAP_CLASS } from "@/lib/design/rhythm";
import { cn } from "@/lib/utils";

interface PageSectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  /** false pour la première section (pas de mt-16) */
  spaced?: boolean;
}

/**
 * Section de page — marge haute 64px entre sections (spaced).
 */
export function PageSection({
  children,
  className,
  id,
  spaced = true,
}: PageSectionProps) {
  return (
    <section
      id={id}
      className={cn(spaced && PAGE_SECTION_GAP_CLASS, className)}
    >
      {children}
    </section>
  );
}
