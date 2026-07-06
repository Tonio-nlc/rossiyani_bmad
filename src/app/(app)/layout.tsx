import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AppNav } from "@/components/nav/AppNav";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { getReviewCount } from "@/lib/review/get-review-count";
import { createClient } from "@/lib/supabase/server";

function getUserInitial(
  displayName: string | null | undefined,
  email: string | undefined,
): string {
  const fromName = displayName?.trim().charAt(0);

  if (fromName) {
    return fromName.toUpperCase();
  }

  const fromEmail = email?.trim().charAt(0);

  if (fromEmail) {
    return fromEmail.toUpperCase();
  }

  return "?";
}

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

  const [{ data: profile }, reviewCount] = await Promise.all([
    supabase
      .from("user_profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle(),
    getReviewCount(user.id),
  ]);

  const userInitial = getUserInitial(profile?.display_name, user.email);

  return (
    <QueryProvider>
      <div className="flex min-h-full flex-1 flex-col">
        {!isOnboarding && (
          <AppNav
            reviewDueCount={reviewCount.due}
            userInitial={userInitial}
          />
        )}
        <main className="flex-1 bg-bg">{children}</main>
      </div>
    </QueryProvider>
  );
}
