import type { SupabaseClient } from "@supabase/supabase-js";

import { splitIntoSentences } from "@/lib/utils/russian";
import {
  normalizeRussianWord,
  sentenceContainsLemma,
} from "@/lib/vocabulary/normalize-russian-word";
import type { TAnnotatedContent } from "@/types/reader";
import type { TVocabularyExample } from "@/types/vocabulary";

interface TextRow {
  id: string;
  title: string;
  content: string;
  content_annotated: TAnnotatedContent | null;
}

interface CacheExampleRow {
  id: string;
  sentence_example: string;
  explanation_fr: string;
}

function mapAnnotatedExamples(
  texts: TextRow[],
  lemmaId: string,
): TVocabularyExample[] {
  const examples: TVocabularyExample[] = [];

  for (const text of texts) {
    const annotated = text.content_annotated;

    if (!annotated?.sentences) {
      continue;
    }

    for (const sentence of annotated.sentences) {
      if (!sentence.words?.length) {
        continue;
      }

      const containsLemma = sentence.words.some(
        (word) => word.lemmaId === lemmaId,
      );

      if (!containsLemma) {
        continue;
      }

      examples.push({
        id: `${text.id}-${examples.length}`,
        sentenceRu: sentence.text,
        translationFr: sentence.translationFr ?? null,
        source: "text",
        textId: text.id,
        textTitle: text.title,
      });
    }
  }

  return examples;
}

function mapContentExamples(
  texts: TextRow[],
  lemmaForm: string,
  existingSentences: Set<string>,
): TVocabularyExample[] {
  const examples: TVocabularyExample[] = [];

  for (const text of texts) {
    for (const sentence of splitIntoSentences(text.content)) {
      if (!sentenceContainsLemma(sentence, lemmaForm)) {
        continue;
      }

      const key = normalizeRussianWord(sentence);

      if (existingSentences.has(key)) {
        continue;
      }

      existingSentences.add(key);
      examples.push({
        id: `${text.id}-content-${examples.length}`,
        sentenceRu: sentence,
        translationFr: null,
        source: "text",
        textId: text.id,
        textTitle: text.title,
      });
    }
  }

  return examples;
}

export async function collectVocabularyExamples(
  supabase: SupabaseClient,
  lemmaId: string,
  lemmaForm: string,
): Promise<TVocabularyExample[]> {
  const { data: texts, error: textsError } = await supabase
    .from("texts")
    .select("id, title, content, content_annotated");

  if (textsError) {
    throw new Error(textsError.message);
  }

  const textRows = (texts ?? []) as TextRow[];
  const annotatedExamples = mapAnnotatedExamples(textRows, lemmaId);
  const existingSentences = new Set(
    annotatedExamples.map((example) =>
      normalizeRussianWord(example.sentenceRu),
    ),
  );

  const contentExamples = mapContentExamples(
    textRows,
    lemmaForm,
    existingSentences,
  );

  const textExamples = [...annotatedExamples, ...contentExamples];

  const { data: cacheRows, error: cacheError } = await supabase
    .from("explanation_cache")
    .select("id, sentence_example, explanation_fr")
    .eq("lemma_id", lemmaId)
    .order("usage_count", { ascending: false });

  if (cacheError) {
    throw new Error(cacheError.message);
  }

  const cacheExamples: TVocabularyExample[] = [];

  for (const row of (cacheRows ?? []) as CacheExampleRow[]) {
    const key = normalizeRussianWord(row.sentence_example);

    if (existingSentences.has(key)) {
      continue;
    }

    existingSentences.add(key);
    cacheExamples.push({
      id: row.id,
      sentenceRu: row.sentence_example,
      translationFr: null,
      source: "cache",
    });
  }

  return [...textExamples, ...cacheExamples];
}
