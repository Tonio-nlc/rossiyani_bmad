/**
 * Détection des groupes de lemmes en doublon — logique PARTAGÉE entre :
 * - scripts/lemma-dedup-plan.ts (dry-run, rapport markdown)
 * - scripts/lemma-dedup-generate-execute-sql.ts (génère le SQL d'exécution réelle)
 *
 * Toute logique de groupement/priorisation vit ICI et nulle part ailleurs, pour
 * garantir que le SQL exécuté correspond EXACTEMENT au dernier dry-run relu.
 */
import { normalizeRussianWord } from "../../src/lib/vocabulary/normalize-russian-word";
import { toNfc } from "../../src/lib/utils/russian";

export interface LemmaRow {
  id: string;
  form: string;
}

interface KnowledgeRow {
  lemma_id: string;
  profile_version: number | null;
  part_of_speech: string | null;
}

export interface DedupGroup {
  groupKey: string;
  reason: "accent-duplicate" | "corrupt-spelling";
  keep: { id: string; form: string; hasKnowledgeV2: boolean };
  /** Vide seulement pour le cas "renommer en place" (pas de doublon réel à fusionner). */
  drop: Array<{
    id: string;
    form: string;
    hasKnowledgeV2: boolean;
    /**
     * true : la linguistic_knowledge de CE doublon doit être migrée (UPDATE lemma_id)
     * vers `keep` au lieu d'être supprimée, car `keep` n'en a pas et ce doublon en a.
     * Au plus une seule entrée `drop` par groupe peut porter ce flag (contrainte
     * UNIQUE(lemma_id) sur linguistic_knowledge).
     */
    migrateKnowledge?: boolean;
  }>;
  /** true si `keep` doit être renommé (lemmas.form) vers keep.form. */
  renameKeep: boolean;
}

export function hasStress(form: string): boolean {
  return form.normalize("NFD").includes("\u0301");
}

function preferCanonicalForm(forms: string[]): string {
  const stressed = forms.filter(hasStress).map(toNfc);
  if (stressed.length > 0) {
    return stressed.sort((a, b) => b.length - a.length)[0];
  }

  return toNfc(forms[0]);
}

/**
 * Détermine quelle ligne du groupe survit (`keep`) et lesquelles fusionnent (`drop`),
 * en respectant la règle : ne JAMAIS renommer une ligne vers une forme déjà portée par
 * une AUTRE ligne existante (collision garantie sur la contrainte UNIQUE lemmas.form).
 *
 * - Si une ligne du groupe porte déjà `canonicalForm` à l'octet près → c'est elle qui
 *   survit obligatoirement (fusion des autres vers elle, aucun rename).
 * - Sinon → on choisit la meilleure ligne (savoir v2 > accent > ordre alphabétique russe)
 *   et on la renomme vers `canonicalForm` : sûr par construction, aucune autre ligne du
 *   groupe ne porte cette forme (sinon elle aurait été détectée au point précédent).
 */
function resolveKeepAndDrop(
  group: LemmaRow[],
  canonicalForm: string,
  isV2: (id: string) => boolean,
): { keep: LemmaRow; drop: LemmaRow[]; renameKeep: boolean } {
  const exactHolder = group.find((item) => item.form === canonicalForm) ?? null;

  if (exactHolder) {
    return {
      keep: exactHolder,
      drop: group.filter((item) => item.id !== exactHolder.id),
      renameKeep: false,
    };
  }

  const ranked = [...group].sort((left, right) => {
    const leftV2 = isV2(left.id) ? 1 : 0;
    const rightV2 = isV2(right.id) ? 1 : 0;

    if (leftV2 !== rightV2) {
      return rightV2 - leftV2;
    }

    const leftStress = hasStress(left.form) ? 1 : 0;
    const rightStress = hasStress(right.form) ? 1 : 0;

    if (leftStress !== rightStress) {
      return rightStress - leftStress;
    }

    return left.form.localeCompare(right.form, "ru");
  });

  return { keep: ranked[0], drop: ranked.slice(1), renameKeep: true };
}

/** Orthographes corrompues → cible correcte (par forme normalisée). */
export const CORRUPT_FIXES: Array<{ fromNorm: string; toForm: string }> = [
  { fromNorm: "идити", toForm: "идти́" },
  { fromNorm: "здораваться", toForm: "здоро́ваться" },
];

