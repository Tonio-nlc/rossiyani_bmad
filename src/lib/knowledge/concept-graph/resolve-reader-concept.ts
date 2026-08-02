import type { TLinguisticAnalysis } from "@/lib/knowledge/teaching/analyze-linguistic-context";
import {
  detectPrepositionGovernment,
  findCuratedFixedExpression,
  findPronounLemmaForCase,
  getPrecedingNormalizedToken,
  getPrecedingPrepositionEntry,
  isCuratedGenitiveGoverningNumeral,
  isCuratedPronounSurface,
  NEVER_POSSESSIVE_PRONOUN_HINT,
  stripStressMarks,
  type TGovernedCase,
} from "@/lib/knowledge/morphology/curated";
import { normalizeToken } from "@/lib/utils/russian";
import type { TLinguisticProfile } from "@/types/knowledge";
import type { TVocabularyContextEncounter } from "@/types/vocabulary";

import {
  inferAnimacyFromCurated,
  inferMorphologicalCase,
  type TMorphologicalCase,
} from "./case-concept-routing";
import {
  matchConceptSignals,
  type TConceptMatchProfile,
} from "./match-signals";
import { getConceptById } from "./registry";
import { NO_CONCEPT_ID, resolveConceptGraph } from "./resolve-concept-graph";

/** Override déterministe rôle/couleur. Couleur "" = aucune pastille colorée. */
export type TDeterministicRoleOverride = {
  functionalRole: string;
  functionColor: string;
};

export interface TReliableCaseDetection {
  /** null = cas non déterminé de façon fiable (pas de paradigme/curated/régence). */
  morphologicalCase: TMorphologicalCase | null;
  government: { preposition: string; governedCase: string } | null;
}

/**
 * Détecte le cas morphologique à partir de sources fiables uniquement :
 * paradigmes `linguistic_knowledge`, morphologie curée, ou régence
 * prépositionnelle déterministe. Jamais une prose LLM non sourcée.
 * Réutilisé par la résolution de concept ET par tout override de rôle
 * fonctionnel dérivé du cas (ex. instrumental → "moyen").
 */
export function detectReliableCase(input: {
  surface?: string | null;
  sentence?: string | null;
  paradigms?: TLinguisticProfile["paradigms"] | null;
  morphology?: TLinguisticProfile["morphology"] | null;
  functionalRole?: string | null;
  explanation?: string | null;
}): TReliableCaseDetection {
  const caseEntries = [
    ...(input.paradigms?.cases ?? []),
    ...(input.morphology?.caseParadigm ?? []),
  ];

  const government =
    input.surface && input.sentence
      ? detectPrepositionGovernment({
          surface: input.surface,
          sentence: input.sentence,
          morphologicalCase: null,
        })
      : null;

  // Régence sense-dependent (с/за/под…) non tranchée ci-dessus (le cas est
  // encore inconnu) : on récupère quand même ses cas possibles pour permettre
  // une désambiguïsation par intersection sur les pronoms curés (ей/ней…).
  const precedingPrepositionEntry =
    input.surface && input.sentence
      ? getPrecedingPrepositionEntry(input.surface, input.sentence)
      : null;

  const morphologicalCase = input.surface
    ? inferMorphologicalCase({
        surface: input.surface,
        caseEntries,
        functionalRole: input.functionalRole,
        governmentCase: (government?.governedCase ?? null) as TGovernedCase | null,
        governmentCandidateCases: precedingPrepositionEntry?.cases ?? null,
        explanation: input.explanation ?? null,
      })
    : null;

  // Re-détecte la régence avec le cas connu (в/на sense-dependent).
  const governmentResolved =
    input.surface && input.sentence
      ? detectPrepositionGovernment({
          surface: input.surface,
          sentence: input.sentence,
          morphologicalCase:
            morphologicalCase && morphologicalCase !== "nominative"
              ? morphologicalCase
              : null,
        })
      : null;

  return {
    morphologicalCase,
    government: governmentResolved
      ? {
          preposition: governmentResolved.preposition,
          governedCase: governmentResolved.governedCase,
        }
      : null,
  };
}

