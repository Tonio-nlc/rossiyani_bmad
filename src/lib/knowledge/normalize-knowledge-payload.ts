export interface TNormalizationEvent {
  path: string;
  from: string;
  to: string;
}

export interface TNormalizeKnowledgeOptions {
  lemmaForm?: string;
  debug?: boolean;
  onEvent?: (event: TNormalizationEvent) => void;
}

export interface TNormalizeKnowledgeResult {
  payload: Record<string, unknown>;
  events: TNormalizationEvent[];
}

const ANIMACY_TO_CANONICAL: Record<string, "animate" | "inanimate"> = {
  animate: "animate",
  anim: "animate",
  animé: "animate",
  anime: "animate",
  human: "animate",
  humain: "animate",
  personal: "animate",
  personne: "animate",
  одушевлённый: "animate",
  одушевленный: "animate",
  inanimate: "inanimate",
  inanimé: "inanimate",
  inanime: "inanimate",
  inan: "inanimate",
  inanim: "inanimate",
  неодушевлённый: "inanimate",
  неодушевленный: "inanimate",
};

const GENDER_TO_CANONICAL: Record<string, "m" | "f" | "n"> = {
  m: "m",
  masc: "m",
  masculine: "m",
  masculin: "m",
  f: "f",
  fem: "f",
  feminine: "f",
  feminin: "f",
  féminin: "f",
  n: "n",
  neut: "n",
  neuter: "n",
  neutre: "n",
};

const ASPECT_TO_CANONICAL: Record<string, "imperfective" | "perfective"> = {
  imperfective: "imperfective",
  imperfectif: "imperfective",
  impf: "imperfective",
  "imp.": "imperfective",
  perfective: "perfective",
  perfectif: "perfective",
  pf: "perfective",
  "pf.": "perfective",
};

const POS_TO_CANONICAL: Record<string, string> = {
  noun: "noun",
  nom: "noun",
  substantif: "noun",
  "nom commun": "noun",
  "nom propre": "noun",
  verb: "verb",
  verbe: "verb",
  adjective: "adjective",
  adjectif: "adjective",
  adverb: "adverb",
  adverbe: "adverb",
  preposition: "preposition",
  préposition: "preposition",
  conjunction: "conjunction",
  conjonction: "conjunction",
  pronoun: "pronoun",
  pronom: "pronoun",
  particle: "particle",
  particule: "particle",
};

const POS_WITH_GENDER = new Set(["noun", "adjective", "pronoun"]);
const POS_VERB = "verb";

