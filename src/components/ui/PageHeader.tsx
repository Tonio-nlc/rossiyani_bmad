interface PageHeaderProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  badge,
}: PageHeaderProps) {
  return (
    <header className="border-b border-border bg-surface px-10 py-10">
      <div className="mx-auto max-w-[1080px]">
        <p className="text-[11px] font-bold tracking-[0.1em] text-accent uppercase">
          {eyebrow}
        </p>
        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-serif text-4xl text-ink md:text-[2.75rem]">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-2">
                {subtitle}
              </p>
            )}
          </div>
          {badge}
        </div>
      </div>
    </header>
  );
}
