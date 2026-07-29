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
 * Formes curées univoques (une seule étiquette de cas).
 * Les ambiguïtés (стол nom=acc, врача́ gen=acc) sont tranchées ailleurs
 * via rôle fonctionnel / régence / paradigme labellisé.
 */
const UNAMBIGUOUS_CURATED_CASE_FORMS: Array<{
  form: string;
  morphologicalCase: TMorphologicalCase;
}> = [
  { form: CURATED_KNIGA.nom, morphologicalCase: "nominative" },
  { form: CURATED_KNIGA.acc, morphologicalCase: "accusative" },
  { form: CURATED_KNIGA.gen, morphologicalCase: "genitive" },
  { form: CURATED_STOL.gen, morphologicalCase: "genitive" },
  { form: CURATED_STOL.dat, morphologicalCase: "dative" },
  { form: CURATED_VRACH.dat, morphologicalCase: "dative" },
  { form: CURATED_UNIVERSITET.prep, morphologicalCase: "prepositional" },
  { form: CURATED_ANNA.nom, morphologicalCase: "nominative" },
  { form: CURATED_ANNA.gen, morphologicalCase: "genitive" },
  { form: CURATED_ANNA.dat, morphologicalCase: "dative" },
  { form: CURATED_ANNA.acc, morphologicalCase: "accusative" },
  { form: CURATED_ANNA.instr, morphologicalCase: "instrumental" },
  { form: CURATED_KARTA.instr, morphologicalCase: "instrumental" },
  { form: CURATED_AUDITORIYA.prep, morphologicalCase: "prepositional" },
  { form: CURATED_MOSKVA.prepositional, morphologicalCase: "prepositional" },
];

/** Formes ambiguës : candidates possibles selon le contexte. */
const AMBIGUOUS_CURATED_CASE_FORMS: Array<{
  form: string;
  candidates: TMorphologicalCase[];
}> = [
  {
    form: CURATED_STOL.nom,
    candidates: ["nominative", "accusative"],
  },
  {
    form: CURATED_VRACH.nom,
    candidates: ["nominative"],
  },
  {
    form: CURATED_VRACH.acc,
    candidates: ["accusative", "genitive"],
  },
  {
    form: CURATED_UNIVERSITET.nom,
    candidates: ["nominative", "accusative"],
  },
];

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

  for (const entry of UNAMBIGUOUS_CURATED_CASE_FORMS) {
    if (formKey(entry.form) === surfaceKey) {
      return entry.morphologicalCase;
    }
  }

  for (const entry of AMBIGUOUS_CURATED_CASE_FORMS) {
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

  const animateKeys = new Set(
    [CURATED_VRACH.nom, CURATED_VRACH.acc, CURATED_VRACH.gen, CURATED_VRACH.dat].map(
      formKey,
    ),
  );
  const inanimateKeys = new Set(
    [
      CURATED_STOL.nom,
      CURATED_STOL.acc,
      CURATED_STOL.gen,
      CURATED_STOL.dat,
      CURATED_KNIGA.nom,
      CURATED_KNIGA.acc,
      CURATED_KNIGA.gen,
      CURATED_UNIVERSITET.nom,
      CURATED_UNIVERSITET.acc,
      CURATED_UNIVERSITET.prep,
    ].map(formKey),
  );

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
