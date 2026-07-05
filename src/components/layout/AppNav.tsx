import Link from "next/link";

interface AppNavLinkProps {
  href: string;
  label: string;
  badge?: number;
}

function AppNavLink({ href, label, badge }: AppNavLinkProps) {
  return (
    <Link
      href={href}
      className="text-sm font-medium text-brand-text-secondary transition-colors hover:text-brand-text-primary"
    >
      {label}
      {badge !== undefined && badge > 0 ? ` (${badge})` : ""}
    </Link>
  );
}

interface AppNavProps {
  readerHref: string;
  reviewDueCount: number;
}

export function AppNav({ readerHref, reviewDueCount }: AppNavProps) {
  return (
    <div className="flex flex-1 flex-wrap items-center gap-4">
      <AppNavLink href="/" label="Accueil" />
      <AppNavLink href="/library" label="Bibliothèque" />
      <AppNavLink href={readerHref} label="Reader" />
      <AppNavLink href="/vocabulary" label="Vocabulaire" />
      <AppNavLink href="/review" label="Review" badge={reviewDueCount} />
      <AppNavLink href="/lessons" label="Leçons" />
      <AppNavLink href="/practice" label="Pratique" />
    </div>
  );
}
