import { Suspense } from "react";
import { redirect } from "next/navigation";

import { VocabularyView } from "@/components/vocabulary/VocabularyView";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserVocabulary } from "@/lib/vocabulary/get-user-vocabulary";
import { createClient } from "@/lib/supabase/server";

export default async function VocabularyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  try {
    const words = await getUserVocabulary(user.id);
    return (
      <Suspense fallback={<VocabularyPageSkeleton />}>
        <VocabularyView words={words} />
      </Suspense>
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Impossible de charger le vocabulaire";

    return (
      <Suspense fallback={<VocabularyPageSkeleton />}>
        <VocabularyView words={[]} errorMessage={message} />
      </Suspense>
    );
  }
}

function VocabularyPageSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 px-6 py-10">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-full max-w-xl" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}