function deleteField(
  target: Record<string, unknown>,
  key: string,
  path: string,
  events: TNormalizationEvent[],
  options?: TNormalizeKnowledgeOptions,
) {
  if (!(key in target)) {
    return;
  }

  recordEvent(events, options, path, target[key], "absent");
  delete target[key];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function recordEvent(
  events: TNormalizationEvent[],
  options: TNormalizeKnowledgeOptions | undefined,
  path: string,
  from: unknown,
  to: unknown,
) {
  const fromLabel = describeValue(from);
  const toLabel = describeValue(to);

  if (fromLabel === toLabel) {
    return;
  }

  const event = {
    path,
    from: fromLabel,
    to: toLabel,
  };

  events.push(event);
  options?.onEvent?.(event);

  if (options?.debug) {
    console.log(`[normalize] ${options.lemmaForm ?? "?"} — ${path}: ${fromLabel} -> ${toLabel}`);
  }
}

function describeValue(value: unknown): string {
  if (typeof value === "string") {
    return value.length > 80 ? `${value.slice(0, 77)}...` : value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (value === null) {
    return "null";
  }

  if (Array.isArray(value)) {
    return `array(${value.length})`;
  }

  if (isRecord(value)) {
    return "object";
  }

  return typeof value;
}

function normalizeAnimacy(
  value: unknown,
  path: string,
  events: TNormalizationEvent[],
  options?: TNormalizeKnowledgeOptions,
): "animate" | "inanimate" | null | undefined {
  if (value === null || value === undefined) {
    return value === null ? null : undefined;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const canonical = ANIMACY_TO_CANONICAL[value.trim().toLowerCase()];

  if (!canonical) {
    recordEvent(events, options, path, value, "null");
    return null;
  }

  if (canonical !== value) {
    recordEvent(events, options, path, value, canonical);
  }

  return canonical;
}

function normalizeGender(
  value: unknown,
  path: string,
  events: TNormalizationEvent[],
  options?: TNormalizeKnowledgeOptions,
): "m" | "f" | "n" | null | undefined {
  if (value === null || value === undefined) {
    return value === null ? null : undefined;
  }

  if (typeof value !== "string") {
    recordEvent(events, options, path, value, "null");
    return null;
  }

  const canonical = GENDER_TO_CANONICAL[value.trim().toLowerCase()];

  if (!canonical) {
    recordEvent(events, options, path, value, "null");
    return null;
  }

  if (canonical !== value) {
    recordEvent(events, options, path, value, canonical);
  }

  return canonical;
}

function normalizeAspect(
  value: unknown,
  path: string,
  events: TNormalizationEvent[],
  options?: TNormalizeKnowledgeOptions,
): "imperfective" | "perfective" | null | undefined {
  if (value === null || value === undefined) {
    return value === null ? null : undefined;
  }

  if (typeof value !== "string") {
    recordEvent(events, options, path, value, "null");
    return null;
  }

  const canonical = ASPECT_TO_CANONICAL[value.trim().toLowerCase()];

  if (!canonical) {
    recordEvent(events, options, path, value, "null");
    return null;
  }

  if (canonical !== value) {
    recordEvent(events, options, path, value, canonical);
  }

  return canonical;
}

function normalizePartOfSpeech(
  value: unknown,
  path: string,
  events: TNormalizationEvent[],
  options?: TNormalizeKnowledgeOptions,
): string | null {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const trimmed = value.trim();
  const canonical = POS_TO_CANONICAL[trimmed.toLowerCase()] ?? trimmed.toLowerCase();

  if (canonical !== trimmed) {
    recordEvent(events, options, path, trimmed, canonical);
  }

  return canonical;
}

/**
 * Retire les champs incompatibles avec le POS.
 * Absent ≠ null inventé : on delete la clé.
 */
function applyPosFieldConstraints(
  payload: Record<string, unknown>,
  events: TNormalizationEvent[],
  options?: TNormalizeKnowledgeOptions,
) {
  const pos = normalizePartOfSpeech(
    payload.partOfSpeech,
    "partOfSpeech",
    events,
    options,
  );

  if (pos) {
    payload.partOfSpeech = pos;
  }

  if (pos && !POS_WITH_GENDER.has(pos)) {
    deleteField(payload, "gender", "gender", events, options);

    if (isRecord(payload.morphology)) {
      deleteField(
        payload.morphology,
        "gender",
        "morphology.gender",
        events,
        options,
      );
    }
  }

  if (pos && pos !== POS_VERB) {
    deleteField(payload, "aspect", "aspect", events, options);
    deleteField(payload, "movementType", "movementType", events, options);
    deleteField(payload, "government", "government", events, options);

    if (isRecord(payload.morphology)) {
      deleteField(
        payload.morphology,
        "aspect",
        "morphology.aspect",
        events,
        options,
      );
      deleteField(
        payload.morphology,
        "aspectPair",
        "morphology.aspectPair",
        events,
        options,
      );
      deleteField(
        payload.morphology,
        "movementType",
        "morphology.movementType",
        events,
        options,
      );
      deleteField(
        payload.morphology,
        "conjugationClass",
        "morphology.conjugationClass",
        events,
        options,
      );
      deleteField(
        payload.morphology,
        "conjugationParadigm",
        "morphology.conjugationParadigm",
        events,
        options,
      );
      deleteField(
        payload.morphology,
        "preverbs",
        "morphology.preverbs",
        events,
        options,
      );
    }

    if (isRecord(payload.paradigms)) {
      deleteField(
        payload.paradigms,
        "conjugation",
        "paradigms.conjugation",
        events,
        options,
      );
    }
  }
}

function normalizePlural(
  value: unknown,
  path: string,
  events: TNormalizationEvent[],
  options?: TNormalizeKnowledgeOptions,
): Record<string, unknown> | null | undefined {
  if (value === null || value === undefined) {
    return value === null ? null : undefined;
  }

  if (typeof value === "boolean") {
    recordEvent(events, options, path, value, "null");
    return null;
  }

  if (typeof value === "string") {
    const normalized = { form: value, notes: null };
    recordEvent(events, options, path, value, "object");
    return normalized;
  }

  if (isRecord(value)) {
    return {
      ...value,
      form: typeof value.form === "string" ? value.form : null,
      notes: typeof value.notes === "string" ? value.notes : null,
    };
  }

  return undefined;
}

function normalizeAspectPair(
  value: unknown,
  aspect: string | null | undefined,
  path: string,
  events: TNormalizationEvent[],
  options?: TNormalizeKnowledgeOptions,
): Record<string, unknown> | null | undefined {
  if (value === null || value === undefined) {
    return value === null ? null : undefined;
  }

  if (typeof value === "string") {
    const normalized =
      aspect === "perfective"
        ? { imperfective: value, perfective: null }
        : { perfective: value, imperfective: null };

    recordEvent(events, options, path, value, "object");
    return normalized;
  }

  if (isRecord(value)) {
    return {
      imperfective:
        typeof value.imperfective === "string" ? value.imperfective : null,
      perfective:
        typeof value.perfective === "string" ? value.perfective : null,
    };
  }

  return undefined;
}

function serializeStructuredEntry(entry: unknown): string | null {
  if (typeof entry === "string") {
    const trimmed = entry.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (!isRecord(entry)) {
    return null;
  }

  const parts = [
    entry.construction,
    entry.governingWord,
    entry.governedCase,
    entry.requiredCase,
    entry.case,
    entry.role,
    entry.type,
    entry.label,
    entry.description,
    entry.pattern,
    entry.notes,
    entry.meaning,
    entry.explanation,
  ]
    .filter((part) => typeof part === "string" && part.trim().length > 0)
    .map((part) => (part as string).trim());

  if (parts.length === 0) {
    return JSON.stringify(entry);
  }

  return parts.join(" — ");
}

function serializeGovernmentEntry(entry: unknown): string | null {
  return serializeStructuredEntry(entry);
}

function normalizeGovernmentArray(
  value: unknown,
  path: string,
  events: TNormalizationEvent[],
  options?: TNormalizeKnowledgeOptions,
): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const normalized = value
    .map((entry) => serializeGovernmentEntry(entry))
    .filter((entry): entry is string => Boolean(entry));

  const hadObject = value.some((entry) => isRecord(entry));

  if (hadObject) {
    recordEvent(events, options, path, "object[]", `string[](${normalized.length})`);
  }

  return normalized;
}

function normalizeScalarText(
  value: unknown,
  path: string,
  events: TNormalizationEvent[],
  options?: TNormalizeKnowledgeOptions,
): string | null | undefined {
  if (value === null || value === undefined) {
    return value === null ? null : undefined;
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    const normalized = String(value);
    recordEvent(events, options, path, value, normalized);
    return normalized;
  }

  if (Array.isArray(value)) {
    const normalized = value
      .map((entry) =>
        typeof entry === "string" ? entry.trim() : serializeStructuredEntry(entry),
      )
      .filter((entry): entry is string => Boolean(entry))
      .join(" ; ");
    recordEvent(events, options, path, value, normalized || "null");
    return normalized || null;
  }

  if (isRecord(value)) {
    const normalized = serializeStructuredEntry(value);
    recordEvent(events, options, path, value, normalized ?? "null");
    return normalized;
  }

  return undefined;
}

function normalizePreverbEntry(
  entry: unknown,
  index: number,
  path: string,
  events: TNormalizationEvent[],
  options?: TNormalizeKnowledgeOptions,
): Record<string, unknown> | null {
  if (isRecord(entry) && typeof entry.prefix === "string" && typeof entry.verb === "string") {
    return {
      prefix: entry.prefix.trim(),
      verb: entry.verb.trim(),
      meaning:
        typeof entry.meaning === "string"
          ? entry.meaning.trim() || null
          : null,
    };
  }

  if (typeof entry === "string") {
    const trimmed = entry.trim();
    const verb = extractRussianForm(trimmed) || trimmed;
    const normalized = {
      prefix: "—",
      verb,
      meaning: trimmed,
    };
    recordEvent(events, options, `${path}[${index}]`, entry, "object");
    return normalized;
  }

  return null;
}

function normalizePreverbs(
  value: unknown,
  path: string,
  events: TNormalizationEvent[],
  options?: TNormalizeKnowledgeOptions,
): Array<Record<string, unknown>> | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  return value
    .map((entry, index) => normalizePreverbEntry(entry, index, path, events, options))
    .filter((entry): entry is Record<string, unknown> => Boolean(entry));
}

function normalizeStringArray(
  value: unknown,
  path: string,
  events: TNormalizationEvent[],
  options?: TNormalizeKnowledgeOptions,
): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const hadObject = value.some((entry) => isRecord(entry));

  if (hadObject) {
    const normalized = value
      .map((entry) => serializeStructuredEntry(entry))
      .filter((entry): entry is string => Boolean(entry));
    recordEvent(events, options, path, "object[]", `string[](${normalized.length})`);
    return normalized;
  }

  return value.filter((entry): entry is string => typeof entry === "string");
}

function normalizeErrorPairEntry(
  entry: unknown,
  lemmaForm: string | undefined,
): { wrong: string; correct: string } | null {
  if (typeof entry === "string") {
    return {
      wrong: lemmaForm ?? "forme incorrecte",
      correct: extractRussianForm(entry),
    };
  }

  if (!isRecord(entry)) {
    return null;
  }

  if (typeof entry.wrong === "string" && typeof entry.correct === "string") {
    return {
      wrong: entry.wrong.trim(),
      correct: entry.correct.trim(),
    };
  }

  if (typeof entry.word === "string") {
    return {
      wrong: lemmaForm ?? "forme incorrecte",
      correct: extractRussianForm(entry.word),
    };
  }

  return null;
}

function normalizeErrorPairs(
  value: unknown,
  lemmaForm: string | undefined,
  path: string,
  events: TNormalizationEvent[],
  options?: TNormalizeKnowledgeOptions,
): Array<{ wrong: string; correct: string }> | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const normalized = value
    .map((entry) => normalizeErrorPairEntry(entry, lemmaForm))
    .filter((entry): entry is { wrong: string; correct: string } => Boolean(entry));

  const needsNormalization = value.some((entry) => {
    if (typeof entry === "string") {
      return true;
    }

    if (!isRecord(entry)) {
      return false;
    }

    return (
      typeof entry.word === "string" ||
      typeof entry.wrong !== "string" ||
      typeof entry.correct !== "string"
    );
  });

  if (needsNormalization) {
    recordEvent(events, options, path, "variant[]", `object[](${normalized.length})`);
  }

  return normalized;
}

