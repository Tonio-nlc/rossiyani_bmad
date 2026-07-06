import { ReaderContainer } from "@/components/reader/ReaderContainer";
import { COLLECTION_LABELS } from "@/lib/library/collections";
import { getTextByIdOrNotFound } from "@/lib/texts/get-text-by-id";

export default async function ReaderPage({
  params,
}: {
  params: Promise<{ textId: string }>;
}) {
  const { textId } = await params;
  const { text, userProgress } = await getTextByIdOrNotFound(textId);

  const collectionLabel =
    COLLECTION_LABELS[text.collection] ?? text.collection;

  return (
    <ReaderContainer
      text={text}
      userProgress={userProgress}
      collectionLabel={collectionLabel}
    />
  );
}
