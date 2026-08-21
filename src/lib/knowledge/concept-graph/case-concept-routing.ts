/**
 * Cas morphologique → concept de cas précis.
 * Les concepts absents (null) tombent sur le parapluie `noun-declension`.
 *
 * Lot 03 : les six cas ont désormais chacun un concept dédié.
 *
 * Lot 04 — nominative reste volontairement `null` ICI (le concept
 * `case-nominative` existe bien au catalogue) : le nominatif est aussi la
 * forme de repli d'ambiguïté (`disambiguateCase` ci-dessous — cas
 * nom/acc syncrétique sans rôle objet) et la forme de départ des paradigmes.
 * Router "cas nominatif → concept" sans condition ferait passer un mot dont
 * le cas est juste indéterminé (ou un attribut/apposition au nominatif) pour
 * "le sujet". `case-nominative` n'est donc atteint QUE via sa règle dédiée
 * dans match-signals.ts, qui exige en plus `functionalRole === "subject"`.
 */

import {
  CURATED_ANNA,
  CURATED_AUDITORIYA,
  CURATED_KARTA,
  CURATED_KNIGA,
  CURATED_MOSKVA,
  CURATED_STOL,
  CURATED_UNIVERSITET,
  CURATED_VRACH,
} from "@/lib/knowledge/morphology/curated/forms";
import { stripStressMarks } from "@/lib/knowledge/morphology/curated/present-verbs";
import { logCuratedMorphologyDivergence } from "@/lib/knowledge/morphology/curated-store/divergence";
import { normalizeToken } from "@/lib/utils/russian";
import { normalizeGovernedCaseLabel } from "@/lib/knowledge/morphology/curated/detect-preposition-government";
import { getPronounCaseCandidates } from "@/lib/knowledge/morphology/curated/pronouns";
import type { TGovernedCase } from "@/lib/knowledge/morphology/curated/preposition-government";

export type TMorphologicalCase = TGovernedCase | "nominative";

/**
 * Table déclarative cas → concept.
 * `null` = pas encore de concept dédié → repli noun-declension.
 */
export const CASE_CONCEPT_BY_CASE: Record<TMorphologicalCase, string | null> = {
  nominative: null,
  accusative: "case-accusative",
  genitive: "case-genitive",
  dative: "case-dative",
  instrumental: "case-instrumental",
  prepositional: "case-prepositional",
};

const NOMINATIVE_LABELS = new Set([
  "nominative",
  "nominatif",
  "nom",
  "именительный",
]);

export function normalizeMorphologicalCaseLabel(
  label: string | null | undefined,
): TMorphologicalCase | null {
  if (!label?.trim()) {
    return null;
  }

  const key = label
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-zа-яё]/gi, "");

  if (NOMINATIVE_LABELS.has(key)) {
    return "nominative";
  }

  return normalizeGovernedCaseLabel(label);
}

function formKey(form: string): string {
  return stripStressMarks(normalizeToken(form));
}

/** Clé accent-sensible (NFC) — distingue les homographes qui ne diffèrent que par l'accent. */
function stressedFormKey(form: string): string {
  return normalizeToken(form).normalize("NFC").toLowerCase();
}

const STRESS_MARK = /\u0301/;

/**
 * Structure TS (méthode Rossiyani) : quel cas / quels candidats.
 * Les CHAÎNES `tsForm` sont le seed ; après hydrate, remplacées par la DB.
 */
type TUnambiguousCaseSeed = {
  lemmaBare: string;
  slot: string;
  tsForm: string;
  morphologicalCase: TMorphologicalCase;
};

type TAmbiguousCaseSeed = {
  lemmaBare: string;
  slot: string;
  tsForm: string;
  candidates: TMorphologicalCase[];
};