function extractRussianForm(text: string): string {
  const match = text.match(/[\u0400-\u04FF][\u0400-\u04FF\u0300-\u036F]*/u);
  return match?.[0] ?? text.trim();
}

function normalizeFormEntry(
  entry: unknown,
  index: number,
  path: string,
  events: TNormalizationEvent[],
  options?: TNormalizeKnowledgeOptions,
): Array<{ label: string; form: string }> {
  if (typeof entry === "string") {
    const normalized = {
      label: `forme ${index + 1}`,
      form: extractRussianForm(entry),
    };
    recordEvent(events, options, `${path}[${index}]`, entry, "object");
    return [normalized];
  }

  if (!isRecord(entry)) {
    return [];
  }

  if (typeof entry.form === "string" && entry.form.trim()) {
    return [
      {
        label:
          typeof entry.label === "string" && entry.label.trim()
            ? entry.label.trim()
            : `forme ${index + 1}`,
        form: entry.form.trim(),
      },
    ];
  }

  if (Array.isArray(entry.forms)) {
    const rawForms = entry.forms;
    const label =
      typeof entry.label === "string" && entry.label.trim()
        ? entry.label.trim()
        : `forme ${index + 1}`;
    const forms = rawForms
      .filter((form): form is string => typeof form === "string" && form.trim().length > 0)
      .map((form, formIndex) => ({
        label: rawForms.length > 1 ? `${label} (${formIndex + 1})` : label,
        form: form.trim(),
      }));

    if (forms.length > 0) {
      recordEvent(events, options, `${path}[${index}]`, "forms[]", `form(${forms.length})`);
    }

    return forms;
  }

  return [];
}

