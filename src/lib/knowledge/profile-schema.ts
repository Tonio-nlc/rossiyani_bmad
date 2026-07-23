import { z } from "zod";

import {
  normalizeKnowledgePayload,
  type TNormalizationEvent,
} from "@/lib/knowledge/normalize-knowledge-payload";
import type {
  TKnowledgeLlmPayload,
  TKnowledgeMorphology,
  TKnowledgeParadigms,
  TKnowledgePedagogy,
  TKnowledgeSemantics,
  TKnowledgeSyntax,
} from "@/types/knowledge";

const optionalText = z
  .string()
  .transform((value) => {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  })
  .nullable()
  .optional();

const requiredText = z.string().trim().min(1);

/** Accepte string | null | undefined → string | null (jamais undefined en sortie). */
const nullishText = z.preprocess((value) => {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}, z.string().nullable());

const formEntrySchema = z.object({
  label: requiredText,
  form: requiredText,
});

const errorPairSchema = z.object({
  wrong: requiredText,
  correct: requiredText,
});

export const morphologySchema = z
  .object({
    gender: z.enum(["m", "f", "n"]).nullable().optional(),
    animacy: z.enum(["animate", "inanimate"]).nullable().optional(),
    declensionClass: optionalText,
    plural: z
      .object({
        form: optionalText,
        irregular: z.boolean().optional(),
        notes: optionalText,
      })
      .nullable()
      .optional(),
    irregularities: z.array(requiredText).optional(),
    caseParadigm: z.array(formEntrySchema).optional(),
    aspect: z.enum(["imperfective", "perfective"]).nullable().optional(),
    aspectPair: z
      .object({
        imperfective: optionalText,
        perfective: optionalText,
      })
      .nullable()
      .optional(),
    conjugationClass: optionalText,
    conjugationParadigm: z.array(formEntrySchema).optional(),
    tense: optionalText,
    person: optionalText,
    voice: optionalText,
    movementType: optionalText,
    preverbs: z
      .array(
        z.object({
          prefix: requiredText,
          verb: requiredText,
          meaning: optionalText,
        }),
      )
      .optional(),
    agreement: optionalText,
    comparative: optionalText,
    superlative: optionalText,
    shortForm: optionalText,
    declension: optionalText,
    pronounType: optionalText,
    pronounParadigm: z.array(formEntrySchema).optional(),
    specialForms: z.array(formEntrySchema).optional(),
    governedCases: z
      .array(
        z.object({
          grammaticalCase: requiredText,
          meaning: optionalText,
          examples: z.array(requiredText).optional(),
        }),
      )
      .optional(),
    variants: z.array(requiredText).optional(),
    nuances: z.array(requiredText).optional(),
  })
  .partial();

export const syntaxSchema = z
  .object({
    government: z.array(requiredText).optional(),
    requiredCase: optionalText,
    compatibleCases: z.array(requiredText).optional(),
    constructionPatterns: z.array(requiredText).optional(),
    requiresInfinitive: z.boolean().optional(),
    takesObject: z.boolean().optional(),
    movementPattern: optionalText,
    reflexive: z.boolean().optional(),
    impersonal: z.boolean().optional(),
    transitivity: optionalText,
  })
  .partial();

export const semanticsSchema = z
  .object({
    semanticCategory: optionalText,
    coreMeaning: optionalText,
    extendedMeaning: optionalText,
    register: optionalText,
    frequency: optionalText,
    collocations: z.array(requiredText).optional(),
    falseFriends: z.array(errorPairSchema).optional(),
    synonyms: z.array(requiredText).optional(),
    antonyms: z.array(requiredText).optional(),
  })
  .partial();

const whatIfComparisonSchema = z.object({
  fromForm: requiredText,
  toForm: requiredText,
  explanation: requiredText,
});

const teachingSchema = z
  .object({
    whyNotBaseForm: optionalText,
    russianExpresses: optionalText,
    visibleSignal: optionalText,
    whatIfComparisons: z.array(whatIfComparisonSchema).optional(),
    retentionPoints: z.array(requiredText).optional(),
  })
  .partial();

const conceptContrastSchema = z.object({
  fromForm: requiredText,
  toForm: requiredText,
  question: optionalText,
  explanation: requiredText,
});

const conceptMiniTableSchema = z
  .object({
    title: requiredText,
    rows: z.array(
      z.object({
        label: requiredText,
        form: requiredText,
      }),
    ),
  })
  .nullable()
  .optional();

const conceptSchema = z
  .object({
    phenomenonId: optionalText,
    phenomenonTitle: requiredText,
    priority: z.number().nullable().optional(),
    understand: z.array(requiredText).optional(),
    scheme: z.array(requiredText).optional(),
    contrasts: z.array(conceptContrastSchema).optional(),
    miniTable: conceptMiniTableSchema,
    retentionPoints: z.array(requiredText).optional(),
    family: z.array(requiredText).optional(),
  })
  .partial();