/**
 * 6e rôle fonctionnel : "moyen/instrument", dérivé du cas instrumental.
 * Contrairement aux 5 autres rôles (choisis librement par le LLM par phrase),
 * celui-ci n'est JAMAIS une devinette LLM : il n'écrase functionalRole/functionColor
 * que si detectReliableCase() a établi le cas instrumental depuis une source fiable
 * (paradigme linguistic_knowledge, morphologie curée, ou régence prépositionnelle
 * déterministe). Si le cas n'est pas connu de façon fiable, aucun override.
 *
 * Source UNIQUE de vérité pour cet override — réutilisée par l'orchestrateur
 * (Reader/Explorer) ET par la fiche vocabulaire (carte "rencontre"), pour que les
 * 3 surfaces affichent toujours un rôle cohérent. Ne pas dupliquer cette logique.
 */
export const INSTRUMENT_FUNCTIONAL_ROLE = "instrument";
export const INSTRUMENT_FUNCTION_COLOR = "teal";

export interface TInstrumentRoleOverrideInput {
  surface?: string | null;
  sentence?: string | null;
  /** Les verbes n'ont pas de rôle fonctionnel : jamais d'override sur un verbe. */
  partOfSpeech?: string | null;
  paradigms?: TLinguisticProfile["paradigms"] | null;
  morphology?: TLinguisticProfile["morphology"] | null;
  functionalRole?: string | null;
  explanation?: string | null;
}

/**
 * Dérive l'override "moyen" (rôle + couleur) quand le cas instrumental est connu
 * de façon fiable. Retourne `null` si aucun override ne s'applique (verbe, ou cas
 * non fiable) : le rôle/couleur d'origine doivent alors rester inchangés.
 */
export function deriveInstrumentRoleOverride(
  input: TInstrumentRoleOverrideInput,
): TDeterministicRoleOverride | null {
  if (input.partOfSpeech === "verb") {
    return null;
  }

  const { morphologicalCase } = detectReliableCase({
    surface: input.surface,
    sentence: input.sentence,
    paradigms: input.paradigms,
    morphology: input.morphology,
    functionalRole: input.functionalRole,
    explanation: input.explanation,
  });

  if (morphologicalCase !== "instrumental") {
    return null;
  }

  return {
    functionalRole: INSTRUMENT_FUNCTIONAL_ROLE,
    functionColor: INSTRUMENT_FUNCTION_COLOR,
  };
}

/**
 * Rôle/couleur pour un pronom personnel/réfléchi curé.
 *
 * Pour le génitif : DÉCLENCHEUR D'ABORD (préposition / numéral / expression
 * figée via getPrecedingPrepositionEntry + tables curées) — jamais « génitif
 * ⇒ location » en bloc. Le génitif russe porte plusieurs fonctions
 * (possession-existence après у + pronom, temps après после, privation après
 * без, quantité après un numéral, formule figée до свида́ния…). Une couleur
 * unique « lieu » contredirait la prose de la même fiche.
 *
 * Pour les autres cas, mapping fixe du paradigme fermé :
 * - nominatif → sujet (bleu)
 * - accusatif → objet direct (corail)
 * - datif → destinataire (ambre)
 * - instrumental → moyen (teal), identique à deriveInstrumentRoleOverride
 * - prépositionnel → "indique où" (vert)
 * - génitif sans déclencheur listé → repli location/green (comportement
 *   historique hors table déclencheur)
 */
const PRONOUN_CASE_ROLE_OVERRIDE: Record<
  Exclude<TMorphologicalCase, "genitive">,
  TDeterministicRoleOverride
> = {
  nominative: { functionalRole: "subject", functionColor: "blue" },
  accusative: { functionalRole: "object_direct", functionColor: "coral" },
  dative: { functionalRole: "object_indirect", functionColor: "amber" },
  instrumental: {
    functionalRole: INSTRUMENT_FUNCTIONAL_ROLE,
    functionColor: INSTRUMENT_FUNCTION_COLOR,
  },
  prepositional: { functionalRole: "location", functionColor: "green" },
};

/** Repli génitif sans déclencheur reconnu — inchangé pour les pronoms. */
const GENITIVE_FALLBACK_PRONOUN: TDeterministicRoleOverride = {
  functionalRole: "location",
  functionColor: "green",
};

export const QUANTITY_FUNCTIONAL_ROLE = "quantity";
export const FIXED_EXPRESSION_FUNCTIONAL_ROLE = "fixed_expression";

/**
 * Aucun badge (même sémantique que le chemin verbe de l'orchestrateur :
 * functionalRole "" + functionColor "").
 */
