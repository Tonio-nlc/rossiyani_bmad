import {
  ensureConceptGraphHydrated,
  resolveReaderConceptFromSignals,
} from "@/lib/knowledge/concept-graph";
import { buildLinguisticProfile } from "@/lib/knowledge/build-linguistic-profile";
import { getKnowledgeForConceptResolution } from "@/lib/knowledge/get-knowledge";
import { resolveCuratedLemmaFromSurface } from "@/lib/knowledge/morphology/curated";
import {
  getCachedExplanation,
  incrementUsageCount,
  resolveOrCreateLemma,
  storeExplanationInCache,
} from "@/lib/orchestrator/cache";
import { generateWordExplanation } from "@/lib/orchestrator/llm";
import { computeContextHash } from "@/lib/orchestrator/hasher";
import type {
  TLlmExplanationPayload,
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
 * Corrige lemma / lemmaStressed depuis la morphologie curée
 * (ex. пойдём → пойти́). Autorité : curated, pas le LLM.
 */
function applyCuratedLemmaToPayload(
  surface: string,
  payload: TLlmExplanationPayload,
): TLlmExplanationPayload {
  const curated = resolveCuratedLemmaFromSurface(surface);

  if (!curated) {
    return payload;
  }

  return {
    ...payload,
    lemma: curated.lemma,
    lemmaStressed: curated.lemma,
  };
}

async function applyCuratedLemmaToResponse(
  response: TWordExplanationResponseExtended,
): Promise<TWordExplanationResponseExtended> {
  const curated = resolveCuratedLemmaFromSurface(response.surface);

  if (!curated) {
    return response;
  }

  const lemmaId = await resolveOrCreateLemma(curated.lemma);

  return {
    ...response,
    lemma: curated.lemma,
    lemmaStressed: curated.lemma,
    lemmaId,
  };
}

/**
 * Attache concept + POS/aspect depuis linguistic_knowledge.
 * Les verbes n'ont pas de rôle fonctionnel (sujet/objet…) : on le retire ici.
 */
async function attachConceptResolution(
  response: TWordExplanationResponseExtended,
  sentence: string,
): Promise<TWordExplanationResponseExtended> {
  await ensureConceptGraphHydrated();

  const curatedSurface = resolveCuratedLemmaFromSurface(response.surface);
  const knowledge = await getKnowledgeForConceptResolution({
    lemmaId: response.lemmaId,
    lemmaForm: response.lemma,
  });

  const profile = knowledge?.partOfSpeech && knowledge.partOfSpeech !== "unknown"
    ? buildLinguisticProfile(knowledge)
    : null;

  if (!profile?.partOfSpeech && !curatedSurface) {
    if (!knowledge?.partOfSpeech || knowledge.partOfSpeech === "unknown") {
      console.info(
        `[Concept Resolution] Pas de linguistic_knowledge utilisable pour lemme « ${response.lemma} » (${response.lemmaId}) — bootstrap requis`,
      );
    }

    return response;
  }

  const partOfSpeech = profile?.partOfSpeech ?? "verb";
  const aspect = profile?.aspect ?? null;
  const isVerb = partOfSpeech === "verb" || Boolean(curatedSurface);

  const withPos: TWordExplanationResponseExtended = {
    ...response,
    partOfSpeech,
    aspect,
    ...(isVerb
      ? {
          functionalRole: "",
          functionColor: "",
        }
      : {}),
  };

  if (!profile?.partOfSpeech) {
    return withPos;
  }

  const concept = resolveReaderConceptFromSignals({
    partOfSpeech: profile.partOfSpeech,
    aspect: profile.aspect,
    gender: profile.gender,
    movementType: profile.movementType,
    morphology: profile.morphology,
    paradigms: profile.paradigms,
    surface: withPos.surface,
    lemma: withPos.lemma,
    explanation: withPos.explanation,
    suffixExplanation: withPos.suffixExplanation,
    sentence,
  });

  if (!concept) {
    return withPos;
  }

  return {
    ...withPos,
    conceptId: concept.conceptId,
    conceptSlug: concept.conceptSlug,
    conceptTitle: concept.conceptTitle,
    conceptSummary: concept.conceptSummary,
    ...(concept.prepositionGovernment
      ? {
          conceptPreposition: concept.prepositionGovernment.preposition,
          conceptGovernedCase: concept.prepositionGovernment.governedCase,
        }
      : {}),
  };
}

export async function explainWord(
  request: TWordExplanationRequest,
): Promise<TWordExplanationResponseExtended> {
  const { surface, sentence } = request;
  const contextHash = computeContextHash(surface, sentence);
  const cached = await getCachedExplanation(contextHash);

  if (cached) {
    const withLemma = await applyCuratedLemmaToResponse(
      mapCacheToResponse(cached, surface),
    );
    const response = await attachConceptResolution(withLemma, sentence);

    void incrementUsageCount(cached.id, cached.usageCount).catch(() => undefined);

    return response;
  }

  const llmRaw = await generateWordExplanation(surface, sentence);
  const llmPayload = applyCuratedLemmaToPayload(surface, llmRaw);
  const lemmaId = await resolveOrCreateLemma(llmPayload.lemma);
  const explanationCacheId = await storeExplanationInCache({
    contextHash,
    lemmaId,
    surface,
    sentence,
    payload: llmPayload,
  });

  return attachConceptResolution(
    {
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
    },
    sentence,
  );
}

export type { TWordExplanationRequest, TWordExplanationResponseExtended };
