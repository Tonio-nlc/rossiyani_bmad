import { NextResponse } from "next/server";
import { z } from "zod";

import { translateInContext } from "@/lib/practice/context-translation-llm";
import { createClient } from "@/lib/supabase/server";

const requestSchema = z.object({
  text: z.string().min(1).max(300),
  register: z
    .enum(["courant", "soutenu", "familier", "argotique"])
    .default("courant"),
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
    const result = await translateInContext(
      parsed.data.text,
      parsed.data.register,
    );
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Une erreur est survenue lors de la traduction";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
