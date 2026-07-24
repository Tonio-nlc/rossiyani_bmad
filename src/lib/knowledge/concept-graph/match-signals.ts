import type { TLinguisticAnalysis } from "@/lib/knowledge/teaching/analyze-linguistic-context";
import type {
  TConceptLinkWeight,
  TConceptSignalMatch,
} from "@/types/linguistic-concept";
import type { TVocabularyContextEncounter } from "@/types/vocabulary";

import {
  resolveCaseConceptId,
  type TMorphologicalCase,
} from "./case-concept-routing";
import { applyPedagogicalHierarchy } from "./pedagogical-hierarchy";
import { isKnownConceptId } from "./registry";

export interface TConceptMatchProfile {
  partOfSpeech: string | null;
  aspect?: string | null;
  gender?: string | null;
  movementType?: string | null;
  animacy?: string | null;
  morphologicalCase?: TMorphologicalCase | null;
  functionalRole?: string | null;
  /**
   * Régence détectée déterministe (préposition avant le mot + table curée).
   * Prioritaire sur le cas seul et sur noun-declension.
   */
  prepositionGovernment?: {
    preposition: string;
    governedCase: string;
  } | null;
  morphology: {
    tense?: string | null;
    person?: string | null;
    aspect?: string | null;
    gender?: string | null;
    animacy?: string | null;
    preverbs?: Array<{ prefix: string; verb: string }>;
    caseParadigm?: Array<{ label: string; form: string }>;
    governedCases?: unknown[];
    agreement?: string | null;
    pronounType?: string | null;
    aspectPair?: { imperfective: string | null; perfective: string | null } | null;
  };
  paradigms: {
    cases?: Array<{ label: string; form: string }>;
  };
  pedagogy?: {
    concept?: {
      phenomenonId?: string | null;
    };
  };
}

interface SignalRule {
  conceptId: string;
  weight: TConceptLinkWeight;
  /** Score intra-famille uniquement — la hiérarchie tranche entre familles. */
  score: number;
  matches: (ctx: {
    profile: TConceptMatchProfile;
    analysis: TLinguisticAnalysis;
    encounter: TVocabularyContextEncounter | null;
  }) => boolean;
  signal: string;
}

