import { NextResponse } from "next/server";

import { getReviewCount } from "@/lib/review/get-review-count";
import { getReviewQueue } from "@/lib/review/get-review-queue";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const [count, queue] = await Promise.all([
      getReviewCount(user.id),
      getReviewQueue(user.id),
    ]);

    return NextResponse.json({
      due: count.due,
      queue,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Impossible de charger la file de révision";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
