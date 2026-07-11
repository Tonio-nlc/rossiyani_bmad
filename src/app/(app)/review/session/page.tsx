import { redirect } from "next/navigation";

import { ReviewSession } from "@/components/review/ReviewSession";
import { parseReturnContext } from "@/lib/navigation/return-context";
import { getReviewSessionQueue } from "@/lib/review/get-review-session";
import { createClient } from "@/lib/supabase/server";

export default async function ReviewSessionPage({
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
    const items = await getReviewSessionQueue(user.id);
    return <ReviewSession items={items} returnContext={returnContext} />;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Impossible de charger la session de révision";

    return (
      <ReviewSession
        items={[]}
        errorMessage={message}
        returnContext={returnContext}
      />
    );
  }
}
