import { getReviewQueue } from "@/lib/review/get-review-queue";
import type {
  TReviewSessionItem,
  TReviewSessionKnowledge,
} from "@/lib/review/types";
import { createClient } from "@/lib/supabase/server";

interface KnowledgeRow {
  lemma_id: string;
  part_of_speech: string | null;
  gender: string | null;
  aspect: string | null;
}

function toNullableKnowledgeField(
  value: string | null | undefined,
): string | null {
  if (!value || value === "unknown") {
    return null;
  }

  return value;
}

function mapKnowledgeRow(row: KnowledgeRow): TReviewSessionKnowledge {
  return {
    partOfSpeech: toNullableKnowledgeField(row.part_of_speech),
    gender: toNullableKnowledgeField(row.gender),
    aspect: toNullableKnowledgeField(row.aspect),
  };
}

function hasKnowledgeContent(knowledge: TReviewSessionKnowledge): boolean {
  return (
    knowledge.partOfSpeech !== null ||
    knowledge.gender !== null ||
    knowledge.aspect !== null
  );
}

export async function getReviewSessionQueue(
  userId: string,
): Promise<TReviewSessionItem[]> {
  const queue = await getReviewQueue(userId);

  if (queue.length === 0) {
    return [];
  }

  const supabase = await createClient();
  const lemmaIds = queue.map((item) => item.lemmaId);

  const { data, error } = await supabase
    .from("linguistic_knowledge")
    .select("lemma_id, part_of_speech, gender, aspect")
    .in("lemma_id", lemmaIds);

  if (error) {
    throw new Error(error.message);
  }

  const knowledgeByLemmaId = new Map<string, TReviewSessionKnowledge>();

  for (const row of (data ?? []) as KnowledgeRow[]) {
    const knowledge = mapKnowledgeRow(row);

    if (hasKnowledgeContent(knowledge)) {
      knowledgeByLemmaId.set(row.lemma_id, knowledge);
    }
  }

  return queue.map((item) => ({
    ...item,
    knowledge: knowledgeByLemmaId.get(item.lemmaId) ?? null,
  }));
}