function normalizeFormEntryArray(
  value: unknown,
  path: string,
  events: TNormalizationEvent[],
  options?: TNormalizeKnowledgeOptions,
): Array<{ label: string; form: string }> | undefined {
  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) {
      recordEvent(events, options, path, value, "array(0)");
      return [];
    }

    recordEvent(events, options, path, "string", "array(1)");
    return [{ label: "forme", form: trimmed }];
  }

  if (!Array.isArray(value)) {
    if (value === null || value === undefined) {
      return value === null ? [] : undefined;
    }

    recordEvent(events, options, path, value, "array(0)");
    return [];
  }

  const normalized = value.flatMap((entry, index) =>
    normalizeFormEntry(entry, index, path, events, options),
  );

  return normalized.length > 0 ? normalized : [];
}

function normalizeGovernedCases(
  value: unknown,
  path: string,
  events: TNormalizationEvent[],
  options?: TNormalizeKnowledgeOptions,
): Array<Record<string, unknown>> | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const hadString = value.some((entry) => typeof entry === "string");

  const normalized = value
    .map((entry) => {
      if (typeof entry === "string") {
        return {
          grammaticalCase: entry.trim(),
          meaning: null,
        };
      }

      if (isRecord(entry) && typeof entry.grammaticalCase === "string") {
        return entry;
      }

      return null;
    })
    .filter((entry): entry is Record<string, unknown> => Boolean(entry));

  if (hadString) {
    recordEvent(events, options, path, "string[]", `object[](${normalized.length})`);
  }

  return normalized;
}