export async function computeDedupGroups(
  // Client admin typé lâche — script one-shot hors du graphe d'app.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sb: any,
): Promise<DedupGroup[]> {
  const { data: lemmas, error } = await sb.from("lemmas").select("id, form");

  if (error) {
    throw error;
  }

  const { data: knowledgeRows } = await sb
    .from("linguistic_knowledge")
    .select("lemma_id, profile_version, part_of_speech");

  const knowledgeByLemma = new Map<string, KnowledgeRow>();

  for (const row of (knowledgeRows ?? []) as KnowledgeRow[]) {
    knowledgeByLemma.set(row.lemma_id, row);
  }

  const isV2 = (lemmaId: string) =>
    (knowledgeByLemma.get(lemmaId)?.profile_version ?? 0) >= 2;

  const byNorm = new Map<string, LemmaRow[]>();

  for (const lemma of (lemmas ?? []) as LemmaRow[]) {
    const key = normalizeRussianWord(lemma.form);

    if (!key) {
      continue;
    }

    const list = byNorm.get(key) ?? [];
    list.push(lemma);
    byNorm.set(key, list);
  }

  /**
   * Résout le savoir à préserver : si `keep` n'a aucune linguistic_knowledge mais
   * qu'un `drop` en a une, elle doit être migrée (UPDATE) plutôt que supprimée.
   * Au plus un seul `drop` peut être marqué (contrainte UNIQUE(lemma_id)).
   */
  function resolveKnowledgeMigration(
    keepId: string,
    dropRows: LemmaRow[],
  ): string | null {
    if (knowledgeByLemma.has(keepId)) {
      return null;
    }

    const withV2 = dropRows.find((item) => isV2(item.id));

    if (withV2) {
      return withV2.id;
    }

    return dropRows.find((item) => knowledgeByLemma.has(item.id))?.id ?? null;
  }

  const groups: DedupGroup[] = [];

  for (const [normalized, group] of byNorm) {
    if (group.length < 2) {
      continue;
    }

    const canonicalForm = preferCanonicalForm(group.map((item) => item.form));
    const { keep, drop, renameKeep } = resolveKeepAndDrop(group, canonicalForm, isV2);
    const migrateSourceId = resolveKnowledgeMigration(keep.id, drop);

    groups.push({
      groupKey: normalized,
      reason: "accent-duplicate",
      keep: {
        id: keep.id,
        form: canonicalForm,
        hasKnowledgeV2: isV2(keep.id) || (migrateSourceId !== null && isV2(migrateSourceId)),
      },
      drop: drop.map((item) => ({
        id: item.id,
        form: item.form,
        hasKnowledgeV2: isV2(item.id),
        migrateKnowledge: item.id === migrateSourceId,
      })),
      renameKeep,
    });
  }

  for (const fix of CORRUPT_FIXES) {
    const corruptGroup = byNorm.get(fix.fromNorm) ?? [];

    if (corruptGroup.length === 0) {
      continue;
    }

    const targetNorm = normalizeRussianWord(fix.toForm);
    const targetGroup = byNorm.get(targetNorm) ?? [];
    const combined = [...corruptGroup, ...targetGroup];
    const canonicalForm = toNfc(fix.toForm);

    const { keep, drop, renameKeep } = resolveKeepAndDrop(combined, canonicalForm, isV2);

    if (drop.length === 0 && !renameKeep) {
      /** Le lemme correct existe déjà et est déjà seul : rien à faire. */
      continue;
    }

    const migrateSourceId = resolveKnowledgeMigration(keep.id, drop);

    groups.push({
      groupKey: `${fix.fromNorm}→${targetNorm}`,
      reason: "corrupt-spelling",
      keep: {
        id: keep.id,
        form: canonicalForm,
        hasKnowledgeV2: isV2(keep.id) || (migrateSourceId !== null && isV2(migrateSourceId)),
      },
      drop: drop.map((item) => ({
        id: item.id,
        form: item.form,
        hasKnowledgeV2: isV2(item.id),
        migrateKnowledge: item.id === migrateSourceId,
      })),
      renameKeep,
    });
  }

  return groups;
}
