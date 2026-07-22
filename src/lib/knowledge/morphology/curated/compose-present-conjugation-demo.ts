/**
 * Démonstration paramétrée pour verb-present-conjugation.
 * Principe (seed) invariant ; slots démonstratifs = lemme + forme rencontrée.
 */

import type {
  TTeachingComparison,
  TTeachingVisual,
} from "@/types/teaching-scenario";
import type { TVocabularyLinguisticProfile } from "@/types/vocabulary";

import {
  buildPresentVisualNodes,
  getAllowedPresentEntries,
  getCuratedPresentVerb,
  inferPresentPersonFromSurface,
  personKeyToFrench,
  stripStressMarks,
  type TCuratedVerbPresent,
  type TPresentPersonKey,
  PERSON_PRONOUNS,
} from "@/lib/knowledge/morphology/curated/present-verbs";

export interface TPresentConjugationDemo {
  fact: string;
  memoryAnchor: string;
  contrast: TTeachingComparison[];
  visual: TTeachingVisual;
  commonMistake?: string;
  reuse?: string[];
  /** true = démonstration du lemme consulté (pas illustration canonique). */
  isLemmaDemo: boolean;
}

function resolveVerb(
  lemma: string,
  profile?: TVocabularyLinguisticProfile | null,
): TCuratedVerbPresent | null {
  const curated = getCuratedPresentVerb(lemma);

  if (curated) {
    return curated;
  }

  const conjugation = profile?.paradigms.conjugation ?? [];

  if (conjugation.length === 0) {
    return null;
  }

  const present: Partial<Record<TPresentPersonKey, string>> = {};
  const endings: Partial<Record<TPresentPersonKey, string>> = {};

  for (const entry of conjugation) {
    const label = stripStressMarks(entry.label);
    const inferred = inferPresentPersonFromSurface(entry.form);

    if (!inferred) {
      continue;
    }

    if (/я|1/.test(label) || inferred.key === "sg1") {
      present.sg1 = entry.form;
      endings.sg1 = inferred.ending;
    } else if (/ты|2/.test(label) || inferred.key === "sg2") {
      present.sg2 = entry.form;
      endings.sg2 = inferred.ending;
    } else if (/он|она|3/.test(label) || inferred.key === "sg3") {
      present.sg3 = entry.form;
      endings.sg3 = inferred.ending;
    }
  }

  if (Object.keys(present).length === 0) {
    return null;
  }

  const conjugationClass: 1 | 2 =
    present.sg2 && stripStressMarks(present.sg2).endsWith("ишь")
      ? 2
      : present.sg3 && stripStressMarks(present.sg3).endsWith("ит")
        ? 2
        : 1;

  return {
    lemma,
    aliases: [lemma],
    conjugationClass,
    present,
    endings,
    defective: profile?.syntax.impersonal
      ? {
          allowedPersons: (Object.keys(present) as TPresentPersonKey[]).filter(
            (key) => key === "sg3" || key === "pl3",
          ),
          note: "Formes impersonnelles / 3e personne uniquement.",
        }
      : undefined,
  };
}

function conjugationClassLabel(conjugationClass: 1 | 2): string {
  return conjugationClass === 2 ? "2e conjugaison" : "1re conjugaison";
}

/**
 * Compose fact / visual / contrast à partir du lemme consulté + forme rencontrée.
 */
export function composePresentConjugationDemo(input: {
  lemma: string;
  encounteredForm: string | null;
  profile?: TVocabularyLinguisticProfile | null;
}): TPresentConjugationDemo | null {
  const lemma = input.lemma.trim();
  const form = input.encounteredForm?.trim() || null;
  const verb = resolveVerb(lemma, input.profile);

  const personInfo = form ? inferPresentPersonFromSurface(form) : null;
  const ending =
    (personInfo && verb?.endings[personInfo.key]) ||
    personInfo?.ending ||
    null;

  if (!form || !personInfo || !ending) {
    return null;
  }

  const personFr = personKeyToFrench(personInfo.key);
  const classHint = verb
    ? ` (${conjugationClassLabel(verb.conjugationClass)})`
    : "";

  const fact = `La terminaison ${ending} marque la ${personFr} au présent${classHint}.`;
  const memoryAnchor = `${ending} = ${personFr}, présent.`;

  const entries = verb ? getAllowedPresentEntries(verb) : [];
  const contrast: TTeachingComparison[] = [];

  if (entries.length >= 2) {
    const current =
      entries.find((entry) => entry.key === personInfo.key) ?? entries[0];
    const other =
      entries.find((entry) => entry.key !== current.key) ?? entries[1];

    contrast.push({
      fromForm: `${PERSON_PRONOUNS[current.key]} ${current.form}`,
      toForm: `${PERSON_PRONOUNS[other.key]} ${other.form}`,
      explanation: verb?.defective
        ? verb.defective.note
        : "Même présent, seule la personne change.",
    });
  } else {
    contrast.push({
      fromForm: lemma,
      toForm: form,
      explanation: `${form} : terminaison ${ending} = ${personFr} au présent.`,
    });
  }

  let visual: TTeachingVisual;

  if (verb) {
    const nodes = buildPresentVisualNodes(verb);

    visual = {
      nodes:
        nodes.length >= 2
          ? nodes
          : entries.map(
              (entry) =>
                `${PERSON_PRONOUNS[entry.key]} ${entry.form}${
                  entry.ending ? ` (${entry.ending})` : ""
                }`,
            ),
      layout: "vertical",
      caption: verb.defective
        ? `Présent défectif — ${conjugationClassLabel(verb.conjugationClass)}`
        : `Présent — ${conjugationClassLabel(verb.conjugationClass)}`,
    };
  } else {
    visual = {
      nodes: [lemma, form],
      layout: "vertical",
      caption: "Du lemme à la forme rencontrée",
    };
  }

  let commonMistake: string | undefined;

  if (verb?.defective) {
    commonMistake = verb.defective.note;
  } else if (verb?.past?.m && verb.present.sg2) {
    commonMistake = `Ne confonds pas ${verb.present.sg2} (présent) et ${verb.past.m} (passé).`;
  } else {
    commonMistake = `Regarde la terminaison de ${form} : c'est elle qui dit qui agit, pas le pronom seul.`;
  }

  return {
    fact,
    memoryAnchor,
    contrast,
    visual,
    commonMistake,
    isLemmaDemo: true,
  };
}