function normalizeMorphology(
  morphology: Record<string, unknown>,
  aspect: string | null | undefined,
  events: TNormalizationEvent[],
  options?: TNormalizeKnowledgeOptions,
): Record<string, unknown> {
  const normalized = { ...morphology };

  if ("gender" in normalized) {
    const gender = normalizeGender(
      normalized.gender,
      "morphology.gender",
      events,
      options,
    );

    if (gender !== undefined) {
      normalized.gender = gender;
    }
  }

  if ("animacy" in normalized) {
    const animacy = normalizeAnimacy(
      normalized.animacy,
      "morphology.animacy",
      events,
      options,
    );

    if (animacy !== undefined) {
      normalized.animacy = animacy;
    }
  }

  if ("aspect" in normalized) {
    const morphAspect = normalizeAspect(
      normalized.aspect,
      "morphology.aspect",
      events,
      options,
    );

    if (morphAspect !== undefined) {
      normalized.aspect = morphAspect;
    }
  }

  if ("plural" in normalized) {
    const plural = normalizePlural(
      normalized.plural,
      "morphology.plural",
      events,
      options,
    );

    if (plural !== undefined) {
      normalized.plural = plural;
    }
  }

  if ("aspectPair" in normalized) {
    const aspectPair = normalizeAspectPair(
      normalized.aspectPair,
      aspect ?? (typeof normalized.aspect === "string" ? normalized.aspect : null),
      "morphology.aspectPair",
      events,
      options,
    );

    if (aspectPair !== undefined) {
      normalized.aspectPair = aspectPair;
    }
  }

  if ("conjugationClass" in normalized) {
    const conjugationClass = normalizeScalarText(
      normalized.conjugationClass,
      "morphology.conjugationClass",
      events,
      options,
    );

    if (conjugationClass !== undefined) {
      normalized.conjugationClass = conjugationClass;
    }
  }

  for (const key of [
    "tense",
    "person",
    "voice",
    "movementType",
    "agreement",
    "comparative",
    "superlative",
    "shortForm",
    "declension",
    "pronounType",
  ] as const) {
    if (key in normalized) {
      const scalar = normalizeScalarText(
        normalized[key],
        `morphology.${key}`,
        events,
        options,
      );

      if (scalar !== undefined) {
        normalized[key] = scalar;
      }
    }
  }

  if ("preverbs" in normalized) {
    const preverbs = normalizePreverbs(
      normalized.preverbs,
      "morphology.preverbs",
      events,
      options,
    );

    if (preverbs !== undefined) {
      normalized.preverbs = preverbs;
    }
  }

  if ("specialForms" in normalized) {
    const specialForms = normalizeFormEntryArray(
      normalized.specialForms,
      "morphology.specialForms",
      events,
      options,
    );

    if (specialForms !== undefined) {
      normalized.specialForms = specialForms;
    }
  }

  if ("governedCases" in normalized) {
    const governedCases = normalizeGovernedCases(
      normalized.governedCases,
      "morphology.governedCases",
      events,
      options,
    );

    if (governedCases !== undefined) {
      normalized.governedCases = governedCases;
    }
  }

  for (const key of [
    "caseParadigm",
    "conjugationParadigm",
    "pronounParadigm",
  ] as const) {
    if (key in normalized) {
      const value = normalized[key];
      const entries = Array.isArray(value)
        ? normalizeFormEntryArray(value, `morphology.${key}`, events, options)
        : typeof value === "string"
          ? normalizeFormEntryArray([value], `morphology.${key}`, events, options)
          : undefined;

      if (entries !== undefined) {
        normalized[key] = entries;
      }
    }
  }

  return normalized;
}

