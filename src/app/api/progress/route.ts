import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const progressSchema = z.object({
  textId: z.string().uuid(),
  percentRead: z.number().min(0).max(100),
  lastSentenceIndex: z.number().min(0),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = progressSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Corps de requête invalide" },
      { status: 400 },
    );
  }

  const { textId, percentRead, lastSentenceIndex } = parsed.data;
  const completedAt =
    percentRead >= 100 ? new Date().toISOString() : null;

  const { error } = await supabase.from("user_progress").upsert(
    {
      user_id: user.id,
      text_id: textId,
      percent_read: percentRead,
      last_sentence_index: lastSentenceIndex,
      last_read_at: new Date().toISOString(),
      completed_at: completedAt,
    },
    { onConflict: "user_id,text_id" },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
