/**
 * Cas morphologique → concept de cas précis.
 * Les concepts absents (null) tombent sur le parapluie `noun-declension`.
 *
 * Lots futurs : remplir genitive / dative / … sans toucher au routeur.
 */

import {
  CURATED_KNIGA,
  CURATED_STOL,
  CURATED_UNIVERSITET,
  CURATED_VRACH,
} from "@/lib/knowledge/morphology/curated/forms";
import { stripStressMarks } from "@/lib/knowledge/morphology/curated/present-verbs";
import { normalizeToken } from "@/lib/utils/russian";
import { normalizeGovernedCaseLabel } from "@/lib/knowledge/morphology/curated/detect-preposition-government";
import type { TGovernedCase } from "@/lib/knowledge/morphology/curated/preposition-government";

export type TMorphologicalCase = TGovernedCase | "nominative";

/**
 * Table déclarative cas → concept.
 * `null` = pas encore de concept dédié → repli noun-declension.
 */
export const CASE_CONCEPT_BY_CASE: Record<TMorphologicalCase, string | null> = {
  nominative: null,
  accusative: "case-accusative",
  genitive: null,
  dative: null,
  instrumental: null,
  prepositional: null,
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
 * Infère le cas de la surface : paradigmes knowledge → formes curées univoques
 * → désambiguïsation par rôle / régence.
 */
export function inferMorphologicalCase(input: {
  surface: string;
  caseEntries?: Array<{ label: string; form: string }> | null;
  functionalRole?: string | null;
  governmentCase?: TGovernedCase | null;
  explanation?: string | null;
}): TMorphologicalCase | null {
  const surfaceKey = formKey(input.surface);

  if (!surfaceKey) {
    return null;
  }

  if (input.caseEntries?.length) {
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

function disambiguateCase(
  candidates: TMorphologicalCase[],
  input: {
    functionalRole?: string | null;
    governmentCase?: TGovernedCase | null;
    explanation?: string | null;
  },
): TMorphologicalCase | null {
  if (input.governmentCase && candidates.includes(input.governmentCase)) {
    return input.governmentCase;
  }

  const role = (input.functionalRole ?? "").toLowerCase();

  if (
    (role === "object_direct" || role === "object") &&
    candidates.includes("accusative")
  ) {
    return "accusative";
  }

  if (role === "subject" && candidates.includes("nominative")) {
    return "nominative";
  }

  const haystack = input.explanation ?? "";

  if (/accusatif|accusative/i.test(haystack) && candidates.includes("accusative")) {
    return "accusative";
  }

  if (/nominatif|nominative/i.test(haystack) && candidates.includes("nominative")) {
    return "nominative";
  }

  if (/génitif|genitive/i.test(haystack) && candidates.includes("genitive")) {
    return "genitive";
  }

  if (candidates.length === 1) {
    return candidates[0] ?? null;
  }

  // Syncrétisme inanimé (nom = acc) : sans rôle objet, prioriser le nominatif (citation).
  if (
    candidates.includes("nominative") &&
    candidates.includes("accusative") &&
    candidates.length === 2
  ) {
    return "nominative";
  }

  // Syncrétisme animé (acc = gén) : en Reader, prioriser l'accusatif objet
  // sauf si la régence / l'explication imposent le génitif (déjà géré plus haut).
  if (
    candidates.includes("accusative") &&
    candidates.includes("genitive") &&
    candidates.length === 2
  ) {
    return "accusative";
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