export const CLEAR_ROLE_BADGE_OVERRIDE: TDeterministicRoleOverride = {
  functionalRole: "",
  functionColor: "",
};

export interface TGenitiveTriggerRoleOverrideInput {
  surface?: string | null;
  sentence?: string | null;
  partOfSpeech?: string | null;
  paradigms?: TLinguisticProfile["paradigms"] | null;
  morphology?: TLinguisticProfile["morphology"] | null;
  functionalRole?: string | null;
  explanation?: string | null;
  /**
   * Animacy morphologique connue (`animate` | `inanimate`), sinon null =
   * inconnu. Ne jamais inférer ici.
   */
  animacy?: "animate" | "inanimate" | null;
  /** true si la surface est un pronom personnel/réfléchi curé. */
  isCuratedPronoun?: boolean;
}

/**
 * Dérivation GÉNITIF par déclencheur (préposition / numéral / expression figée).
 * Source UNIQUE — Reader/Explorer (orchestrateur) ET carte vocabulaire.
 * Réutilise getPrecedingPrepositionEntry / getPrecedingNormalizedToken : aucune
 * détection parallèle de la préposition.
 *
 * Table (génitif) :
 * - у + pronom curé → possession / violet
 * - у + nom inanimé → location / green
 * - у + nom, animacy inconnue → location / green (NE PAS DEVINER)
 * - у + nom animé → possession / violet — branche présente mais inactive tant
 *   que animacy vaut « inconnu ». « У врача́ » restera FAUX (location) jusqu'à
 *   peuplement de l'animacy (dépendance chantier morphologie).
 * - после → time / green
 * - из → location / green
 * - без → aucun badge (CLEAR_ROLE_BADGE_OVERRIDE)
 * - numéral précédent → quantity, couleur vidée
 * - до + expression figée → fixed_expression, couleur vidée
 * - nom + génitif (adnominal) / aucun déclencheur → null (comportement actuel
 *   inchangé : LLM pour les noms ; repli pronom géré par l'appelant)
 */
export function deriveGenitiveTriggerRoleOverride(
  input: TGenitiveTriggerRoleOverrideInput,
): TDeterministicRoleOverride | null {
  if (input.partOfSpeech === "verb" || !input.surface || !input.sentence) {
    return null;
  }

  const precedingRaw = getPrecedingNormalizedToken(input.surface, input.sentence);
  const precedingKey = precedingRaw
    ? stripStressMarks(normalizeToken(precedingRaw))
    : null;
  const surfaceKey = stripStressMarks(normalizeToken(input.surface));

  // Expression figée : matching explicite avant même d'exiger le cas
  // (до свида́ния). La préposition vient du même rail que la régence.
  if (precedingKey && surfaceKey) {
    const fixed = findCuratedFixedExpression(precedingKey, surfaceKey);

    if (fixed) {
      return {
        functionalRole: FIXED_EXPRESSION_FUNCTIONAL_ROLE,
        functionColor: "",
      };
    }
  }

  // Numéral précédent (ex. де́сять часо́в) : le numéral curé EST le déclencheur
  // — pas besoin d'un paradigme confirmant le génitif (souvent absent hors bootstrap).
  if (precedingKey && isCuratedGenitiveGoverningNumeral(precedingKey)) {
    return {
      functionalRole: QUANTITY_FUNCTIONAL_ROLE,
      functionColor: "",
    };
  }

  const { morphologicalCase } = detectReliableCase({
    surface: input.surface,
    sentence: input.sentence,
    paradigms: input.paradigms,
    morphology: input.morphology,
    functionalRole: input.functionalRole,
    explanation: input.explanation,
  });

  if (morphologicalCase !== "genitive") {
    return null;
  }

  const prepEntry = getPrecedingPrepositionEntry(input.surface, input.sentence);

  if (!prepEntry || !prepEntry.cases.includes("genitive")) {
    // Adnominal / aucun déclencheur listé : ne pas forcer — LLM (noms) ou
    // repli pronom chez l'appelant. Évite aussi нет + génitif → possession.
    return null;
  }

  const prep = prepEntry.preposition;

  if (prep === "без") {
    return CLEAR_ROLE_BADGE_OVERRIDE;
  }

  if (prep === "после") {
    return { functionalRole: "time", functionColor: "green" };
  }

  if (prep === "из") {
    return { functionalRole: "location", functionColor: "green" };
  }

  if (prep === "у") {
    if (input.isCuratedPronoun) {
      return { functionalRole: "possession", functionColor: "violet" };
    }

    // Branche animée → possession : active SEULEMENT si animacy === "animate".
    // Tant que l'animacy est inconnue, on reste en location/green (ne pas
    // inférer). Conséquence : « У врача́ » restera FAUX (badge lieu) jusqu'au
    // peuplement morphologique de l'animacy — dépendance chantier morphologie.
    if (input.animacy === "animate") {
      return { functionalRole: "possession", functionColor: "violet" };
    }

    // inanimé OU inconnu → location / green (inchangé, NE DEVINE PAS)
    return { functionalRole: "location", functionColor: "green" };
  }

  // Autres prépositions au génitif (для, от, до hors figé, около…) :
  // aucun override — comportement actuel inchangé.
  return null;
}

