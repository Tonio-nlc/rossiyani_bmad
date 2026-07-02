import { redirect } from "next/navigation";

import { VocabularyView } from "@/components/vocabulary/VocabularyView";
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
    return <VocabularyView words={words} />;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Impossible de charger le vocabulaire";

    return <VocabularyView words={[]} errorMessage={message} />;
  }
}
