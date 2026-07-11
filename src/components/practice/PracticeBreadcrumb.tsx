import Link from "next/link";

interface PracticeBreadcrumbProps {
  current: string;
}

export function PracticeBreadcrumb({ current }: PracticeBreadcrumbProps) {
  return (
    <nav
      aria-label="Fil d'Ariane"
      className="text-sm text-ink-2"
    >
      <Link
        href="/practice"
        className="transition-colors hover:text-ink"
      >
        Pratique
      </Link>
      <span className="mx-2 text-ink-3">/</span>
      <span className="text-ink">{current}</span>
    </nav>
  );
}
