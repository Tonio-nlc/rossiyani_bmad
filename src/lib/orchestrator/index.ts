import { resolveReaderConceptFromSignals } from "@/lib/knowledge/concept-graph";
import { buildLinguisticProfile } from "@/lib/knowledge/build-linguistic-profile";
import { getKnowledgeForConceptResolution } from "@/lib/knowledge/get-knowledge";
import {
  getCachedExplanation,
  incrementUsageCount,
  resolveOrCreateLemma,
  storeExplanationInCache,
} from "@/lib/orchestrator/cache";
import { generateWordExplanation } from "@/lib/orchestrator/llm";
import { computeContextHash } from "@/lib/orchestrator/hasher";
import type {
  TWordExplanationRequest,
  TWordExplanationResponseExtended,
} from "@/lib/orchestrator/types";

function mapCacheToResponse(
  cached: NonNullable<Awaited<ReturnType<typeof getCachedExplanation>>>,
  surface: string,
): TWordExplanationResponseExtended {
  return {
    surface,
    lemma: cached.lemma,
    lemmaStressed: cached.payload.lemmaStressed,
    translation: cached.payload.translation,
    functionalRole: cached.functionalRole,
    functionColor: cached.functionColor,
    explanation: cached.payload.explanation,
    suffix: cached.payload.suffix,
    suffixExplanation: cached.payload.suffixExplanation,
    source: cached.confidenceScore >= 0.85 ? "proprio" : cached.source,
    confidenceScore: cached.confidenceScore,
    lemmaId: cached.lemmaId,
    explanationCacheId: cached.id,
  };
}

/**
 * Attache conceptId/Slug/Title depuis linguistic_knowledge (POS + aspect).
 * Pas d'heuristique sur la prose LLM. Pas d'appel LLM synchrone.
 */
async function attachConceptResolution(
  response: TWordExplanationResponseExtended,
): Promise<TWordExplanationResponseExtended> {
  const knowledge = await getKnowledgeForConceptResolution({
    lemmaId: response.lemmaId,
    lemmaForm: response.lemma,
  });

  if (!knowledge?.partOfSpeech || knowledge.partOfSpeech === "unknown") {
    console.info(
      `[Concept Resolution] Pas de linguistic_knowledge utilisable pour lemme « ${response.lemma} » (${response.lemmaId}) — bootstrap requis`,
    );
    return response;
  }

  const profile = buildLinguisticProfile(knowledge);

  if (!profile.partOfSpeech) {
    console.info(
      `[Concept Resolution] POS absent après profil pour lemme « ${response.lemma} » (${response.lemmaId}) — bootstrap requis`,
    );
    return response;
  }

  const concept = resolveReaderConceptFromSignals({
    partOfSpeech: profile.partOfSpeech,
    aspect: profile.aspect,
    gender: profile.gender,
    movementType: profile.movementType,
    morphology: profile.morphology,
    paradigms: profile.paradigms,
    surface: response.surface,
    lemma: response.lemma,
    explanation: response.explanation,
    suffixExplanation: response.suffixExplanation,
  });

  if (!concept) {
    return response;
  }

  return {
    ...response,
    conceptId: concept.conceptId,
    conceptSlug: concept.conceptSlug,
    conceptTitle: concept.conceptTitle,
    conceptSummary: concept.conceptSummary,
  };
}

export async function explainWord(
  request: TWordExplanationRequest,
): Promise<TWordExplanationResponseExtended> {
  const { surface, sentence } = request;
  const contextHash = computeContextHash(surface, sentence);
  const cached = await getCachedExplanation(contextHash);

  if (cached) {
    const response = await attachConceptResolution(
      mapCacheToResponse(cached, surface),
    );

    void incrementUsageCount(cached.id, cached.usageCount).catch(() => undefined);

    return response;
  }

  const llmPayload = await generateWordExplanation(surface, sentence);
  const lemmaId = await resolveOrCreateLemma(llmPayload.lemma);
  const explanationCacheId = await storeExplanationInCache({
    contextHash,
    lemmaId,
    surface,
    sentence,
    payload: llmPayload,
  });

  return attachConceptResolution({
    surface,
    lemma: llmPayload.lemma,
    lemmaStressed: llmPayload.lemmaStressed,
    translation: llmPayload.translation,
    functionalRole: llmPayload.functionalRole,
    functionColor: llmPayload.functionColor,
    explanation: llmPayload.explanation,
    suffix: llmPayload.suffix,
    suffixExplanation: llmPayload.suffixExplanation,
    source: "api",
    confidenceScore: 0.5,
    lemmaId,
    explanationCacheId,
  });
}

export type { TWordExplanationRequest, TWordExplanationResponseExtended };
