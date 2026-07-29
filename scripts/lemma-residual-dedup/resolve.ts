/**
 * Résout la liste curatée (curated-groups.ts) contre l'état LIVE de la base :
 * IDs réels, présence de linguistic_knowledge, comptes de remap par table.
 * Partagé entre le dry-run (lemma-residual-dedup-plan.ts) et le générateur
 * de SQL d'exécution (lemma-residual-dedup-generate-execute-sql.ts), pour
 * garantir que le SQL exécuté correspond EXACTEMENT au dernier dry-run relu.
 *
 * Lecture seule : n'écrit rien en base.
 */
import {
  assertExclusionIsRespected,
  CURATED_GROUPS,
  EXCLUDED_DISTINCT_PAIR,
  type CuratedGroup,
} from "./curated-groups";

export interface ResolvedGroup extends CuratedGroup {
  keep: { id: string; form: string; hasKnowledge: boolean };
  drop: { id: string; form: string; hasKnowledge: boolean };
  /** true si `drop` a une linguistic_knowledge mais pas `keep` (migration au lieu de suppression). */
  migrateKnowledge: boolean;
  remaps: {
    user_vocabulary: number;
    srs_reviews: number;
    review_history: number;
    explanation_cache: number;
    word_forms: number;
    lemma_concept_links: number;
    content_annotated_words: number;
  };
  /** Utilisateurs ayant DÉJÀ `keep` ET `drop` dans user_vocabulary (conflit UNIQUE(user_id, lemma_id)). */
  userVocabularyConflicts: number;
}

export interface ResolveResult {
  groups: ResolvedGroup[];
  excludedPairStatus: {
    forms: [string, string];
    bothPresentAsDistinctRows: boolean;
    ids: [string | null, string | null];
  };
  /** Formes de CURATED_GROUPS introuvables en base (devrait être vide). */
  missingForms: string[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function resolveCuratedGroups(sb: any): Promise<ResolveResult> {
  assertExclusionIsRespected();

  const { data: lemmaRows, error } = await sb.from("lemmas").select("id, form");
  if (error) throw error;

  const byForm = new Map<string, { id: string; form: string }>();
  for (const row of (lemmaRows ?? []) as { id: string; form: string }[]) {
    byForm.set(row.form, row);
  }

  const { data: knowledgeRows } = await sb
    .from("linguistic_knowledge")
    .select("lemma_id");
  const lemmaIdsWithKnowledge = new Set(
    ((knowledgeRows ?? []) as { lemma_id: string }[]).map((r) => r.lemma_id),
  );

  const missingForms: string[] = [];
  for (const group of CURATED_GROUPS) {
    if (!byForm.has(group.dropForm)) missingForms.push(group.dropForm);
    if (!byForm.has(group.keepForm)) missingForms.push(group.keepForm);
  }

  const excludedIds: [string | null, string | null] = [
    byForm.get(EXCLUDED_DISTINCT_PAIR[0])?.id ?? null,
    byForm.get(EXCLUDED_DISTINCT_PAIR[1])?.id ?? null,
  ];

  let textsCache: Array<{
    content_annotated?: { sentences?: Array<{ words?: Array<{ lemmaId?: string }> }> } | null;
  }> | null = null;

  async function countAnnotatedWords(lemmaId: string): Promise<number> {
    if (textsCache === null) {
      const { data } = await sb.from("texts").select("id, content_annotated");
      textsCache = data ?? [];
    }

    let count = 0;
    for (const text of textsCache!) {
      const sentences = text.content_annotated?.sentences ?? [];
      for (const sentence of sentences) {
        for (const word of sentence.words ?? []) {
          if (word.lemmaId === lemmaId) count += 1;
        }
      }
    }
    return count;
  }

  const groups: ResolvedGroup[] = [];

  for (const group of CURATED_GROUPS) {
    const keepRow = byForm.get(group.keepForm);
    const dropRow = byForm.get(group.dropForm);

    if (!keepRow || !dropRow) {
      // Rapporté via missingForms ; on n'essaie pas de calculer des remaps
      // pour un groupe incomplet.
      continue;
    }

    const [
      { data: uvDropRows },
      { data: uvKeepRows },
      { count: cacheCount },
      { count: wfCount },
      { count: lclCount },
    ] = await Promise.all([
      sb.from("user_vocabulary").select("id, user_id").eq("lemma_id", dropRow.id),
      sb.from("user_vocabulary").select("user_id").eq("lemma_id", keepRow.id),
      sb
        .from("explanation_cache")
        .select("*", { count: "exact", head: true })
        .eq("lemma_id", dropRow.id),
      sb
        .from("word_forms")
        .select("*", { count: "exact", head: true })
        .eq("lemma_id", dropRow.id),
      sb
        .from("lemma_concept_links")
        .select("*", { count: "exact", head: true })
        .eq("lemma_id", dropRow.id),
    ]);

    const uvDropIds = ((uvDropRows ?? []) as Array<{ id: string; user_id: string }>).map(
      (r) => r.id,
    );
    const dropUserIds = new Set(
      ((uvDropRows ?? []) as Array<{ user_id: string }>).map((r) => r.user_id),
    );
    const keepUserIds = new Set(
      ((uvKeepRows ?? []) as Array<{ user_id: string }>).map((r) => r.user_id),
    );

    let userVocabularyConflicts = 0;
    for (const userId of dropUserIds) {
      if (keepUserIds.has(userId)) userVocabularyConflicts += 1;
    }

    let srsCount = 0;
    let reviewHistoryCount = 0;
    if (uvDropIds.length > 0) {
      const [{ count: srs }, { count: rh }] = await Promise.all([
        sb
          .from("srs_reviews")
          .select("*", { count: "exact", head: true })
          .in("user_vocabulary_id", uvDropIds),
        sb
          .from("review_history")
          .select("*", { count: "exact", head: true })
          .in("user_vocabulary_id", uvDropIds),
      ]);
      srsCount = srs ?? 0;
      reviewHistoryCount = rh ?? 0;
    }

    const annotated = await countAnnotatedWords(dropRow.id);

    const keepHasKnowledge = lemmaIdsWithKnowledge.has(keepRow.id);
    const dropHasKnowledge = lemmaIdsWithKnowledge.has(dropRow.id);

    groups.push({
      ...group,
      keep: { id: keepRow.id, form: keepRow.form, hasKnowledge: keepHasKnowledge },
      drop: { id: dropRow.id, form: dropRow.form, hasKnowledge: dropHasKnowledge },
      migrateKnowledge: !keepHasKnowledge && dropHasKnowledge,
      remaps: {
        user_vocabulary: uvDropIds.length,
        srs_reviews: srsCount,
        review_history: reviewHistoryCount,
        explanation_cache: cacheCount ?? 0,
        word_forms: wfCount ?? 0,
        lemma_concept_links: lclCount ?? 0,
        content_annotated_words: annotated,
      },
      userVocabularyConflicts,
    });
  }

  return {
    groups,
    excludedPairStatus: {
      forms: EXCLUDED_DISTINCT_PAIR,
      bothPresentAsDistinctRows: Boolean(excludedIds[0] && excludedIds[1] && excludedIds[0] !== excludedIds[1]),
      ids: excludedIds,
    },
    missingForms,
  };
}
