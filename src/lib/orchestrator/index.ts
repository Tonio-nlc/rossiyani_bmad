import {
  CLEAR_ROLE_BADGE_OVERRIDE,
  deriveGenitiveTriggerRoleOverride,
  deriveInstrumentRoleOverride,
  derivePronounRoleOverride,
  ensureConceptGraphHydrated,
  FIXED_EXPRESSION_FUNCTIONAL_ROLE,
  resolveCuratedFactPromptHint,
  resolveReaderConceptFromSignals,
} from "@/lib/knowledge/concept-graph";
import { buildLinguisticProfile } from "@/lib/knowledge/build-linguistic-profile";
import { getKnowledgeForConceptResolution } from "@/lib/knowledge/get-knowledge";
import {
  getCuratedPastTenseSuffix,
  isCuratedInvariableSurface,
  isCuratedPrepositionSurface,
  isCuratedPronounSurface,
  isDeterministicVerbForRoleClear,
  resolveCuratedLemmaFromSurface,
} from "@/lib/knowledge/morphology/curated";
import {
  getCachedExplanation,
  getLemmaFormById,
  incrementUsageCount,
  resolveOrCreateLemma,
  storeExplanationInCache,
} from "@/lib/orchestrator/cache";
import { generateWordExplanation } from "@/lib/orchestrator/llm";
import { computeContextHash } from "@/lib/orchestrator/hasher";
import { createPerfTimer, type TPerfMark } from "@/lib/utils/perf-timer";
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
 * Applique l'override déterministe "moyen/instrument" si le cas instrumental
 * est confirmé de façon fiable (régence ou forme curée univoque). Ne s'applique
 * jamais aux verbes (pas de rôle fonctionnel). Logique partagée : voir
 * deriveInstrumentRoleOverride (concept-graph/resolve-reader-concept.ts).
 *
 * Ne dépend PAS strictement de `profile` : la détection par forme curée
 * (ex. ка́ртой, А́нной) et par régence prépositionnelle fonctionne sur la
 * seule surface/phrase, donc doit s'appliquer même quand `linguistic_knowledge`
 * n'est pas encore bootstrappé pour ce lemme (profile = null).
 */
function applyInstrumentRoleOverride(
  response: TWordExplanationResponseExtended,
  profile: TLinguisticProfile | null,
  sentence: string,
): TWordExplanationResponseExtended {
  const override = deriveInstrumentRoleOverride({
    surface: response.surface,
    sentence,
    partOfSpeech: response.partOfSpeech ?? profile?.partOfSpeech ?? null,
    paradigms: profile?.paradigms ?? null,
    morphology: profile?.morphology ?? null,
    functionalRole: response.functionalRole,
    explanation: response.explanation,
  });

  if (!override) {
    return response;
  }

  return { ...response, ...override };
}

/**
 * Pronoms personnels/réfléchi curés (я/ты/он…/себя́) : paradigme fermé, cf.
 * morphology/curated/pronouns.ts. Corrige deux bugs LLM à la source (ex.
 * меня́ segmenté "мен-" + "я" avec un rôle "possession" erroné) :
 * - aucune segmentation LLM affichée (меня́ est une forme supplétive, pas
 *   radical + désinence régulière) ;
 * - rôle/couleur dérivés du CAS résolu par le paradigme, jamais de la prose
 *   LLM (cf. derivePronounRoleOverride — génitif ≠ "possession" pour ces mots).
 * Ne s'applique qu'aux formes curées (porte `isCuratedPronounSurface`) :
 * aucun effet sur le reste du vocabulaire.
 */
function applyPronounRoleOverride(
  response: TWordExplanationResponseExtended,
  sentence: string,
): TWordExplanationResponseExtended {
  if (!isCuratedPronounSurface(response.surface)) {
    return response;
  }

  const override = derivePronounRoleOverride({
    surface: response.surface,
    sentence,
    functionalRole: response.functionalRole,
    explanation: response.explanation,
  });

  return {
    ...response,
    partOfSpeech: "pronoun",
    suffix: "",
    suffixExplanation: "",
    ...(override ?? {}),
  };
}