function normalizeSyntax(
  syntax: Record<string, unknown>,
  events: TNormalizationEvent[],
  options?: TNormalizeKnowledgeOptions,
): Record<string, unknown> {
  const normalized = { ...syntax };

  if ("government" in normalized) {
    const government = normalizeGovernmentArray(
      normalized.government,
      "syntax.government",
      events,
      options,
    );

    if (government !== undefined) {
      normalized.government = government;
    }
  }

  if ("constructionPatterns" in normalized) {
    const patterns = normalizeStringArray(
      normalized.constructionPatterns,
      "syntax.constructionPatterns",
      events,
      options,
    );

    if (patterns !== undefined) {
      normalized.constructionPatterns = patterns;
    }
  }

  return normalized;
}

function normalizeSemantics(
  semantics: Record<string, unknown>,
  lemmaForm: string | undefined,
  events: TNormalizationEvent[],
  options?: TNormalizeKnowledgeOptions,
): Record<string, unknown> {
  const normalized = { ...semantics };

  if ("falseFriends" in normalized) {
    const falseFriends = normalizeErrorPairs(
      normalized.falseFriends,
      lemmaForm,
      "semantics.falseFriends",
      events,
      options,
    );

    if (falseFriends !== undefined) {
      normalized.falseFriends = falseFriends;
    }
  }

  return normalized;
}

function normalizePedagogy(
  pedagogy: Record<string, unknown>,
  lemmaForm: string | undefined,
  events: TNormalizationEvent[],
  options?: TNormalizeKnowledgeOptions,
): Record<string, unknown> {
  const normalized = { ...pedagogy };

  if ("commonErrors" in normalized) {
    const commonErrors = normalizeErrorPairs(
      normalized.commonErrors,
      lemmaForm,
      "pedagogy.commonErrors",
      events,
      options,
    );

    if (commonErrors !== undefined) {
      normalized.commonErrors = commonErrors;
    }
  }

  if ("confusions" in normalized) {
    const confusions = normalizeStringArray(
      normalized.confusions,
      "pedagogy.confusions",
      events,
      options,
    );

    if (confusions !== undefined) {
      normalized.confusions = confusions;
    }
  }

  return normalized;
}

