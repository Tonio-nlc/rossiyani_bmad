import { NextResponse } from "next/server";
import { z } from "zod";

import { explainWord } from "@/lib/orchestrator";
import { createClient } from "@/lib/supabase/server";
import { createPerfTimer } from "@/lib/utils/perf-timer";

const requestSchema = z.object({
  surface: z.string().min(1),
  sentence: z.string().min(1),
  textId: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  const mark = createPerfTimer("route:word/explain");
  const supabase = await createClient();
  mark("createClient (Supabase server, lit les cookies)");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  mark("auth.getUser (vérification JWT réseau)");

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = requestSchema.safeParse(body);
  mark("parse + validation body");

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Corps de requête invalide" },
      { status: 400 },
    );
  }

  try {
    const explanation = await explainWord(parsed.data);
    mark("explainWord (détail dans son propre timer explain:*)");
    const response = NextResponse.json(explanation);
    mark("NextResponse.json (sérialisation)");

    return response;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Une erreur est survenue lors de l'explication";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
