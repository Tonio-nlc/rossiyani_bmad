/**
 * Paradigmes de présent curés + défectivité.
 * validé manuellement — ne pas générer par LLM
 */

export type TPresentPersonKey =
  | "sg1"
  | "sg2"
  | "sg3"
  | "pl1"
  | "pl2"
  | "pl3";

export interface TCuratedVerbDefectivity {
  /** Personnes réellement employées pour CE sens. */
  allowedPersons: TPresentPersonKey[];
  /** Note pédagogique (ex. parties du corps uniquement). */
  note: string;
}

export interface TCuratedVerbPresent {
  lemma: string;
  /** Formes d'entrée pour lookup (sans accent). */
  aliases: string[];
  conjugationClass: 1 | 2;
  defective?: TCuratedVerbDefectivity;
  present: Partial<Record<TPresentPersonKey, string>>;
  endings: Partial<Record<TPresentPersonKey, string>>;
  past?: { m: string };
}

const PERSON_PRONOUNS: Record<TPresentPersonKey, string> = {
  sg1: "я",
  sg2: "ты",
  sg3: "он",
  pl1: "мы",
  pl2: "вы",
  pl3: "они",
};

const PERSON_ORDER: TPresentPersonKey[] = [
  "sg1",
  "sg2",
  "sg3",
  "pl1",
  "pl2",
  "pl3",
];

export function stripStressMarks(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\u0301/g, "")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

/**
 * болеть « avoir mal » — 3e personne seulement (le sujet = la partie du corps).
 * Ne pas confondre avec болеть « être malade » (я боле́ю…).
 */
export const CURATED_BOLET_HURT: TCuratedVerbPresent = {
  lemma: "боле́ть",
  aliases: ["болеть", "боле́ть"],
  conjugationClass: 2,
  defective: {
    allowedPersons: ["sg3", "pl3"],
    note: "Au sens « avoir mal », seules les 3es personnes s'emploient (sujet = partie du corps).",
  },
  present: {
    sg3: "боли́т",
    pl3: "боля́т",
  },
  endings: {
    sg3: "-ит",
    pl3: "-ят",
  },
};

/**
 * случиться — impersonnel / 3e personne (événement « qui arrive »).
 */
export const CURATED_SLUCHITSYA: TCuratedVerbPresent = {
  lemma: "случи́ться",
  aliases: ["случиться", "случи́ться"],
  conjugationClass: 2,
  defective: {
    allowedPersons: ["sg3", "pl3"],
    note: "Verbe défectif / impersonnel : surtout 3e personne.",
  },
  present: {
    sg3: "слу́чится",
    pl3: "слу́чатся",
  },
  endings: {
    sg3: "-ится",
    pl3: "-атся",
  },
};

export const CURATED_CHITAT_PRESENT: TCuratedVerbPresent = {
  lemma: "чита́ть",
  aliases: ["читать", "чита́ть"],
  conjugationClass: 1,
  present: {
    sg1: "чита́ю",
    sg2: "чита́ешь",
    sg3: "чита́ет",
  },
  endings: {
    sg1: "-ю",
    sg2: "-ешь",
    sg3: "-ет",
  },
  past: { m: "чита́л" },
};

export const CURATED_GOVORIT_PRESENT: TCuratedVerbPresent = {
  lemma: "говори́ть",
  aliases: ["говорить", "говори́ть"],
  conjugationClass: 2,
  present: {
    sg1: "говорю́",
    sg2: "говори́шь",
    sg3: "говори́т",
  },
  endings: {
    sg1: "-ю",
    sg2: "-ишь",
    sg3: "-ит",
  },
};

export const CURATED_POJTI_PRESENT: TCuratedVerbPresent = {
  lemma: "пойти́",
  aliases: ["пойти", "пойти́"],
  conjugationClass: 1,
  present: {
    sg1: "пойду́",
    sg2: "пойдёшь",
    sg3: "пойдёт",
    pl1: "пойдём",
    pl2: "пойдёте",
    pl3: "пойду́т",
  },
  endings: {
    sg1: "-у",
    sg2: "-ёшь",
    sg3: "-ёт",
    pl1: "-ём",
    pl2: "-ёте",
    pl3: "-ут",
  },
};

export const CURATED_PRESENT_VERBS: TCuratedVerbPresent[] = [
  CURATED_BOLET_HURT,
  CURATED_SLUCHITSYA,
  CURATED_CHITAT_PRESENT,
  CURATED_GOVORIT_PRESENT,
  CURATED_POJTI_PRESENT,
];

