/**
 * Démonstration paramétrée pour verb-present-conjugation.
 * Principe (seed) invariant ; slots démonstratifs = lemme + forme rencontrée.
 *
 * Si morphologie curée absente : paradigme (visual) OMIS — jamais remplacé par читать.
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
  /** Absent si pas de paradigme curé / profil — ne pas inventer ni emprunter. */
  visual?: TTeachingVisual | null;
  commonMistake?: string;
  reuse?: string[];
  /** true = démonstration du lemme consulté (pas illustration canonique). */
  isLemmaDemo: boolean;
  /** true si le paradigme a été omis faute de morphologie curée. */
  paradigmOmitted: boolean;
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
 * Retourne toujours une démo lemme si le principe peut s'appliquer (forme ou lemme seul).
 * Ne retourne null que si aucun lemme n'est fourni.
 */
export function composePresentConjugationDemo(input: {
  lemma: string;
  encounteredForm: string | null;
  profile?: TVocabularyLinguisticProfile | null;
}): TPresentConjugationDemo | null {
  const lemma = input.lemma.trim();

  if (!lemma) {
    return null;
  }

  const form = input.encounteredForm?.trim() || null;
  const verb = resolveVerb(lemma, input.profile);
  const personInfo = form ? inferPresentPersonFromSurface(form) : null;
  const ending =
    (personInfo && verb?.endings[personInfo.key]) ||
    personInfo?.ending ||
    null;

  if (!verb) {
    console.info(
      `[morphology] Lemme sans paradigme curé (présent) — paradigme omis: ${lemma}`,
    );
  }

  const paradigmOmitted = !verb;
  const personFr = personInfo ? personKeyToFrench(personInfo.key) : null;
  const classHint = verb
    ? ` (${conjugationClassLabel(verb.conjugationClass)})`
    : "";

  let fact: string;
  let memoryAnchor: string;

  if (form && personInfo && ending) {
    fact = `La terminaison ${ending} marque la ${personFr} au présent${classHint}.`;
    memoryAnchor = `${ending} = ${personFr}, présent.`;
  } else if (form) {
    fact = `${form} illustre le principe : la terminaison du verbe dit qui fait l'action, maintenant.`;
    memoryAnchor = "Terminaison du présent = qui agit, maintenant.";
  } else {
    fact =
      "En russe, la terminaison du verbe dit qui fait l'action, maintenant.";
    memoryAnchor = "Terminaison du présent = qui agit, maintenant.";
  }

  const entries = verb ? getAllowedPresentEntries(verb) : [];
  const contrast: TTeachingComparison[] = [];

  if (entries.length >= 2 && personInfo) {
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
  } else if (form) {
    contrast.push({
      fromForm: lemma,
      toForm: form,
      explanation:
        personInfo && ending
          ? `Même présent : ${ending} marque la ${personFr}.`
          : `Forme rencontrée du lemme ${lemma}.`,
    });
  } else {
    contrast.push({
      fromForm: lemma,
      toForm: lemma,
      explanation:
        "La démonstration se lit sur ce lemme — pas sur un autre verbe.",
    });
  }

  let visual: TTeachingVisual | null | undefined;

  if (verb) {
    const nodes = buildPresentVisualNodes(verb);

    if (nodes.length >= 2) {
      visual = {
        nodes,
        layout: "vertical",
        caption: verb.defective
          ? `Présent défectif — ${conjugationClassLabel(verb.conjugationClass)}`
          : `Présent — ${conjugationClassLabel(verb.conjugationClass)}`,
      };
    } else if (entries.length >= 2) {
      visual = {
        nodes: entries.map(
          (entry) =>
            `${PERSON_PRONOUNS[entry.key]} ${entry.form}${
              entry.ending ? ` (${entry.ending})` : ""
            }`,
        ),
        layout: "vertical",
        caption: `Présent — ${conjugationClassLabel(verb.conjugationClass)}`,
      };
    } else {
      visual = undefined;
    }
  } else {
    // ÉTAPE 4 — pas de paradigme emprunté : omettre
    visual = undefined;
  }

  let commonMistake: string | undefined;

  if (verb?.defective) {
    commonMistake = verb.defective.note;
  } else if (verb?.past?.m && verb.present.sg2) {
    commonMistake = `Ne confonds pas ${verb.present.sg2} (présent) et ${verb.past.m} (passé).`;
  } else if (form) {
    commonMistake = `Regarde la terminaison de ${form} : c'est elle qui dit qui agit, pas le pronom seul.`;
  }

  return {
    fact,
    memoryAnchor,
    contrast,
    visual,
    commonMistake,
    isLemmaDemo: true,
    paradigmOmitted,
  };
}
