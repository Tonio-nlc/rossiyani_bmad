import type { TLinguisticAnalysis } from "@/lib/knowledge/teaching/analyze-linguistic-context";
import type {
  TConceptLinkWeight,
  TConceptSignalMatch,
} from "@/types/linguistic-concept";
import type { TVocabularyContextEncounter } from "@/types/vocabulary";

export interface TConceptMatchProfile {
  partOfSpeech: string | null;
  aspect?: string | null;
  gender?: string | null;
  movementType?: string | null;
  /**
   * Régence détectée déterministe (préposition avant le mot + table curée).
   * Prioritaire sur noun-declension.
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

      const lemma = analysis.baseLemma;

      return (
        Boolean(profile.movementType) ||
        /^(ид|ход|ех|езд|пой|при|уй)/u.test(lemma)
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
    conceptId: "noun-declension",
    weight: "primary",
    score: 80,
    signal: "déclinaison",
    matches: ({ profile, encounter }) =>
      profile.partOfSpeech === "noun" &&
      (/cas|génitif|datif|accusatif|nominatif|instrumental|prépositionnel/i.test(
        `${encounter?.explanation ?? ""} ${encounter?.suffixExplanation ?? ""}`,
      ) ||
        Boolean(profile.morphology.caseParadigm?.length) ||
        Boolean(profile.paradigms.cases?.length)),
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
    /** Au-dessus de noun-declension (80) : la régence est le phénomène précis. */
    score: 96,
    signal: "régence prépositionnelle",
    matches: ({ profile }) =>
      Boolean(profile.prepositionGovernment) ||
      profile.partOfSpeech === "preposition" ||
      Boolean(profile.morphology.governedCases?.length),
  },
];

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

  return matches.sort((left, right) => right.score - left.score);
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
