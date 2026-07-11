import { redirect } from "next/navigation";

import { ImportPreviewView } from "@/components/import/ImportPreviewView";
import { createClient } from "@/lib/supabase/server";
import type { TTextLevel } from "@/lib/import/types";

const LEVELS: TTextLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

function normalizeLevel(value: string | null | undefined): TTextLevel {
  if (value && LEVELS.includes(value as TTextLevel)) {
    return value as TTextLevel;
  }

  return "A1";
}

export default async function ImportPreviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("target_level")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <ImportPreviewView defaultLevel={normalizeLevel(profile?.target_level)} />
  );
}
