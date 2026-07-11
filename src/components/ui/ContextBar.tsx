import {
  CONTEXT_BAR_SHELL_CLASS,
  PAGE_BODY_SHELL_CLASS,
  pageBodyWidthClass,
  type LayoutWidth,
} from "@/lib/design/rhythm";
import { cn } from "@/lib/utils";

interface ContextBarProps {
  children: React.ReactNode;
  width?: LayoutWidth;
  className?: string;
}

/**
 * Barre contextuelle au-dessus du PageHeader (retour reader, fil d'Ariane).
 */
export function ContextBar({
  children,
  width = "dashboard",
  className,
}: ContextBarProps) {
  return (
    <div className={cn(CONTEXT_BAR_SHELL_CLASS, className)}>
      <div
        className={cn(
          PAGE_BODY_SHELL_CLASS,
          "pb-0",
          pageBodyWidthClass(width),
        )}
      >
        {children}
      </div>
    </div>
  );
}
