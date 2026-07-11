import {
  PAGE_HEADER_EYEBROW_CLASS,
  PAGE_HEADER_SHELL_CLASS,
  PAGE_HEADER_SUBTITLE_CLASS,
  PAGE_HEADER_TITLE_CLASS,
  PAGE_BODY_SHELL_CLASS,
  pageBodyWidthClass,
  type LayoutWidth,
} from "@/lib/design/rhythm";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  leading?: React.ReactNode;
  width?: LayoutWidth;
  className?: string;
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  badge,
  leading,
  width = "dashboard",
  className,
}: PageHeaderProps) {
  return (
    <header className={cn(PAGE_HEADER_SHELL_CLASS, className)}>
      <div
        className={cn(
          PAGE_BODY_SHELL_CLASS,
          "pb-0",
          pageBodyWidthClass(width),
        )}
      >
        {leading ? <div className="mb-4">{leading}</div> : null}
        <p className={PAGE_HEADER_EYEBROW_CLASS}>{eyebrow}</p>
        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className={PAGE_HEADER_TITLE_CLASS}>{title}</h1>
            {subtitle ? (
              <p className={PAGE_HEADER_SUBTITLE_CLASS}>{subtitle}</p>
            ) : null}
          </div>
          {badge}
        </div>
      </div>
    </header>
  );
}
