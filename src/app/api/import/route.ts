import { NextResponse } from "next/server";

import { analyzeImport } from "@/lib/import/analyze-import";
import { importSaveRequestSchema } from "@/lib/import/api-schemas";
import {
  buildReaderRedirect,
  checkImportQuotas,
  getUserImportCounts,
  persistImportedText,
} from "@/lib/import/persist-import";
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
  const parsed = importSaveRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Corps de requête invalide" },
      { status: 400 },
    );
  }

  console.info("[import] save start", { userId: user.id });

  const result = analyzeImport(parsed.data);

  if (!result.ok) {
    console.error("[import] save error", {
      userId: user.id,
      codes: result.errors.map((error) => error.code),
    });

    return NextResponse.json({ errors: result.errors }, { status: 400 });
  }

  try {
    const counts = await getUserImportCounts(supabase, user.id);
    const quotaErrors = checkImportQuotas(result.preview, counts);

    if (quotaErrors.length > 0) {
      console.error("[import] save error", {
        userId: user.id,
        codes: quotaErrors.map((error) => error.code),
      });

      return NextResponse.json({ errors: quotaErrors }, { status: 400 });
    }

    const textId = await persistImportedText(
      supabase,
      user.id,
      parsed.data.title,
      parsed.data.level,
      result.preview,
    );

    console.info("[import] save success", { userId: user.id, textId });

    return NextResponse.json({
      textId,
      redirectTo: buildReaderRedirect(textId),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur lors de l'enregistrement";

    console.error("[import] save error", { userId: user.id, message });

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