export interface TPronounRoleOverrideInput {
  surface?: string | null;
  sentence?: string | null;
  functionalRole?: string | null;
  explanation?: string | null;
  paradigms?: TLinguisticProfile["paradigms"] | null;
  morphology?: TLinguisticProfile["morphology"] | null;
  animacy?: "animate" | "inanimate" | null;
}

/**
 * Dérive le rôle/couleur d'un pronom personnel/réfléchi curé depuis son cas
 * (paradigme fermé) et, pour le génitif, depuis le déclencheur (même table
 * que les noms). Source UNIQUE — Reader/Explorer ET carte "rencontre".
 */
export function derivePronounRoleOverride(
  input: TPronounRoleOverrideInput,
): TDeterministicRoleOverride | null {
  if (!input.surface || !isCuratedPronounSurface(input.surface)) {
    return null;
  }

  const triggerOverride = deriveGenitiveTriggerRoleOverride({
    surface: input.surface,
    sentence: input.sentence,
    paradigms: input.paradigms,
    morphology: input.morphology,
    functionalRole: input.functionalRole,
    explanation: input.explanation,
    animacy: input.animacy ?? null,
    isCuratedPronoun: true,
  });

  if (triggerOverride) {
    return triggerOverride;
  }

  const { morphologicalCase } = detectReliableCase({
    surface: input.surface,
    sentence: input.sentence,
    paradigms: input.paradigms,
    morphology: input.morphology,
    functionalRole: input.functionalRole,
    explanation: input.explanation,
  });

  if (!morphologicalCase) {
    return null;
  }

  if (morphologicalCase === "genitive") {
    return GENITIVE_FALLBACK_PRONOUN;
  }

  return PRONOUN_CASE_ROLE_OVERRIDE[morphologicalCase];
}

/** "au génitif" (consonne) mais "à l'accusatif"/"à l'instrumental" (élision
 * devant voyelle) — préfixe déjà l'article contracté pour éviter la faute. */
const CASE_LABEL_FR_WITH_ARTICLE: Record<TMorphologicalCase, string> = {
  nominative: "au nominatif",
  genitive: "au génitif",
  dative: "au datif",
  accusative: "à l'accusatif",
  instrumental: "à l'instrumental",
  prepositional: "au prépositionnel",
};

export interface TPronounCuratedFact {
  /** Forme de citation, ex. "я". */
  lemma: string;
  morphologicalCase: TMorphologicalCase;
  /** Préposition régissante immédiatement avant le mot, si détectée. */
  governingPreposition: string | null;
}

/**
 * Fait déterministe (lemme + cas) pour une forme de pronom curée — calculé
 * AVANT l'appel LLM (contrairement à derivePronounRoleOverride, appelé après
 * coup pour corriger rôle/couleur) afin d'être injecté dans le prompt et
 * empêcher le LLM d'inventer le statut grammatical du mot dans sa prose.
 * Retourne `null` si la surface n'est pas un pronom curé, ou si le cas n'a
 * pas pu être résolu de façon fiable.
 */
export function resolvePronounCuratedFact(input: {
  surface?: string | null;
  sentence?: string | null;
}): TPronounCuratedFact | null {
  if (!input.surface || !isCuratedPronounSurface(input.surface)) {
    return null;
  }

  const { morphologicalCase, government } = detectReliableCase({
    surface: input.surface,
    sentence: input.sentence,
  });

  if (!morphologicalCase) {
    return null;
  }

  const lemma = findPronounLemmaForCase(input.surface, morphologicalCase);

  if (!lemma) {
    return null;
  }

  return {
    lemma,
    morphologicalCase,
    governingPreposition: government?.preposition ?? null,
  };
}

