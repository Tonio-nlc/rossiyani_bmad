import { NextResponse } from "next/server";

import { getTextById } from "@/lib/texts/get-text-by-id";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;
  const result = await getTextById(id, user.id);

  if (!result) {
    return NextResponse.json({ error: "Texte introuvable" }, { status: 404 });
  }

  return NextResponse.json(result);
}
