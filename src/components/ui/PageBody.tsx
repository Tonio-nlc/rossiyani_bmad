import {
  PAGE_BODY_SHELL_CLASS,
  PAGE_BODY_TOP_CLASS,
  pageBodyWidthClass,
  type LayoutWidth,
} from "@/lib/design/rhythm";
import { cn } from "@/lib/utils";

interface PageBodyProps {
  children: React.ReactNode;
  width?: LayoutWidth;
  className?: string;
}

/**
 * Zone de contenu sous PageHeader — pt-12 (48px), largeur officielle.
 */
export function PageBody({
  children,
  width = "dashboard",
  className,
}: PageBodyProps) {
  return (
    <div
      className={cn(
        PAGE_BODY_SHELL_CLASS,
        PAGE_BODY_TOP_CLASS,
        pageBodyWidthClass(width),
        className,
      )}
    >
      {children}
    </div>
  );
}
