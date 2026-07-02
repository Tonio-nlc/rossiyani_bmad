import Link from "next/link";
import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/auth/SignOutButton";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { createClient } from "@/lib/supabase/server";

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/library", label: "Bibliothèque" },
  { href: "/library", label: "Reader" },
  { href: "/vocabulary", label: "Vocabulaire" },
  { href: "/lessons", label: "Leçons" },
  { href: "/practice", label: "Pratique" },
] as const;

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <QueryProvider>
      <div className="flex min-h-full flex-1 flex-col bg-brand-surface">
        <header className="border-b border-brand-border bg-brand-card">
          <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3">
            <div className="flex flex-1 flex-wrap items-center gap-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-brand-text-secondary transition-colors hover:text-brand-text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <SignOutButton />
          </nav>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </QueryProvider>
  );
}