function readAnimacyFromProfile(
  profile: TLinguisticProfile | null,
): "animate" | "inanimate" | null {
  const raw = profile?.morphology?.animacy;

  if (raw === "animate" || raw === "inanimate") {
    return raw;
  }

  return null;
}

/**
 * Génitif par déclencheur (après/из/у/без/numéral/figé) — même rail que les
 * pronoms, appliqué aussi aux noms. Ne dépend PAS d'un profil bootstrappé :
 * la régence et les listes curées suffisent (évite le bug historique où
 * l'override ne touchait que les lemmes déjà en linguistic_knowledge).
 */
function applyGenitiveTriggerRoleOverride(
  response: TWordExplanationResponseExtended,
  profile: TLinguisticProfile | null,
  sentence: string,
): TWordExplanationResponseExtended {
  const override = deriveGenitiveTriggerRoleOverride({
    surface: response.surface,
    sentence,
    partOfSpeech: response.partOfSpeech ?? profile?.partOfSpeech ?? null,
    paradigms: profile?.paradigms ?? null,
    morphology: profile?.morphology ?? null,
    functionalRole: response.functionalRole,
    explanation: response.explanation,
    animacy: readAnimacyFromProfile(profile),
    isCuratedPronoun: false,
  });

  if (!override) {
    return response;
  }

  // Expression figée : aucun badge de terminaison (pas une désinence analysable).
  if (override.functionalRole === FIXED_EXPRESSION_FUNCTIONAL_ROLE) {
    return {
      ...response,
      ...override,
      suffix: "",
      suffixExplanation: "",
    };
  }

  return { ...response, ...override };
}

/** Aucun badge — même sémantique que le chemin verbe. */
function clearRoleBadgeOnResponse(
  response: TWordExplanationResponseExtended,
): TWordExplanationResponseExtended {
  return {
    ...response,
    ...CLEAR_ROLE_BADGE_OVERRIDE,
    suffix: "",
    suffixExplanation: "",
  };
}

/**
 * Point d'entrée unique des overrides déterministes de rôle/couleur.
 * Prépositions / invariables d'abord (aucun badge — la préposition reste
 * déclencheur pour le mot gouverné via getPrecedingPrepositionEntry) ;
 * puis pronoms ; génitif ; instrumental.
 */
function applyDeterministicRoleOverride(
  response: TWordExplanationResponseExtended,
  profile: TLinguisticProfile | null,
  sentence: string,
): TWordExplanationResponseExtended {
  // AVANT toute autre dérivation : une préposition cliquée n'a pas de rôle.
  if (isCuratedPrepositionSurface(response.surface)) {
    return clearRoleBadgeOnResponse(response);
  }

  if (isCuratedInvariableSurface(response.surface)) {
    return clearRoleBadgeOnResponse(response);
  }

  if (isCuratedPronounSurface(response.surface)) {
    return applyPronounRoleOverride(response, sentence);
  }

  const withGenitive = applyGenitiveTriggerRoleOverride(
    response,
    profile,
    sentence,
  );

  if (
    withGenitive.functionalRole !== response.functionalRole ||
    withGenitive.functionColor !== response.functionColor
  ) {
    return withGenitive;
  }

  return applyInstrumentRoleOverride(response, profile, sentence);
}

/**
 * Attache concept + POS/aspect depuis linguistic_knowledge.
 * Les verbes n'ont pas de rôle fonctionnel (sujet/objet…) : on le retire ici.
 *
 * `mark` optionnel — décomposition fine (diagnostic perf cache HIT, cf.
 * docs/knowledge/perf-cache-hit-diagnostic.md) : chaque étape asynchrone est
 * chronométrée séparément pour distinguer hydratation du Concept Graph,
 * lecture linguistic_knowledge (avec repli sur lemmes équivalents) et
 * résolution de concept (pure, en mémoire).
 */