/**
 * Construit la consigne de prompt LLM à partir du fait curé — le LLM rédige
 * toujours la prose (explanation), mais sous cette contrainte : il ne peut
 * plus qualifier le mot de "possessif", ni lui inventer un statut différent
 * du pronom personnel réellement rencontré.
 *
 * Nuance он/она́/оно́/они́ : его́/её/их doublent aussi comme déterminant
 * possessif figé ("son/sa/leur") quand ils précèdent directement un nom —
 * contrairement à меня́/тебя́/нас/вас/себя́, qui ne sont JAMAIS possessifs.
 * On ne peut donc affirmer categoriquement "jamais possessif" que pour ces
 * derniers (cf. NEVER_POSSESSIVE_PRONOUN_HINT) ; pour les 3es personnes, la
 * consigne reste correcte mais plus prudente.
 */
export function buildPronounFactPromptHint(fact: TPronounCuratedFact): string {
  const caseLabelWithArticle = CASE_LABEL_FR_WITH_ARTICLE[fact.morphologicalCase];
  const neverPossessive = NEVER_POSSESSIVE_PRONOUN_HINT[fact.lemma];

  const lines = [
    `FAIT GRAMMATICAL CERTAIN (vérifié manuellement, ne pas contredire) : ce mot est le PRONOM PERSONNEL « ${fact.lemma} » ${caseLabelWithArticle}.`,
  ];

  if (neverPossessive) {
    lines.push(
      `Ce n'est JAMAIS un déterminant possessif — le possessif de « ${fact.lemma} » est « ${neverPossessive} », un mot différent. Ne le qualifie jamais de "possessif".`,
    );
  } else {
    lines.push(
      `Ne le présente comme un déterminant possessif (« son/sa/leur ») QUE s'il précède directement un nom dans cette phrase précise ; sinon, c'est le pronom personnel complément, pas un possessif.`,
    );
  }

  if (fact.morphologicalCase === "genitive" && fact.governingPreposition === "у") {
    lines.push(
      `Ici, « у + génitif » (pronom personnel) marque le possesseur ou l'expérienceur, pas un lieu. Explique la construction sans qualifier le mot de "possessif".`,
    );
  }

  return lines.join(" ");
}

export interface TReaderConceptResolution {
  conceptId: string;
  conceptSlug: string;
  conceptTitle: string;
  conceptSummary: string;
  /** Régence détectée — pour illustration alignée sur la rencontre. */
  prepositionGovernment?: {
    preposition: string;
    governedCase: string;
  } | null;
}

function readAnimacy(
  morph: TLinguisticProfile["morphology"] | null | undefined,
): "animate" | "inanimate" | null {
  const raw = morph?.animacy;

  if (raw === "animate" || raw === "inanimate") {
    return raw;
  }

  return null;
}

export function resolveReaderConcept(input: {
  profile: TConceptMatchProfile;
  analysis: TLinguisticAnalysis;
  encounter: TVocabularyContextEncounter | null;
}): TReaderConceptResolution | null {
  const graph = resolveConceptGraph(
    input.profile,
    input.analysis,
    input.encounter,
  );

  if (graph.primary.id === NO_CONCEPT_ID) {
    // POS invariable / pronom sans traitement dédié : dégradation propre,
    // pas de concept affiché plutôt qu'un concept faux.
    return null;
  }

  return {
    conceptId: graph.primary.id,
    conceptSlug: graph.primary.slug,
    conceptTitle: graph.primary.title,
    conceptSummary: graph.primary.summary,
    prepositionGovernment: input.profile.prepositionGovernment ?? null,
  };
}

/**
 * Résolution Reader : POS / aspect / morphologie viennent de linguistic_knowledge
 * (via le profil), jamais d'heuristiques sur la prose LLM.
 * Régence : préposition immédiatement avant le mot + table curée.
 * Cas précis : table cas→concept (repli noun-declension).
 */
