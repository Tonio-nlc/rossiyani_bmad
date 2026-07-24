import type {
  TCanonicalExplanation,
  TConceptCategory,
  TConceptDifficulty,
  TConceptGraphEdge,
  TConceptProgression,
  TConceptValidationStatus,
  TLinguisticConcept,
  TVisualModel,
} from "@/types/linguistic-concept";
import { createAdminClient } from "@/lib/supabase/admin";

export type TLinguisticConceptRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  difficulty: string;
  summary: string;
  payload: Record<string, unknown> | null;
  validation_status: string | null;
  validated: boolean | null;
};

export type TConceptRelationRow = {
  from_concept_id: string;
  to_concept_id: string;
  relation: string;
};

const VALIDATION_STATUSES = new Set<TConceptValidationStatus>([
  "brouillon",
  "a-valider",
  "valide",
]);

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function mapValidationStatus(
  raw: string | null | undefined,
  validated: boolean | null | undefined,
): TConceptValidationStatus {
  if (raw && VALIDATION_STATUSES.has(raw as TConceptValidationStatus)) {
    return raw as TConceptValidationStatus;
  }

  return validated ? "valide" : "a-valider";
}

function mapPayloadToFields(payload: Record<string, unknown> | null): {
  coreIdea: string;
  whyItExists: string;
  mentalModel: string;
  visualModel: TVisualModel;
  canonicalExplanation: TCanonicalExplanation;
  teachingScenario: TLinguisticConcept["teachingScenario"];
  commonMistakes: string[];
  relatedConcepts: string[];
  relatedLemmas: string[];
  examples: string[];
  progression: TConceptProgression;
  teacherNotes?: string;
} {
  const p = payload ?? {};

  const visualModelRaw = (p.visualModel ?? {}) as Record<string, unknown>;
  const canonicalRaw = (p.canonicalExplanation ?? {}) as Record<string, unknown>;
  const progressionRaw = (p.progression ?? {}) as Record<string, unknown>;

  return {
    coreIdea: asString(p.coreIdea),
    whyItExists: asString(p.whyItExists),
    mentalModel: asString(p.mentalModel),
    visualModel: {
      type: (asString(visualModelRaw.type, "diagram") as TVisualModel["type"]),
      nodes: asStringArray(visualModelRaw.nodes),
      caption: asString(visualModelRaw.caption) || undefined,
    },
    canonicalExplanation: {
      understand: asStringArray(canonicalRaw.understand),
      scheme: asStringArray(canonicalRaw.scheme),
      contrasts: Array.isArray(canonicalRaw.contrasts)
        ? (canonicalRaw.contrasts as TCanonicalExplanation["contrasts"])
        : [],
      miniTable:
        canonicalRaw.miniTable && typeof canonicalRaw.miniTable === "object"
          ? (canonicalRaw.miniTable as TCanonicalExplanation["miniTable"])
          : null,
      retentionPoints: asStringArray(canonicalRaw.retentionPoints),
      family: asStringArray(canonicalRaw.family),
    },
    teachingScenario:
      p.teachingScenario && typeof p.teachingScenario === "object"
        ? (p.teachingScenario as TLinguisticConcept["teachingScenario"])
        : undefined,
    commonMistakes: asStringArray(p.commonMistakes),
    relatedConcepts: asStringArray(p.relatedConcepts),
    relatedLemmas: asStringArray(p.relatedLemmas),
    examples: asStringArray(p.examples),
    progression: {
      beginner: asString(progressionRaw.beginner),
      intermediate: asString(progressionRaw.intermediate) || undefined,
      advanced: asString(progressionRaw.advanced) || undefined,
    },
    teacherNotes: asString(p.teacherNotes) || undefined,
  };
}

export function mapConceptRowToLinguisticConcept(
  row: TLinguisticConceptRow,
): TLinguisticConcept {
  const fields = mapPayloadToFields(row.payload);

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category as TConceptCategory,
    difficulty: row.difficulty as TConceptDifficulty,
    summary: row.summary,
    validationStatus: mapValidationStatus(
      row.validation_status,
      row.validated,
    ),
    ...fields,
  };
}

export function mapRelationRowToEdge(
  row: TConceptRelationRow,
): TConceptGraphEdge | null {
  if (
    row.relation !== "prerequisite" &&
    row.relation !== "related" &&
    row.relation !== "extends"
  ) {
    return null;
  }

  return {
    fromId: row.from_concept_id,
    toId: row.to_concept_id,
    relation: row.relation,
  };
}

/**
 * Charge le Concept Graph depuis Supabase.
 * Ne lève jamais vers le caller métier : en cas d'erreur, retourne listes vides
 * (le registry applique alors le repli in-memory).
 */
export async function loadConceptGraphFromDb(): Promise<{
  concepts: TLinguisticConcept[];
  relations: TConceptGraphEdge[];
  source: "db" | "unavailable" | "empty";
}> {
  try {
    const admin = createAdminClient();

    const [conceptsResult, relationsResult] = await Promise.all([
      admin
        .from("linguistic_concepts")
        .select(
          "id, slug, title, category, difficulty, summary, payload, validation_status, validated",
        )
        .order("id"),
      admin
        .from("concept_relations")
        .select("from_concept_id, to_concept_id, relation"),
    ]);

    if (conceptsResult.error) {
      console.warn(
        "[Concept Graph] lecture concepts impossible:",
        conceptsResult.error.message,
      );
      return { concepts: [], relations: [], source: "unavailable" };
    }

    if (relationsResult.error) {
      console.warn(
        "[Concept Graph] lecture relations impossible:",
        relationsResult.error.message,
      );
    }

    const rows = (conceptsResult.data ?? []) as TLinguisticConceptRow[];

    if (rows.length === 0) {
      return { concepts: [], relations: [], source: "empty" };
    }

    const concepts = rows.map(mapConceptRowToLinguisticConcept);
    const relations = ((relationsResult.data ?? []) as TConceptRelationRow[])
      .map(mapRelationRowToEdge)
      .filter((edge): edge is TConceptGraphEdge => edge !== null);

    return { concepts, relations, source: "db" };
  } catch (error) {
    console.warn(
      "[Concept Graph] DB inaccessible, repli in-memory:",
      error instanceof Error ? error.message : error,
    );
    return { concepts: [], relations: [], source: "unavailable" };
  }
}