const UNAMBIGUOUS_CASE_SEED: readonly TUnambiguousCaseSeed[] = [
  {
    lemmaBare: "книга",
    slot: "case.nominative",
    tsForm: CURATED_KNIGA.nom,
    morphologicalCase: "nominative",
  },
  {
    lemmaBare: "книга",
    slot: "case.accusative",
    tsForm: CURATED_KNIGA.acc,
    morphologicalCase: "accusative",
  },
  {
    lemmaBare: "книга",
    slot: "case.genitive",
    tsForm: CURATED_KNIGA.gen,
    morphologicalCase: "genitive",
  },
  {
    lemmaBare: "стол",
    slot: "case.genitive",
    tsForm: CURATED_STOL.gen,
    morphologicalCase: "genitive",
  },
  {
    lemmaBare: "стол",
    slot: "case.dative",
    tsForm: CURATED_STOL.dat,
    morphologicalCase: "dative",
  },
  {
    lemmaBare: "врач",
    slot: "case.dative",
    tsForm: CURATED_VRACH.dat,
    morphologicalCase: "dative",
  },
  {
    lemmaBare: "университет",
    slot: "case.prepositional",
    tsForm: CURATED_UNIVERSITET.prep,
    morphologicalCase: "prepositional",
  },
  {
    lemmaBare: "Анна",
    slot: "case.nominative",
    tsForm: CURATED_ANNA.nom,
    morphologicalCase: "nominative",
  },
  {
    lemmaBare: "Анна",
    slot: "case.genitive",
    tsForm: CURATED_ANNA.gen,
    morphologicalCase: "genitive",
  },
  {
    lemmaBare: "Анна",
    slot: "case.dative",
    tsForm: CURATED_ANNA.dat,
    morphologicalCase: "dative",
  },
  {
    lemmaBare: "Анна",
    slot: "case.accusative",
    tsForm: CURATED_ANNA.acc,
    morphologicalCase: "accusative",
  },
  {
    lemmaBare: "Анна",
    slot: "case.instrumental",
    tsForm: CURATED_ANNA.instr,
    morphologicalCase: "instrumental",
  },
  {
    lemmaBare: "карта",
    slot: "case.instrumental",
    tsForm: CURATED_KARTA.instr,
    morphologicalCase: "instrumental",
  },
  {
    lemmaBare: "аудитория",
    slot: "case.prepositional",
    tsForm: CURATED_AUDITORIYA.prep,
    morphologicalCase: "prepositional",
  },
  {
    lemmaBare: "Москва",
    slot: "case.prepositional",
    tsForm: CURATED_MOSKVA.prepositional,
    morphologicalCase: "prepositional",
  },
];

const AMBIGUOUS_CASE_SEED: readonly TAmbiguousCaseSeed[] = [
  {
    lemmaBare: "стол",
    slot: "case.nominative",
    tsForm: CURATED_STOL.nom,
    candidates: ["nominative", "accusative"],
  },
  {
    lemmaBare: "врач",
    slot: "case.nominative",
    tsForm: CURATED_VRACH.nom,
    candidates: ["nominative"],
  },
  {
    lemmaBare: "врач",
    slot: "case.accusative",
    tsForm: CURATED_VRACH.acc,
    candidates: ["accusative", "genitive"],
  },
  {
    lemmaBare: "университет",
    slot: "case.nominative",
    tsForm: CURATED_UNIVERSITET.nom,
    candidates: ["nominative", "accusative"],
  },
];

/** Animacy : STRUCTURE TS (qui est animé) — chaînes overlaid depuis DB. */
const ANIMATE_FORM_SEED: ReadonlyArray<{
  lemmaBare: string;
  slot: string;
  tsForm: string;
}> = [
  { lemmaBare: "врач", slot: "case.nominative", tsForm: CURATED_VRACH.nom },
  { lemmaBare: "врач", slot: "case.accusative", tsForm: CURATED_VRACH.acc },
  { lemmaBare: "врач", slot: "case.genitive", tsForm: CURATED_VRACH.gen },
  { lemmaBare: "врач", slot: "case.dative", tsForm: CURATED_VRACH.dat },
];

