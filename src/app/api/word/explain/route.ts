import { NextResponse } from "next/server";
import { z } from "zod";

import { explainWord } from "@/lib/orchestrator";
import { createClient } from "@/lib/supabase/server";

const requestSchema = z.object({
  surface: z.string().min(1),
  sentence: z.string().min(1),
  textId: z.string().uuid().optional(),
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
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Corps de requête invalide" },
      { status: 400 },
    );
  }

  try {
    const explanation = await explainWord(parsed.data);
    return NextResponse.json(explanation);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Une erreur est survenue lors de l'explication";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
