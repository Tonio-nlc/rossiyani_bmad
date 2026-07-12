import type { SupabaseClient, User } from "@supabase/supabase-js";

export interface TUserProfileState {
  onboarding_completed: boolean;
}

function defaultDisplayName(user: User, override?: string): string | null {
  if (override?.trim()) {
    return override.trim();
  }

  const fromMetadata = user.user_metadata?.display_name;

  if (typeof fromMetadata === "string" && fromMetadata.trim()) {
    return fromMetadata.trim();
  }

  const fromEmail = user.email?.split("@")[0]?.trim();

  return fromEmail || null;
}

/**
 * Garantit qu'un `user_profiles` existe pour l'utilisateur authentifié.
 * Utilisé après login/register — évite l'état « auth OK, profil absent ».
 */
export async function ensureUserProfile(
  supabase: SupabaseClient,
  user: User,
  options?: { displayName?: string },
): Promise<{ profile: TUserProfileState | null; error: string | null }> {
  const { data: existing, error: fetchError } = await supabase
    .from("user_profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  if (fetchError) {
    return { profile: null, error: fetchError.message };
  }

  if (existing) {
    return { profile: existing, error: null };
  }

  const { data: created, error: insertError } = await supabase
    .from("user_profiles")
    .insert({
      id: user.id,
      display_name: defaultDisplayName(user, options?.displayName),
      onboarding_completed: false,
    })
    .select("onboarding_completed")
    .single();

  if (insertError) {
    return { profile: null, error: insertError.message };
  }

  return { profile: created, error: null };
}