const INANIMATE_FORM_SEED: ReadonlyArray<{
  lemmaBare: string;
  slot: string;
  tsForm: string;
}> = [
  { lemmaBare: "стол", slot: "case.nominative", tsForm: CURATED_STOL.nom },
  { lemmaBare: "стол", slot: "case.accusative", tsForm: CURATED_STOL.acc },
  { lemmaBare: "стол", slot: "case.genitive", tsForm: CURATED_STOL.gen },
  { lemmaBare: "стол", slot: "case.dative", tsForm: CURATED_STOL.dat },
  { lemmaBare: "книга", slot: "case.nominative", tsForm: CURATED_KNIGA.nom },
  { lemmaBare: "книга", slot: "case.accusative", tsForm: CURATED_KNIGA.acc },
  { lemmaBare: "книга", slot: "case.genitive", tsForm: CURATED_KNIGA.gen },
  {
    lemmaBare: "университет",
    slot: "case.nominative",
    tsForm: CURATED_UNIVERSITET.nom,
  },
  {
    lemmaBare: "университет",
    slot: "case.accusative",
    tsForm: CURATED_UNIVERSITET.acc,
  },
  {
    lemmaBare: "университет",
    slot: "case.prepositional",
    tsForm: CURATED_UNIVERSITET.prep,
  },
];

type TUnambiguousRuntime = {
  form: string;
  morphologicalCase: TMorphologicalCase;
};

type TAmbiguousRuntime = {
  form: string;
  candidates: TMorphologicalCase[];
};

function resolveSeedForm(
  seed: { lemmaBare: string; slot: string; tsForm: string },
  formLookup: Map<string, string> | null,
): string {
  if (!formLookup) {
    return seed.tsForm;
  }

  const key = `${seed.lemmaBare}\0${seed.slot}\0plain`;
  const dbValue = formLookup.get(key);
  if (!dbValue) {
    return seed.tsForm;
  }

  if (dbValue !== seed.tsForm) {
    logCuratedMorphologyDivergence({
      kind: "case_form",
      lemmaBare: seed.lemmaBare,
      slot: seed.slot,
      variant: "plain",
      tsValue: seed.tsForm,
      dbValue,
    });
  }

  return dbValue;
}

function buildUnambiguous(
  formLookup: Map<string, string> | null,
): TUnambiguousRuntime[] {
  return UNAMBIGUOUS_CASE_SEED.map((seed) => ({
    form: resolveSeedForm(seed, formLookup),
    morphologicalCase: seed.morphologicalCase,
  }));
}

function buildAmbiguous(
  formLookup: Map<string, string> | null,
): TAmbiguousRuntime[] {
  return AMBIGUOUS_CASE_SEED.map((seed) => ({
    form: resolveSeedForm(seed, formLookup),
    candidates: [...seed.candidates],
  }));
}

function buildAnimacyKeys(
  seeds: ReadonlyArray<{ lemmaBare: string; slot: string; tsForm: string }>,
  formLookup: Map<string, string> | null,
): Set<string> {
  return new Set(
    seeds.map((seed) => formKey(resolveSeedForm(seed, formLookup))),
  );
}

/** Indexes runtime — seed TS au load ; chaînes DB après hydrate. */
let unambiguousCuratedCaseForms = buildUnambiguous(null);
let ambiguousCuratedCaseForms = buildAmbiguous(null);
let animateKeys = buildAnimacyKeys(ANIMATE_FORM_SEED, null);
let inanimateKeys = buildAnimacyKeys(INANIMATE_FORM_SEED, null);

/**
 * B3 Option 2 — après hydrate : remplace les CHAÎNES depuis formLookup DB.
 * Structure (ambiguïté, listes animacy) reste TS.
 * Doit être appelé AVANT que ensureMorphologyCuratedHydrated ne résolve.
 */
