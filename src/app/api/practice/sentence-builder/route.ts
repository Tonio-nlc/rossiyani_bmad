import { NextResponse } from "next/server";
import { z } from "zod";

import { evaluateSentence } from "@/lib/practice/sentence-builder-llm";
import { createClient } from "@/lib/supabase/server";

const requestSchema = z.object({
  idea: z.string().min(1),
  sentence: z.string().min(1).max(500),
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
    const result = await evaluateSentence(
      parsed.data.idea,
      parsed.data.sentence,
    );
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Une erreur est survenue lors de l'évaluation";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
