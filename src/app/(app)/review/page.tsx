import { redirect } from "next/navigation";

import { ReviewView } from "@/components/review/ReviewView";
import { parseReturnContext } from "@/lib/navigation/return-context";
import { getReviewQueue } from "@/lib/review/get-review-queue";
import { createClient } from "@/lib/supabase/server";

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; textId?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const query = await searchParams;
  const returnContext = parseReturnContext({
    get: (key) => query[key as keyof typeof query] ?? null,
  });

  try {
    const queue = await getReviewQueue(user.id);
    return <ReviewView queue={queue} returnContext={returnContext} />;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Impossible de charger la file de révision";

    return (
      <ReviewView
        queue={[]}
        errorMessage={message}
        returnContext={returnContext}
      />
    );
  }
}
