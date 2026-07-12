const POS_LABELS: Record<string, string> = {
  noun: "Nom",
  verb: "Verbe",
  adjective: "Adjectif",
  adverb: "Adverbe",
  preposition: "Préposition",
  conjunction: "Conjonction",
  pronoun: "Pronom",
  particle: "Particule",
};

const GENDER_LABELS: Record<string, string> = {
  m: "Masculin",
  f: "Féminin",
  n: "Neutre",
};

const ASPECT_LABELS: Record<string, string> = {
  imperfective: "Imparfaitif",
  perfective: "Parfaitif",
};

export function formatPosLabel(pos: string | null | undefined): string | null {
  if (!pos || pos === "unknown") {
    return null;
  }

  return POS_LABELS[pos] ?? pos;
}

export function formatGenderLabel(
  gender: string | null | undefined,
): string | null {
  if (!gender) {
    return null;
  }

  return GENDER_LABELS[gender] ?? gender;
}

export function formatAspectLabel(
  aspect: string | null | undefined,
): string | null {
  if (!aspect) {
    return null;
  }

  return ASPECT_LABELS[aspect] ?? aspect;
}

const MOVEMENT_LABELS: Record<string, string> = {
  unidirectionnel: "unidirectionnel",
  multidirectionnel: "multidirectionnel",
};

export function formatMovementLabel(
  movementType: string | null | undefined,
): string | null {
  if (!movementType) {
    return null;
  }

  return MOVEMENT_LABELS[movementType] ?? movementType;
}

export function formatReviewLevel(repetitions: number): string {
  if (repetitions === 0) {
    return "Nouveau";
  }

  if (repetitions <= 2) {
    return "En apprentissage";
  }

  if (repetitions <= 5) {
    return "En consolidation";
  }

  return "Maîtrisé";
}