export function rebuildCaseRoutingIndexes(
  formLookup: Map<string, string>,
): void {
  unambiguousCuratedCaseForms = buildUnambiguous(formLookup);
  ambiguousCuratedCaseForms = buildAmbiguous(formLookup);
  animateKeys = buildAnimacyKeys(ANIMATE_FORM_SEED, formLookup);
  inanimateKeys = buildAnimacyKeys(INANIMATE_FORM_SEED, formLookup);
}

export function resolveCaseConceptId(
  morphologicalCase: TMorphologicalCase | null | undefined,
): string | null {
  if (!morphologicalCase) {
    return null;
  }

  return CASE_CONCEPT_BY_CASE[morphologicalCase] ?? null;
}

/**
 * Infère le cas de la surface : pronoms curés (paradigme fermé, prioritaire)
 * → paradigmes knowledge → formes curées univoques → désambiguïsation par
 * rôle / régence.
 */
export function inferMorphologicalCase(input: {
  surface: string;
  caseEntries?: Array<{ label: string; form: string }> | null;
  functionalRole?: string | null;
  governmentCase?: TGovernedCase | null;
  /**
   * Cas possibles d'une préposition sense-dependent (с/за/под…) précédant le
   * mot, même quand elle n'a pas pu être tranchée en amont (governmentCase
   * null). Permet de désambiguïser un pronom curé par intersection (ex.
   * "ей/ней" datif=instrumental + "с" instrumental|génitif → instrumental).
   */
  governmentCandidateCases?: readonly TGovernedCase[] | null;
  explanation?: string | null;
}): TMorphologicalCase | null {
  const surfaceKey = formKey(input.surface);

  if (!surfaceKey) {
    return null;
  }

  // Pronoms personnels / réfléchi : paradigme fermé curé à la main,
  // prioritaire sur toute autre source — jamais de segmentation/rôle LLM
  // pour ces formes. Cf. docs/knowledge/curated-pronouns-sources.md.
  const pronounCandidates = getPronounCaseCandidates(input.surface);

  if (pronounCandidates.length === 1) {
    return pronounCandidates[0]!;
  }

  if (pronounCandidates.length > 1) {
    const disambiguated = disambiguateCase(pronounCandidates, input);

    if (disambiguated) {
      return disambiguated;
    }
  }

  if (input.caseEntries?.length) {
    // Désambiguïsation accent-sensible d'abord (ex. окна́ génitif sg vs о́кна
    // nominatif pl : la même forme sans accent ne doit PAS renvoyer le
    // premier paradigme trouvé au hasard si l'accent permet de trancher).
    const surfaceStressed = stressedFormKey(input.surface);

    if (STRESS_MARK.test(surfaceStressed)) {
      for (const entry of input.caseEntries) {
        if (stressedFormKey(entry.form) !== surfaceStressed) {
          continue;
        }

        const fromLabel = normalizeMorphologicalCaseLabel(entry.label);

        if (fromLabel) {
          return fromLabel;
        }
      }
    }

    for (const entry of input.caseEntries) {
      if (formKey(entry.form) !== surfaceKey) {
        continue;
      }

      const fromLabel = normalizeMorphologicalCaseLabel(entry.label);

      if (fromLabel) {
        return fromLabel;
      }
    }
  }

  for (const entry of unambiguousCuratedCaseForms) {
    if (formKey(entry.form) === surfaceKey) {
      return entry.morphologicalCase;
    }
  }

  for (const entry of ambiguousCuratedCaseForms) {
    if (formKey(entry.form) !== surfaceKey) {
      continue;
    }

    const disambiguated = disambiguateCase(entry.candidates, input);

    if (disambiguated) {
      return disambiguated;
    }
  }

  return disambiguateCase(
    ["nominative", "accusative", "genitive", "dative", "instrumental", "prepositional"],
    input,
  );
}

