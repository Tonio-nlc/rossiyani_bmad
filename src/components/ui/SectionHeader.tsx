import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
  trailing?: React.ReactNode;
}

export function SectionHeader({
  title,
  subtitle,
  className,
  trailing,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div>
        <h2 className="text-base font-bold text-ink">{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-[13px] text-ink-3">{subtitle}</p>
        ) : null}
      </div>
      {trailing}
    </div>
  );
}
