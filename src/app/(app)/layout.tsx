import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/auth/SignOutButton";
import { AppNav } from "@/components/layout/AppNav";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { getReaderHref } from "@/lib/progress/get-reader-href";
import { getReviewCount } from "@/lib/review/get-review-count";
import { createClient } from "@/lib/supabase/server";

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

  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const isOnboarding = pathname === "/onboarding";

  const readerHref = await getReaderHref(user.id);
  const reviewCount = await getReviewCount(user.id);

  return (
    <QueryProvider>
      <div className="flex min-h-full flex-1 flex-col bg-brand-surface">
        {!isOnboarding && (
          <header className="border-b border-brand-border bg-brand-card">
            <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3">
              <AppNav
                readerHref={readerHref}
                reviewDueCount={reviewCount.due}
              />
              <SignOutButton />
            </nav>
          </header>
        )}
        <main className="flex-1">{children}</main>
      </div>
    </QueryProvider>
  );
}
