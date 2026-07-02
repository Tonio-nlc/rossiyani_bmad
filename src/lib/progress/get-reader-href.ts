import { createClient } from "@/lib/supabase/server";

interface ProgressRow {
  text_id: string;
  last_read_at: string | null;
  percent_read: number;
  completed_at: string | null;
}

export async function getReaderHref(userId: string): Promise<string> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("user_progress")
    .select("text_id, last_read_at, percent_read, completed_at")
    .eq("user_id", userId)
    .not("last_read_at", "is", null)
    .order("last_read_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const progress = data as ProgressRow | null;

  if (
    progress?.text_id &&
    progress.percent_read > 0 &&
    !progress.completed_at
  ) {
    return `/reader/${progress.text_id}`;
  }

  return "/library";
}