function normalizeParadigms(
  paradigms: Record<string, unknown>,
  events: TNormalizationEvent[],
  options?: TNormalizeKnowledgeOptions,
): Record<string, unknown> {
  const normalized = { ...paradigms };

  for (const key of ["forms", "cases", "conjugation"] as const) {
    if (key in normalized) {
      const entries = normalizeFormEntryArray(
        normalized[key],
        `paradigms.${key}`,
        events,
        options,
      );

      if (entries !== undefined) {
        normalized[key] = entries;
      }
    }
  }

  return normalized;
}

export function normalizeKnowledgePayload(
  raw: unknown,
  options?: TNormalizeKnowledgeOptions,
): TNormalizeKnowledgeResult {
  const events: TNormalizationEvent[] = [];

  if (!isRecord(raw)) {
    return { payload: {}, events };
  }

  const payload = structuredClone(raw) as Record<string, unknown>;

  if ("gender" in payload) {
    const gender = normalizeGender(payload.gender, "gender", events, options);

    if (gender !== undefined) {
      payload.gender = gender;
    }
  }

  if ("aspect" in payload) {
    const topAspect = normalizeAspect(payload.aspect, "aspect", events, options);

    if (topAspect !== undefined) {
      payload.aspect = topAspect;
    }
  }

  if ("government" in payload) {
    const government = normalizeGovernmentArray(
      payload.government,
      "government",
      events,
      options,
    );

    if (government !== undefined) {
      payload.government = government;
    }
  }

  const aspectForMorph =
    typeof payload.aspect === "string"
      ? payload.aspect
      : isRecord(payload.morphology) && typeof payload.morphology.aspect === "string"
        ? payload.morphology.aspect
        : null;

  if (isRecord(payload.morphology)) {
    payload.morphology = normalizeMorphology(
      payload.morphology,
      aspectForMorph,
      events,
      options,
    );
  }

  if (isRecord(payload.syntax)) {
    payload.syntax = normalizeSyntax(payload.syntax, events, options);
  }

  if (isRecord(payload.semantics)) {
    payload.semantics = normalizeSemantics(
      payload.semantics,
      options?.lemmaForm,
      events,
      options,
    );
  }

  if (isRecord(payload.pedagogy)) {
    payload.pedagogy = normalizePedagogy(
      payload.pedagogy,
      options?.lemmaForm,
      events,
      options,
    );
  }

  if (isRecord(payload.paradigms)) {
    payload.paradigms = normalizeParadigms(payload.paradigms, events, options);
  }

  applyPosFieldConstraints(payload, events, options);

  return { payload, events };
}

export function categorizeNormalizationPath(path: string): string {
  if (path.includes("animacy")) {
    return "animacy";
  }

  if (path.includes("plural")) {
    return "plural";
  }

  if (path.includes("aspectPair")) {
    return "aspectPair";
  }

  if (path.includes("conjugationClass")) {
    return "conjugationClass";
  }

  if (path.includes("falseFriends")) {
    return "falseFriends";
  }

  if (path.includes("specialForms")) {
    return "specialForms";
  }

  if (path.includes("governedCases")) {
    return "governedCases";
  }

  if (path.includes("constructionPatterns")) {
    return "constructionPatterns";
  }

  if (path.includes("government")) {
    return "government";
  }

  if (path.includes("preverbs")) {
    return "preverbs";
  }

  if (path.includes("confusions")) {
    return "confusions";
  }

  if (path.includes("gender")) {
    return "gender";
  }

  if (path.includes("comparative") || path.includes("superlative")) {
    return "comparison";
  }

  if (path.includes("shortForm") || path.includes("agreement")) {
    return "morphologyScalar";
  }

  if (path.includes("caseParadigm")) {
    return "caseParadigm";
  }

  if (path.includes("tense") || path.includes("person")) {
    return "verbFeatures";
  }

  if (path.startsWith("paradigms.")) {
    return "paradigms";
  }

  return path.split(".")[0] ?? path;
}

export function summarizeNormalizationEvents(
  events: TNormalizationEvent[],
): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const event of events) {
    const key = categorizeNormalizationPath(event.path);
    counts[key] = (counts[key] ?? 0) + 1;
  }

  return counts;
}
