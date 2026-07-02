interface VocabularyEntryPageProps {
  params: Promise<{ lemmaId: string }>;
}

export default async function VocabularyEntryPage({
  params,
}: VocabularyEntryPageProps) {
  await params;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-brand-text-secondary">Loading vocabulary entry...</p>
    </div>
  );
}
