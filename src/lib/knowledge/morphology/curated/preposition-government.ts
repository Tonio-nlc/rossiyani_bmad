/**
 * Régence des prépositions russes courantes.
 * validé manuellement — ne pas générer par LLM
 *
 * Source pédagogique : cas imposé(s) par chaque préposition.
 * в / на : deux cas selon le sens (mouvement → accusatif, lieu → prépositionnel).
 */

export type TGovernedCase =
  | "genitive"
  | "dative"
  | "accusative"
  | "instrumental"
  | "prepositional";

export interface TPrepositionGovernmentEntry {
  /** Forme canonique sans accent, minuscules. */
  preposition: string;
  /** Cas régis (un seul = régence univoque). */
  cases: readonly TGovernedCase[];
  /**
   * true pour в / на : le cas dépend du sens.
   * Sans cas morphologique du mot gouverné, on ne tranche pas.
   */
  senseDependent?: boolean;
}

/**
 * Table de régence — prépositions fréquentes en lecture A1–A2.
 * Les formes accentuées (к, о́…) se normalisent via strip avant lookup.
 */
export const CURATED_PREPOSITION_GOVERNMENT: readonly TPrepositionGovernmentEntry[] =
  [
    // Génitif
    { preposition: "до", cases: ["genitive"] },
    { preposition: "из", cases: ["genitive"] },
    { preposition: "от", cases: ["genitive"] },
    { preposition: "у", cases: ["genitive"] },
    { preposition: "без", cases: ["genitive"] },
    { preposition: "для", cases: ["genitive"] },
    { preposition: "после", cases: ["genitive"] },
    { preposition: "около", cases: ["genitive"] },
    { preposition: "кроме", cases: ["genitive"] },
    { preposition: "вместо", cases: ["genitive"] },
    { preposition: "против", cases: ["genitive"] },
    { preposition: "среди", cases: ["genitive"] },

    // Datif
    { preposition: "к", cases: ["dative"] },
    { preposition: "по", cases: ["dative"] },

    // Accusatif (direction / objet de préposition)
    { preposition: "про", cases: ["accusative"] },
    { preposition: "через", cases: ["accusative"] },
    { preposition: "сквозь", cases: ["accusative"] },

    // Instrumental
    { preposition: "с", cases: ["instrumental", "genitive"], senseDependent: true },
    { preposition: "над", cases: ["instrumental"] },
    { preposition: "под", cases: ["instrumental", "accusative"], senseDependent: true },
    { preposition: "перед", cases: ["instrumental"] },
    { preposition: "за", cases: ["instrumental", "accusative"], senseDependent: true },
    { preposition: "между", cases: ["instrumental"] },

    // Prépositionnel
    { preposition: "о", cases: ["prepositional"] },
    { preposition: "об", cases: ["prepositional"] },
    { preposition: "обо", cases: ["prepositional"] },
    { preposition: "при", cases: ["prepositional"] },

    // в / на — mouvement (acc.) vs lieu (prép.)
    {
      preposition: "в",
      cases: ["accusative", "prepositional"],
      senseDependent: true,
    },
    {
      preposition: "во",
      cases: ["accusative", "prepositional"],
      senseDependent: true,
    },
    {
      preposition: "на",
      cases: ["accusative", "prepositional"],
      senseDependent: true,
    },
  ] as const;

const byPreposition = new Map<string, TPrepositionGovernmentEntry>();

for (const entry of CURATED_PREPOSITION_GOVERNMENT) {
  byPreposition.set(entry.preposition, entry);
}

export function getPrepositionGovernmentEntry(
  preposition: string,
): TPrepositionGovernmentEntry | null {
  return byPreposition.get(preposition) ?? null;
}
