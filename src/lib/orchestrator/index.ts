import {
  deriveInstrumentRoleOverride,
  ensureConceptGraphHydrated,
  resolveReaderConceptFromSignals,
} from "@/lib/knowledge/concept-graph";
import { buildLinguisticProfile } from "@/lib/knowledge/build-linguistic-profile";
import { getKnowledgeForConceptResolution } from "@/lib/knowledge/get-knowledge";
import {
  getCuratedPastTenseSuffix,
  resolveCuratedLemmaFromSurface,
} from "@/lib/knowledge/morphology/curated";
import {
  getCachedExplanation,
  incrementUsageCount,
  resolveOrCreateLemma,
  storeExplanationInCache,
} from "@/lib/orchestrator/cache";
import { generateWordExplanation } from "@/lib/orchestrator/llm";
import { computeContextHash } from "@/lib/orchestrator/hasher";
import { createPerfTimer } from "@/lib/utils/perf-timer";
import type { TLinguisticProfile } from "@/types/knowledge";
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
 * POS pour lesquels aucune segmentation radical/désinence fiable n'existe
 * aujourd'hui (ni morphologie curée, ni paradigme déterministe) :
 * - adverbe / conjonction / particule / interjection / numéral : invariables,
 *   une désinence serait par construction fabriquée.
 * - pronom : aucune table de déclinaison curée pour l'instant (никто́, кто,
 *   что…) — dégradation propre plutôt qu'un découpage LLM inventé (ex.
 *   "-о" présenté comme désinence du nominatif, qui n'existe pas).
 * Étape 2/4 — résolution non-nominale : si une segmentation fiable existe un
 * jour pour l'un de ces POS, la retirer explicitement de cette liste.
 */
const POS_WITHOUT_RELIABLE_SUFFIX = new Set([
  "adverb",
  "conjunction",
  "particle",
  "interjection",
  "numeral",
  "pronoun",
]);

/**
 * Applique l'override "moyen" quand le cas instrumental est connu de façon fiable.
 * Ne s'applique jamais aux verbes (pas de rôle fonctionnel). Logique partagée :
 * voir deriveInstrumentRoleOverride (concept-graph/resolve-reader-concept.ts).
 */
function applyInstrumentRoleOverride(
  response: TWordExplanationResponseExtended,
  profile: TLinguisticProfile | null,
  sentence: string,
): TWordExplanationResponseExtended {
  if (!profile) {
    return response;
  }

  const override = deriveInstrumentRoleOverride({
    surface: response.surface,
    sentence,
    partOfSpeech: response.partOfSpeech,
    paradigms: profile.paradigms,
    morphology: profile.morphology,
    functionalRole: response.functionalRole,
    explanation: response.explanation,
  });

  if (!override) {
    return response;
  }

  return { ...response, ...override };
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
  const hasNoReliableSuffix = POS_WITHOUT_RELIABLE_SUFFIX.has(partOfSpeech);
  // Découpe radical/désinence du passé : n'écrase la sortie LLM (souvent fausse,
  // ex. нашёл -> "ёл") que lorsque la morphologie curée confirme la forme exacte.
  // Sinon, on ne touche à rien plutôt que de risquer une découpe non fiable.
  const reliablePastSuffix = curatedSurface
    ? getCuratedPastTenseSuffix(curatedSurface, response.surface)
    : null;

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
    ...(hasNoReliableSuffix
      ? {
          suffix: "",
          suffixExplanation: "",
        }
      : {}),
    ...(reliablePastSuffix
      ? {
          suffix: reliablePastSuffix.suffix,
          suffixExplanation: reliablePastSuffix.suffixExplanation,
        }
      : {}),
  };

  if (!profile?.partOfSpeech) {
    return applyInstrumentRoleOverride(withPos, profile, sentence);
  }

  const concept = resolveReaderConceptFromSignals({
    partOfSpeech: profile.partOfSpeech,
    aspect: profile.aspect,
    gender: profile.gender,
    movementType: profile.movementType,
    animacy:
      profile.morphology.animacy === "animate" ||
      profile.morphology.animacy === "inanimate"
        ? profile.morphology.animacy
        : null,
    morphology: profile.morphology,
    paradigms: profile.paradigms,
    surface: withPos.surface,
    lemma: withPos.lemma,
    explanation: withPos.explanation,
    suffixExplanation: withPos.suffixExplanation,
    functionalRole: withPos.functionalRole,
    sentence,
  });

  const withRole = applyInstrumentRoleOverride(withPos, profile, sentence);

  if (!concept) {
    return withRole;
  }

  return {
    ...withRole,
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
  const mark = createPerfTimer(`explain:${surface}`);
  const contextHash = computeContextHash(surface, sentence);
  const cached = await getCachedExplanation(contextHash);
  mark(`cache lookup (${cached ? "hit" : "miss"})`);

  if (cached) {
    const withLemma = await applyCuratedLemmaToResponse(
      mapCacheToResponse(cached, surface),
    );
    mark("applyCuratedLemmaToResponse");
    const response = await attachConceptResolution(withLemma, sentence);
    mark("attachConceptResolution");

    void incrementUsageCount(cached.id, cached.usageCount).catch(() => undefined);

    mark("total (avant sérialisation JSON par la route)");

    return response;
  }

  const llmRaw = await generateWordExplanation(surface, sentence);
  mark("LLM generateWordExplanation");
  const llmPayload = applyCuratedLemmaToPayload(surface, llmRaw);
  const lemmaId = await resolveOrCreateLemma(llmPayload.lemma);
  mark("resolveOrCreateLemma");
  const explanationCacheId = await storeExplanationInCache({
    contextHash,
    lemmaId,
    surface,
    sentence,
    payload: llmPayload,
  });
  mark("storeExplanationInCache");

  const response = await attachConceptResolution(
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
  mark("attachConceptResolution");
  mark("total (avant sérialisation JSON par la route)");

  return response;
}

export type { TWordExplanationRequest, TWordExplanationResponseExtended };