const byAlias = new Map<string, TCuratedVerbPresent>();
const bySurfaceForm = new Map<string, TCuratedVerbPresent>();

for (const verb of CURATED_PRESENT_VERBS) {
  for (const alias of verb.aliases) {
    byAlias.set(stripStressMarks(alias), verb);
  }
  byAlias.set(stripStressMarks(verb.lemma), verb);

  for (const form of Object.values(verb.present)) {
    if (form) {
      bySurfaceForm.set(stripStressMarks(form), verb);
    }
  }

  if (verb.past?.m) {
    bySurfaceForm.set(stripStressMarks(verb.past.m), verb);
  }
}

export function getCuratedPresentVerb(
  lemma: string,
): TCuratedVerbPresent | null {
  return byAlias.get(stripStressMarks(lemma)) ?? null;
}

/**
 * Lemme d'autorité depuis une forme fléchie curée (ex. пойдём → пойти́).
 * Pas de LLM — morphologie curée uniquement.
 */
export function resolveCuratedLemmaFromSurface(
  surface: string,
): TCuratedVerbPresent | null {
  return bySurfaceForm.get(stripStressMarks(surface)) ?? null;
}

export function isDefectivePresentVerb(lemma: string): boolean {
  return Boolean(getCuratedPresentVerb(lemma)?.defective);
}

export type TPresentPersonInfo = {
  key: TPresentPersonKey;
  label: string;
  numberLabel: "Singulier" | "Pluriel";
  ending: string;
};

/**
 * Infère personne + terminaison depuis la forme de surface (sans LLM).
 */
export function inferPresentPersonFromSurface(
  surface: string,
): TPresentPersonInfo | null {
  const bare = stripStressMarks(surface);

  const rules: Array<{ pattern: RegExp; key: TPresentPersonKey }> = [
    { pattern: /(ете|ёте|ите)$/, key: "pl2" },
    { pattern: /(ешь|ёшь|ишь)$/, key: "sg2" },
    { pattern: /(ут|ют|ат|ят)$/, key: "pl3" },
    { pattern: /(ем|ём|им)$/, key: "pl1" },
    { pattern: /(ет|ёт|ит)$/, key: "sg3" },
    { pattern: /(у|ю)$/, key: "sg1" },
  ];

  for (const rule of rules) {
    const match = bare.match(rule.pattern);

    if (match?.[1] || match?.[0]) {
      const endingBody = match[1] ?? match[0];

      return {
        key: rule.key,
        label: personKeyToChipLabel(rule.key),
        numberLabel: rule.key.startsWith("pl") ? "Pluriel" : "Singulier",
        ending: `-${endingBody}`,
      };
    }
  }

  return null;
}

export function personKeyToChipLabel(key: TPresentPersonKey): string {
  switch (key) {
    case "sg1":
    case "pl1":
      return "1re personne";
    case "sg2":
    case "pl2":
      return "2e personne";
    case "sg3":
    case "pl3":
      return "3e personne";
  }
}

export function personKeyToFrench(key: TPresentPersonKey): string {
  switch (key) {
    case "sg1":
      return "1re personne du singulier";
    case "sg2":
      return "2e personne du singulier";
    case "sg3":
      return "3e personne du singulier";
    case "pl1":
      return "1re personne du pluriel";
    case "pl2":
      return "2e personne du pluriel";
    case "pl3":
      return "3e personne du pluriel";
  }
}

export function buildPresentVisualNodes(
  verb: TCuratedVerbPresent,
): string[] {
  const allowed = verb.defective?.allowedPersons ?? PERSON_ORDER;
  const nodes: string[] = [];

  for (const key of PERSON_ORDER) {
    if (!allowed.includes(key)) {
      continue;
    }

    const form = verb.present[key];
    const ending = verb.endings[key];

    if (!form) {
      continue;
    }

    nodes.push(
      ending
        ? `${PERSON_PRONOUNS[key]} ${form} (${ending})`
        : `${PERSON_PRONOUNS[key]} ${form}`,
    );
  }

  return nodes;
}

export function getAllowedPresentEntries(
  verb: TCuratedVerbPresent,
): Array<{ key: TPresentPersonKey; form: string; ending?: string }> {
  const allowed = verb.defective?.allowedPersons ?? PERSON_ORDER;

  return PERSON_ORDER.filter((key) => allowed.includes(key) && verb.present[key])
    .map((key) => ({
      key,
      form: verb.present[key]!,
      ending: verb.endings[key],
    }));
}

export { PERSON_PRONOUNS, PERSON_ORDER };
