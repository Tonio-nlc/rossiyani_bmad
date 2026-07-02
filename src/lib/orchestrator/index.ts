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

export async function explainWord(
  request: TWordExplanationRequest,
): Promise<TWordExplanationResponseExtended> {
  const { surface, sentence } = request;
  const contextHash = computeContextHash(surface, sentence);
  const cached = await getCachedExplanation(contextHash);

  if (cached) {
    const response = mapCacheToResponse(cached, surface);

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

  return {
    surface,
    lemma: llmPayload.lemma,
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
  };
}

export type { TWordExplanationRequest, TWordExplanationResponseExtended };
