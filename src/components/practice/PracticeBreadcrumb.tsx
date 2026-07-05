import Link from "next/link";

interface PracticeBreadcrumbProps {
  current: string;
}

export function PracticeBreadcrumb({ current }: PracticeBreadcrumbProps) {
  return (
    <nav
      aria-label="Fil d'Ariane"
      className="text-sm text-brand-text-secondary"
    >
      <Link
        href="/practice"
        className="transition-colors hover:text-brand-text-primary"
      >
        Pratique
      </Link>
      <span className="mx-2 text-brand-text-muted">/</span>
      <span className="text-brand-text-primary">{current}</span>
    </nav>
  );
}
