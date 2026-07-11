import { PageSection, type PageSectionGap } from "@/components/ui/PageSection";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SECTION_CONTENT_GAP_CLASS } from "@/lib/design/rhythm";
import { cn } from "@/lib/utils";

interface SectionProps {
  title: string;
  description?: string;
  trailing?: React.ReactNode;
  children: React.ReactNode;
  id?: string;
  gap?: PageSectionGap;
  className?: string;
  contentClassName?: string;
}

/**
 * Section canonique hub — title → description → content (24px).
 */
export function Section({
  title,
  description,
  trailing,
  children,
  id,
  gap = "default",
  className,
  contentClassName,
}: SectionProps) {
  return (
    <PageSection id={id} gap={gap} className={className}>
      <SectionHeader
        title={title}
        subtitle={description}
        trailing={trailing}
      />
      <div className={cn(SECTION_CONTENT_GAP_CLASS, contentClassName)}>
        {children}
      </div>
    </PageSection>
  );
}
