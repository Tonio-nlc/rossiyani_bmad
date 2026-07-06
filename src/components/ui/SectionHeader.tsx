interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-bold text-ink">{title}</h2>
      {subtitle && (
        <p className="mt-1 text-[13px] text-ink-3">{subtitle}</p>
      )}
    </div>
  );
}
