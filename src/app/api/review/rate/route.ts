import { NextResponse } from "next/server";
import { z } from "zod";

import { REVIEW_RATINGS } from "@/lib/review/rating";
import { processReviewRating } from "@/lib/review/process-review-rating";
import { createClient } from "@/lib/supabase/server";

const rateSchema = z.object({
  userVocabularyId: z.string().uuid(),
  rating: z.enum(REVIEW_RATINGS),
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
  const parsed = rateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Corps de requête invalide" },
      { status: 400 },
    );
  }

  try {
    await processReviewRating(
      user.id,
      parsed.data.userVocabularyId,
      parsed.data.rating,
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Impossible d'enregistrer la réponse";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
