import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-2xl font-semibold text-brand-text-primary">
        Bienvenue sur Rossiyani
      </h1>
      {profile?.display_name && (
        <p className="mt-2 text-lg text-brand-text-secondary">
          {profile.display_name}
        </p>
      )}
    </div>
  );
}