async function attachConceptResolution(
  response: TWordExplanationResponseExtended,
  sentence: string,
  mark: TPerfMark = () => undefined,
): Promise<TWordExplanationResponseExtended> {
  const curatedSurface = resolveCuratedLemmaFromSurface(response.surface);

  // Perf : ces deux lectures sont indépendantes (hydratation Concept Graph en
  // mémoire vs linguistic_knowledge en DB) — les paralléliser évite de payer
  // les deux latences en série, surtout sur un process/instance à froid où
  // l'hydratation n'est pas encore mise en cache.
  const [, knowledge] = await Promise.all([
    ensureConceptGraphHydrated(),
    getKnowledgeForConceptResolution({
      lemmaId: response.lemmaId,
      lemmaForm: response.lemma,
    }),
  ]);
  mark("  ensureConceptGraphHydrated + getKnowledgeForConceptResolution (parallèle)");

  const profile = knowledge?.partOfSpeech && knowledge.partOfSpeech !== "unknown"
    ? buildLinguisticProfile(knowledge)
    : null;

  if (!profile?.partOfSpeech && !curatedSurface) {
    if (!knowledge?.partOfSpeech || knowledge.partOfSpeech === "unknown") {
      console.info(
        `[Concept Resolution] Pas de linguistic_knowledge utilisable pour lemme « ${response.lemma} » (${response.lemmaId}) — bootstrap requis`,
      );
    }

    // Le profil complet manque encore (knowledge non bootstrappée), mais les
    // overrides déterministes (pronom curé / instrumental) ne dépendent pas
    // du profil : on tente quand même avant d'abandonner la résolution.
    const overridden = applyDeterministicRoleOverride(response, profile, sentence);
    mark("  applyDeterministicRoleOverride (sans profil)");

    return overridden;
  }

  const aspect = profile?.aspect ?? null;
  // Même critère partagé que la carte vocabulaire (isDeterministicVerbForRoleClear).
  const isVerb = isDeterministicVerbForRoleClear({
    surface: response.surface,
    partOfSpeech: profile?.partOfSpeech ?? null,
  });
  // Profil absent mais forme curée verbale → POS « verb » (filet morphologie).
  const partOfSpeech = profile?.partOfSpeech ?? "verb";
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

  // Override rôle AVANT la résolution de concept : un fixed_expression ne doit
  // jamais recevoir « Régence des prépositions » ni une décomposition de cas.
  const withRole = applyDeterministicRoleOverride(withPos, profile, sentence);
  mark("  applyDeterministicRoleOverride");

  if (
    !profile?.partOfSpeech ||
    withRole.functionalRole === FIXED_EXPRESSION_FUNCTIONAL_ROLE
  ) {
    return withRole;
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
    surface: withRole.surface,
    lemma: withRole.lemma,
    explanation: withRole.explanation,
    suffixExplanation: withRole.suffixExplanation,
    functionalRole: withRole.functionalRole,
    sentence,
  });
  mark("  resolveReaderConceptFromSignals");

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
    // attachConceptResolution logue ses propres sous-étapes (préfixées "  ")
    // via `mark` ; le total cumulé reste visible sur le mark suivant.
    const response = await attachConceptResolution(withLemma, sentence, mark);

    void incrementUsageCount(cached.id, cached.usageCount).catch(() => undefined);

    mark("total (avant sérialisation JSON par la route)");

    return response;
  }

  // Fait curé (pronom OU déclencheur génitif) injecté en message USER —
  // bloc FAIT GRAMMATICAL CERTAIN — avant l'appel LLM.
  const curatedFactHint = resolveCuratedFactPromptHint({ surface, sentence });
  const llmRaw = await generateWordExplanation(surface, sentence, curatedFactHint);
  mark("LLM generateWordExplanation");
  const llmPayload = applyCuratedLemmaToPayload(surface, llmRaw);
  const lemmaId = await resolveOrCreateLemma(llmPayload.lemma);
  mark("resolveOrCreateLemma");
  // Affichage : `lemmas.form` prime sur lemmaStressed LLM (ex. по́сле vs послé).
  const lemmaFormFromDb = await getLemmaFormById(lemmaId);
  mark("getLemmaFormById");
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
      lemma: lemmaFormFromDb ?? llmPayload.lemma,
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
    mark,
  );
  mark("total (avant sérialisation JSON par la route)");

  return response;
}

export type { TWordExplanationRequest, TWordExplanationResponseExtended };