export function resolveReaderConceptFromSignals(input: {
  partOfSpeech?: string | null;
  aspect?: string | null;
  gender?: string | null;
  movementType?: string | null;
  animacy?: "animate" | "inanimate" | null;
  morphology?: TLinguisticProfile["morphology"] | null;
  paradigms?: TLinguisticProfile["paradigms"] | null;
  explanation?: string;
  suffixExplanation?: string;
  surface?: string;
  lemma?: string;
  functionalRole?: string | null;
  /** Phrase d'origine — requise pour détecter la préposition précédente. */
  sentence?: string | null;
}): TReaderConceptResolution | null {
  const morph = input.morphology;
  const aspect = input.aspect ?? morph?.aspect ?? null;

  const { morphologicalCase, government: governmentResolved } = detectReliableCase({
    surface: input.surface,
    sentence: input.sentence,
    paradigms: input.paradigms,
    morphology: morph,
    functionalRole: input.functionalRole,
    explanation: input.explanation,
  });

  const animacy =
    input.animacy ??
    readAnimacy(morph) ??
    inferAnimacyFromCurated({
      surface: input.surface,
      lemma: input.lemma,
    });

  const profile: TConceptMatchProfile = {
    partOfSpeech: input.partOfSpeech ?? null,
    aspect,
    gender: input.gender ?? morph?.gender ?? null,
    movementType: input.movementType ?? morph?.movementType ?? null,
    animacy,
    morphologicalCase,
    functionalRole: input.functionalRole ?? null,
    prepositionGovernment: governmentResolved
      ? {
          preposition: governmentResolved.preposition,
          governedCase: governmentResolved.governedCase,
        }
      : null,
    morphology: {
      aspect,
      tense: morph?.tense ?? null,
      person: morph?.person ?? null,
      gender: morph?.gender ?? input.gender ?? null,
      animacy,
      preverbs: morph?.preverbs ?? [],
      caseParadigm: morph?.caseParadigm ?? [],
      governedCases: morph?.governedCases ?? [],
      agreement: morph?.agreement ?? null,
      pronounType: morph?.pronounType ?? null,
      aspectPair: morph?.aspectPair ?? null,
    },
    paradigms: {
      cases: input.paradigms?.cases ?? [],
    },
    pedagogy: { concept: undefined },
  };

  const analysis: TLinguisticAnalysis = {
    baseLemma: input.lemma ?? input.surface ?? "",
    surfaceForm: input.surface ?? null,
    partOfSpeech: input.partOfSpeech ?? null,
    suffix: null,
    roleLabel: null,
    sentence: input.sentence ?? null,
    morphSignals: [
      ...(governmentResolved
        ? [`régence:${governmentResolved.preposition}+${governmentResolved.governedCase}`]
        : []),
      ...(morphologicalCase ? [`cas:${morphologicalCase}`] : []),
    ],
    alternativeForms: [],
    encounterExplanation: input.explanation ?? null,
    suffixExplanation: input.suffixExplanation ?? null,
  };

  const encounter = input.explanation
    ? ({
        surface: input.surface ?? "",
        sentence: input.sentence ?? "",
        explanation: input.explanation,
        suffix: "",
        suffixExplanation: input.suffixExplanation ?? "",
        functionalRole: input.functionalRole ?? "",
        functionColor: null,
        roleLabel: "",
      } as TVocabularyContextEncounter)
    : null;

  // Même chemin que le graphe (hiérarchie déclarative + liens secondaires).
  const graph = resolveConceptGraph(profile, analysis, encounter);
  const concept = graph.primary;

  if (concept.id === NO_CONCEPT_ID) {
    // POS invariable (adverbe…) ou pronom sans traitement dédié : ne pas
    // afficher de concept plutôt qu'un concept d'une autre famille (RC).
    return null;
  }

  if (!concept?.id) {
    const signals = matchConceptSignals(profile, analysis, encounter);
    const best = signals[0];

    if (!best) {
      return null;
    }

    const fallback = getConceptById(best.conceptId);

    if (!fallback) {
      return null;
    }

    return {
      conceptId: fallback.id,
      conceptSlug: fallback.slug,
      conceptTitle: fallback.title,
      conceptSummary: fallback.summary,
      prepositionGovernment: profile.prepositionGovernment ?? null,
    };
  }

  return {
    conceptId: concept.id,
    conceptSlug: concept.slug,
    conceptTitle: concept.title,
    conceptSummary: concept.summary,
    prepositionGovernment: profile.prepositionGovernment ?? null,
  };
}
