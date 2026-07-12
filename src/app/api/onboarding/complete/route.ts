import { NextResponse } from "next/server";

import { ensureUserProfile } from "@/lib/auth/ensure-user-profile";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { profile, error: ensureError } = await ensureUserProfile(
    supabase,
    user,
  );

  if (ensureError || !profile) {
    return NextResponse.json(
      { error: ensureError ?? "Impossible de charger le profil" },
      { status: 500 },
    );
  }

  const { error } = await supabase
    .from("user_profiles")
    .update({ onboarding_completed: true })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
