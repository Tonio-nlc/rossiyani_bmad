import { notFound, redirect } from "next/navigation";

import { VocabularyEntry } from "@/components/vocabulary/VocabularyEntry";
import { getVocabularyEntry } from "@/lib/vocabulary/get-vocabulary-entry";
import { createClient } from "@/lib/supabase/server";

interface VocabularyEntryPageProps {
  params: Promise<{ lemmaId: string }>;
}

export default async function VocabularyEntryPage({
  params,
}: VocabularyEntryPageProps) {
  const { lemmaId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  try {
    const entry = await getVocabularyEntry(user.id, lemmaId);

    if (!entry) {
      notFound();
    }

    return <VocabularyEntry entry={entry} />;
  } catch {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-sm text-destructive">
          Impossible de charger cette fiche vocabulaire. Veuillez réessayer.
        </p>
      </div>
    );
  }
}