export function disambiguateCase(
  candidates: TMorphologicalCase[],
  input: {
    functionalRole?: string | null;
    governmentCase?: TGovernedCase | null;
    governmentCandidateCases?: readonly TGovernedCase[] | null;
    explanation?: string | null;
  },
): TMorphologicalCase | null {
  const hasGovernmentSignal =
    Boolean(input.governmentCase) || Boolean(input.governmentCandidateCases?.length);

  // Le prépositionnel n'existe jamais sans préposition régissante : sans
  // aucun signal de régence, on l'exclut structurellement des candidats
  // (utile pour les pronoms нас/вас/них : génitif = accusatif = prépositionnel
  // à la même forme selon le contexte).
  const effectiveCandidates =
    candidates.includes("prepositional") && !hasGovernmentSignal
      ? candidates.filter((candidate) => candidate !== "prepositional")
      : candidates;

  if (effectiveCandidates.length === 0) {
    return null;
  }

  if (input.governmentCase && effectiveCandidates.includes(input.governmentCase)) {
    return input.governmentCase;
  }

  // Préposition sense-dependent (с/за/под…) non tranchée en amont : on
  // intersecte quand même ses cas possibles avec les candidats du mot — si
  // un seul cas survit, il est fiable (ex. "с ней" : с = instrumental|génitif,
  // ней = datif|instrumental|prépositionnel → instrumental).
  if (input.governmentCandidateCases?.length) {
    const intersection = effectiveCandidates.filter((candidate) =>
      input.governmentCandidateCases!.includes(candidate as TGovernedCase),
    );

    if (intersection.length === 1) {
      return intersection[0]!;
    }
  }

  const role = (input.functionalRole ?? "").toLowerCase();

  if (
    (role === "object_direct" || role === "object") &&
    effectiveCandidates.includes("accusative")
  ) {
    return "accusative";
  }

  if (role === "subject" && effectiveCandidates.includes("nominative")) {
    return "nominative";
  }

  const haystack = input.explanation ?? "";

  if (/accusatif|accusative/i.test(haystack) && effectiveCandidates.includes("accusative")) {
    return "accusative";
  }

  if (/nominatif|nominative/i.test(haystack) && effectiveCandidates.includes("nominative")) {
    return "nominative";
  }

  if (/génitif|genitive/i.test(haystack) && effectiveCandidates.includes("genitive")) {
    return "genitive";
  }

  if (effectiveCandidates.length === 1) {
    return effectiveCandidates[0] ?? null;
  }

  // Syncrétisme inanimé (nom = acc) : sans rôle objet, prioriser le nominatif (citation).
  if (
    effectiveCandidates.includes("nominative") &&
    effectiveCandidates.includes("accusative") &&
    effectiveCandidates.length === 2
  ) {
    return "nominative";
  }

  // Syncrétisme animé (acc = gén) : en Reader, prioriser l'accusatif objet
  // sauf si la régence / l'explication imposent le génitif (déjà géré plus haut).
  if (
    effectiveCandidates.includes("accusative") &&
    effectiveCandidates.includes("genitive") &&
    effectiveCandidates.length === 2
  ) {
    return "accusative";
  }

  // Pronoms : "ей/ней" (elle) confond datif et instrumental hors régence
  // tranchée. Le datif (complément d'attribution sans préposition) est le
  // plus fréquent en lecture A1-A2 sans autre signal — limite connue et
  // documentée, cf. docs/knowledge/curated-pronouns-sources.md.
  if (
    effectiveCandidates.includes("dative") &&
    effectiveCandidates.includes("instrumental") &&
    effectiveCandidates.length === 2
  ) {
    return "dative";
  }

  return null;
}

/** Animacy depuis formes / lemmes curés (complément à linguistic_knowledge). */
export function inferAnimacyFromCurated(input: {
  surface?: string | null;
  lemma?: string | null;
}): "animate" | "inanimate" | null {
  const keys = [input.surface, input.lemma]
    .filter((value): value is string => Boolean(value?.trim()))
    .map(formKey);

  for (const key of keys) {
    if (animateKeys.has(key)) {
      return "animate";
    }

    if (inanimateKeys.has(key)) {
      return "inanimate";
    }
  }

  return null;
}