export const pedagogySchema = z
  .object({
    summary: optionalText,
    takeaway: optionalText,
    takeaways: z.array(requiredText).optional(),
    commonPatterns: z.array(requiredText).optional(),
    nextForms: z.array(requiredText).optional(),
    understandingPoints: z.array(requiredText).optional(),
    commonErrors: z.array(errorPairSchema).optional(),
    confusions: z.array(requiredText).optional(),
    tips: z.array(requiredText).optional(),
    progression: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]).nullable().optional(),
    relatedConcepts: z.array(requiredText).optional(),
    teaching: teachingSchema.optional(),
    concept: conceptSchema.optional(),
  })
  .partial();

export const paradigmsSchema = z
  .object({
    forms: z.array(formEntrySchema).optional(),
    cases: z.array(formEntrySchema).optional(),
    conjugation: z.array(formEntrySchema).optional(),
  })
  .partial();

export const knowledgeLlmResponseSchema = z.object({
  partOfSpeech: requiredText,
  /** Genre : noms / adjectifs / pronoms — absent sinon (pas inventé). */
  gender: z.enum(["m", "f", "n"]).nullable().optional(),
  /** Aspect : verbes uniquement — absent sinon. */
  aspect: z.enum(["imperfective", "perfective"]).nullable().optional(),
  /** Type de mouvement : verbes uniquement — absent sinon. */
  movementType: nullishText.optional(),
  /** Régimes : verbes typiquement — optionnel. */
  government: z.preprocess(
    (value) => (Array.isArray(value) ? value : []),
    z.array(z.string()),
  ),
  semanticCategory: nullishText.optional(),
  register: nullishText.optional(),
  difficulty: z.preprocess((value) => {
    if (value === undefined || value === null || value === "") {
      return null;
    }

    return value;
  }, z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]).or(z.string().trim().min(1)).nullable()),
  notes: z.preprocess((value) => {
    if (value === undefined || value === null) {
      return "";
    }

    return typeof value === "string" ? value.trim() : "";
  }, z.string()),
  tags: z.preprocess((value) => {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .filter((tag): tag is string => typeof tag === "string")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }, z.array(z.string())),
  morphology: morphologySchema.default({}),
  syntax: syntaxSchema.default({}),
  semantics: semanticsSchema.default({}),
  pedagogy: pedagogySchema.default({}),
  paradigms: paradigmsSchema.default({}),
});

function extractJsonPayload(content: string): string {
  const trimmed = content.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);

  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const objectMatch = trimmed.match(/\{[\s\S]*\}/);

  if (objectMatch?.[0]) {
    return objectMatch[0];
  }

  return trimmed;
}

function repairJsonPayload(content: string): string {
  return content
    .replace(/,\s*([}\]])/g, "$1")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"');
}

export interface TParseKnowledgeOptions {
  lemmaForm?: string;
  debug?: boolean;
}

export interface TParseKnowledgeResult {
  payload: TKnowledgeLlmPayload;
  normalizationEvents: TNormalizationEvent[];
}

function formatZodIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
    .join(" | ");
}

function parseNormalizedPayload(
  raw: unknown,
  options?: TParseKnowledgeOptions,
): TParseKnowledgeResult {
  const { payload, events } = normalizeKnowledgePayload(raw, {
    lemmaForm: options?.lemmaForm,
    debug: options?.debug,
  });

  try {
    const parsed = knowledgeLlmResponseSchema.parse(payload);

    return {
      payload: {
        ...parsed,
        morphology: parsed.morphology as TKnowledgeMorphology,
        syntax: parsed.syntax as TKnowledgeSyntax,
        semantics: parsed.semantics as TKnowledgeSemantics,
        pedagogy: parsed.pedagogy as TKnowledgePedagogy,
        paradigms: parsed.paradigms as TKnowledgeParadigms,
      },
      normalizationEvents: events,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Réponse LLM invalide après normalisation : ${formatZodIssues(error)}`,
      );
    }

    throw error;
  }
}

export function parseKnowledgeLlmJsonWithMeta(
  content: string,
  options?: TParseKnowledgeOptions,
): TParseKnowledgeResult {
  const extracted = extractJsonPayload(content);
  const attempts = [extracted, repairJsonPayload(extracted)];
  let lastError: unknown;

  for (const candidate of attempts) {
    try {
      return parseNormalizedPayload(JSON.parse(candidate), options);
    } catch (error) {
      lastError = error;

      if (!(error instanceof SyntaxError)) {
        throw error;
      }
    }
  }

  if (lastError instanceof Error) {
    throw lastError;
  }

  throw new Error(
    "Réponse LLM invalide : le JSON de connaissance n'a pas pu être analysé",
  );
}

export function parseKnowledgeLlmJson(
  content: string,
  options?: TParseKnowledgeOptions,
): TKnowledgeLlmPayload {
  return parseKnowledgeLlmJsonWithMeta(content, options).payload;
}