const SIGNAL_RULES: SignalRule[] = [
  {
    conceptId: "verb-present-conjugation",
    weight: "primary",
    score: 90,
    signal: "présent conjugué",
    matches: ({ profile, analysis, encounter }) => {
      if (profile.partOfSpeech !== "verb") {
        return false;
      }

      const haystack = [
        profile.morphology.tense ?? "",
        encounter?.explanation ?? "",
        encounter?.suffixExplanation ?? "",
        ...(analysis.morphSignals ?? []),
      ].join(" ");

      return /présent|present/i.test(haystack);
    },
  },
  {
    conceptId: "verb-perfective-aspect",
    weight: "primary",
    score: 95,
    signal: "aspect perfectif",
    matches: ({ profile, analysis, encounter }) => {
      if (profile.partOfSpeech !== "verb") {
        return false;
      }

      const aspect = profile.aspect ?? profile.morphology.aspect;
      const surface = analysis.surfaceForm ?? "";

      return (
        aspect === "perfective" ||
        /perfectif/i.test(encounter?.explanation ?? "") ||
        /^[псвзо]/u.test(surface)
      );
    },
  },
  {
    conceptId: "verb-imperfective-aspect",
    weight: "secondary",
    score: 70,
    signal: "aspect imperfectif",
    matches: ({ profile }) => {
      const aspect = profile.aspect ?? profile.morphology.aspect;

      return profile.partOfSpeech === "verb" && aspect === "imperfective";
    },
  },
  {
    conceptId: "aspect-pairs",
    weight: "secondary",
    score: 65,
    signal: "paire aspectuelle",
    matches: ({ profile }) =>
      profile.partOfSpeech === "verb" &&
      Boolean(profile.morphology.aspectPair?.perfective),
  },
  {
    conceptId: "verb-movement-prefixes",
    weight: "primary",
    score: 92,
    signal: "préfixe de mouvement",
    matches: ({ profile, analysis }) => {
      if (profile.partOfSpeech !== "verb") {
        return false;
      }

      const surface = analysis.surfaceForm ?? analysis.baseLemma;

      return (
        Boolean(profile.morphology.preverbs?.length) ||
        /^(по|у|при|вы|в|с|пере)/u.test(surface)
      );
    },
  },
  {
    conceptId: "verbs-of-motion",
    weight: "secondary",
    score: 80,
    signal: "verbe de mouvement",
    matches: ({ profile, analysis }) => {
      if (profile.partOfSpeech !== "verb") {
        return false;
      }

      const lemma = analysis.baseLemma
        .normalize("NFD")
        .replace(/\u0301/g, "")
        .normalize("NFC")
        .toLowerCase();

      return (
        Boolean(profile.movementType) ||
        /^(по|при|у|вы|пере)?(йти|идти|ходить|ехать|ездить|бежать|лететь|плыть|нести|везти)/u.test(
          lemma,
        ) ||
        /^(ид|ход|ех|езд|бег|лет|плыв|нес|вез)/u.test(lemma)
      );
    },
  },
  {
    conceptId: "reflexive-possessive",
    weight: "primary",
    score: 88,
    signal: "possessif réfléchi",
    matches: ({ profile, analysis }) => {
      const surface = (analysis.surfaceForm ?? analysis.baseLemma).toLowerCase();

      return (
        profile.partOfSpeech === "pronoun" ||
        surface.includes("сво") ||
        /possessif|réfléchi|reflexive/i.test(
          profile.morphology.pronounType ?? "",
        )
      );
    },
  },
  {
    conceptId: "case-accusative",
    weight: "primary",
    score: 88,
    signal: "accusatif (cas précis)",
    matches: ({ profile }) => {
      if (
        profile.partOfSpeech !== "noun" &&
        profile.partOfSpeech !== "pronoun" &&
        profile.partOfSpeech !== "adjective"
      ) {
        return false;
      }

      if (!isKnownConceptId("case-accusative")) {
        return false;
      }

      if (profile.morphologicalCase === "accusative") {
        return true;
      }

      const role = (profile.functionalRole ?? "").toLowerCase();

      return role === "object_direct" || role === "object";
    },
  },
  {
    conceptId: "noun-animacy",
    weight: "secondary",
    score: 75,
    signal: "animation (effet sur l'accusatif)",
    matches: ({ profile }) => {
      if (profile.partOfSpeech !== "noun" || !isKnownConceptId("noun-animacy")) {
        return false;
      }

      const animacy = profile.animacy ?? profile.morphology.animacy;
      const isAccusativeContext =
        profile.morphologicalCase === "accusative" ||
        (profile.functionalRole ?? "").toLowerCase() === "object_direct";

      return Boolean(animacy) && isAccusativeContext;
    },
  },
  {
    conceptId: "noun-declension",
    weight: "primary",
    score: 80,
    signal: "déclinaison (parapluie)",
    matches: ({ profile, encounter }) =>
      profile.partOfSpeech === "noun" &&
      (/cas|génitif|datif|accusatif|nominatif|instrumental|prépositionnel/i.test(
        `${encounter?.explanation ?? ""} ${encounter?.suffixExplanation ?? ""}`,
      ) ||
        Boolean(profile.morphology.caseParadigm?.length) ||
        Boolean(profile.paradigms.cases?.length) ||
        Boolean(profile.morphologicalCase)),
  },
  {
    conceptId: "noun-gender",
    weight: "secondary",
    score: 55,
    signal: "genre nominal",
    matches: ({ profile }) =>
      profile.partOfSpeech === "noun" && Boolean(profile.gender),
  },
  {
    conceptId: "adjective-agreement",
    weight: "primary",
    score: 78,
    signal: "accord adjectival",
    matches: ({ profile, encounter }) =>
      profile.partOfSpeech === "adjective" &&
      (/accord|masculin|féminin|neutre|pluriel/i.test(
        `${encounter?.explanation ?? ""} ${encounter?.suffixExplanation ?? ""}`,
      ) ||
        Boolean(profile.morphology.agreement)),
  },
  {
    conceptId: "preposition-government",
    weight: "primary",
    score: 96,
    signal: "régence prépositionnelle",
    matches: ({ profile }) =>
      Boolean(profile.prepositionGovernment) ||
      profile.partOfSpeech === "preposition" ||
      Boolean(profile.morphology.governedCases?.length),
  },
];

/** IDs que les règles de signal peuvent produire (pour audit orphelins). */
export function listSignalRuleConceptIds(): string[] {
  return [...new Set(SIGNAL_RULES.map((rule) => rule.conceptId))];
}

/**
 * Matching + hiérarchie déclarative.
 * Scores = départage intra-famille seulement.
 */
export function matchConceptSignals(
  profile: TConceptMatchProfile,
  analysis: TLinguisticAnalysis,
  encounter: TVocabularyContextEncounter | null,
): TConceptSignalMatch[] {
  const ctx = { profile, analysis, encounter };
  const matches: TConceptSignalMatch[] = [];

  for (const rule of SIGNAL_RULES) {
    if (!rule.matches(ctx)) {
      continue;
    }

    matches.push({
      conceptId: rule.conceptId,
      score: rule.score,
      weight: rule.weight,
      signal: rule.signal,
    });
  }

  const caseConceptId = resolveCaseConceptId(profile.morphologicalCase ?? null);

  return applyPedagogicalHierarchy(matches, {
    movementType: profile.movementType,
    morphologicalCase: profile.morphologicalCase,
    prepositionGovernment: profile.prepositionGovernment,
    functionalRole: profile.functionalRole,
    caseConceptAvailable: caseConceptId
      ? isKnownConceptId(caseConceptId)
      : false,
  }, analysis);
}

export function buildLemmaConceptLinks(
  profile: TConceptMatchProfile,
  analysis: TLinguisticAnalysis,
  encounter: TVocabularyContextEncounter | null,
): TConceptSignalMatch[] {
  const signals = matchConceptSignals(profile, analysis, encounter);
  const llmConceptId = profile.pedagogy?.concept?.phenomenonId;

  if (llmConceptId && !signals.some((item) => item.conceptId === llmConceptId)) {
    signals.unshift({
      conceptId: llmConceptId,
      score: 100,
      weight: "primary",
      signal: "profil knowledge",
    });
  }

  return signals;
}
