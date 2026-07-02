import type { TVocabularyEntry } from "@/types/vocabulary";
import { collectVocabularyExamples } from "@/lib/vocabulary/collect-vocabulary-examples";
import { extractTranslation } from "@/lib/vocabulary/extract-translation";
import { formatReviewLevel } from "@/lib/vocabulary/format-linguistic-labels";
import { findAccentedLemmaForm } from "@/lib/vocabulary/normalize-russian-word";
import { createClient } from "@/lib/supabase/server";

interface VocabularyEntryRow {
  id: string;
  lemma_id: string;
  saved_at: string;
  text_id: string | null;
  notes: string | null;
  lemmas:
    | {
        form: string;
        pos: string;
        gender: string | null;
        aspect: string | null;
      }
    | {
        form: string;
        pos: string;
        gender: string | null;
        aspect: string | null;
      }[]
    | null;
  explanation_cache:
    | { explanation_fr: string }
    | { explanation_fr: string }[]
    | null;
  srs_reviews:
    | {
        repetitions: number;
        next_review_at: string;
        ease_factor: number;
        interval_days: number;
        last_review_at: string | null;
      }
    | {
        repetitions: number;
        next_review_at: string;
        ease_factor: number;
        interval_days: number;
        last_review_at: string | null;
      }[]
    | null;
}

function getExplanationFr(
  cacheRelation: VocabularyEntryRow["explanation_cache"],
): string | undefined {
  if (!cacheRelation) {
    return undefined;
  }

  if (Array.isArray(cacheRelation)) {
    return cacheRelation[0]?.explanation_fr;
  }

  return cacheRelation.explanation_fr;
}

async function resolveTranslation(
  supabase: Awaited<ReturnType<typeof createClient>>,
  lemmaId: string,
  primaryExplanationFr: string | undefined,
): Promise<string> {
  const fromPrimary = extractTranslation(primaryExplanationFr);

  if (fromPrimary) {
    return fromPrimary;
  }

  const { data } = await supabase
    .from("explanation_cache")
    .select("explanation_fr")
    .eq("lemma_id", lemmaId)
    .order("usage_count", { ascending: false })
    .limit(1)
    .maybeSingle();

  return extractTranslation(data?.explanation_fr);
}

async function resolveAccent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  lemmaForm: string,
): Promise<string | null> {
  const { data: texts } = await supabase.from("texts").select("content");

  const contents = (texts ?? []).map((text) => text.content as string);

  return findAccentedLemmaForm(lemmaForm, contents);
}

export async function getVocabularyEntry(
  userId: string,
  lemmaId: string,
): Promise<TVocabularyEntry | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_vocabulary")
    .select(
      `
      id,
      lemma_id,
      saved_at,
      text_id,
      notes,
      lemmas ( form, pos, gender, aspect ),
      explanation_cache ( explanation_fr ),
      srs_reviews ( repetitions, next_review_at, ease_factor, interval_days, last_review_at )
    `,
    )
    .eq("user_id", userId)
    .eq("lemma_id", lemmaId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const row = data as VocabularyEntryRow;
  const lemmaRelation = row.lemmas;
  const lemma = Array.isArray(lemmaRelation) ? lemmaRelation[0] : lemmaRelation;

  if (!lemma) {
    return null;
  }

  const srsRelation = row.srs_reviews;
  const srsReview = Array.isArray(srsRelation) ? srsRelation[0] : srsRelation;
  const explanationFr = getExplanationFr(row.explanation_cache);

  const [translation, accent, examples] = await Promise.all([
    resolveTranslation(supabase, lemmaId, explanationFr),
    resolveAccent(supabase, lemma.form),
    collectVocabularyExamples(supabase, lemmaId, lemma.form),
  ]);

  return {
    lemma: lemma.form,
    translation,
    linguisticData: {
      lemma: lemma.form,
      translation,
      pos: lemma.pos !== "unknown" ? lemma.pos : null,
      gender: lemma.gender,
      aspect: lemma.aspect,
      accent,
      addedAt: row.saved_at,
    },
    userVocabulary: {
      id: row.id,
      lemmaId: row.lemma_id,
      savedAt: row.saved_at,
      textId: row.text_id,
      notes: row.notes,
    },
    review: srsReview
      ? {
          nextReviewAt: srsReview.next_review_at,
          repetitions: srsReview.repetitions,
          currentLevel: formatReviewLevel(srsReview.repetitions),
          easeFactor: srsReview.ease_factor,
          intervalDays: srsReview.interval_days,
          lastReviewAt: srsReview.last_review_at,
        }
      : null,
    examples,
  };
}
