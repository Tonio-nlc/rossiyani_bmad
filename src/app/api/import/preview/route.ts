import { NextResponse } from "next/server";

import { analyzeImport } from "@/lib/import/analyze-import";
import { importPreviewRequestSchema } from "@/lib/import/api-schemas";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = importPreviewRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Corps de requête invalide" },
      { status: 400 },
    );
  }

  console.info("[import] preview start", { userId: user.id });

  const result = analyzeImport(parsed.data);

  if (!result.ok) {
    console.error("[import] preview error", {
      userId: user.id,
      codes: result.errors.map((error) => error.code),
    });

    return NextResponse.json({ errors: result.errors }, { status: 400 });
  }

  console.info("[import] preview success", { userId: user.id });

  return NextResponse.json({ preview: result.preview });
}
