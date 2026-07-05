import { redirect } from "next/navigation";

import { ReviewSession } from "@/components/review/ReviewSession";
import { getReviewSessionQueue } from "@/lib/review/get-review-session";
import { createClient } from "@/lib/supabase/server";

export default async function ReviewSessionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  try {
    const items = await getReviewSessionQueue(user.id);
    return <ReviewSession items={items} />;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Impossible de charger la session de révision";

    return <ReviewSession items={[]} errorMessage={message} />;
  }
}
