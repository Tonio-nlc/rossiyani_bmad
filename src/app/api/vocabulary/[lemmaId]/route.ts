import { NextResponse } from "next/server";

import { getVocabularyEntry } from "@/lib/vocabulary/get-vocabulary-entry";
import { createClient } from "@/lib/supabase/server";

interface RouteParams {
  params: Promise<{ lemmaId: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { lemmaId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const entry = await getVocabularyEntry(user.id, lemmaId);

    if (!entry) {
      return NextResponse.json({ error: "Mot introuvable" }, { status: 404 });
    }

    return NextResponse.json(entry);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Impossible de charger la fiche vocabulaire";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// TODO: implement vocabulary delete endpoint
export async function DELETE(_request: Request, { params }: RouteParams) {
  await params;
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
