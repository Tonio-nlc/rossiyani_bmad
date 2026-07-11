import { ReaderContainer } from "@/components/reader/ReaderContainer";
import { COLLECTION_LABELS } from "@/lib/library/collections";
import { getLessonsLinkedToText } from "@/lib/lessons/get-lessons-for-text";
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

  const linkedLessons = await getLessonsLinkedToText(text.title);

  return (
    <ReaderContainer
      text={text}
      userProgress={userProgress}
      collectionLabel={collectionLabel}
      linkedLessons={linkedLessons}
    />
  );
}
