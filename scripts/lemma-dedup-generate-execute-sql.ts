/**
 * Génère le SQL d'EXÉCUTION RÉELLE de la dédup des lemmes, à partir des groupes
 * calculés en LIVE par la même logique que le dry-run (scripts/lemma-dedup-plan.ts),
 * via le module partagé scripts/lemma-dedup/compute-groups.ts.
 *
 * Ce script n'écrit RIEN en base : il se contente d'émettre un fichier .sql
 * prêt à coller dans le SQL Editor Supabase (BEGIN ... COMMIT, transaction
 * unique, avec garde-fous qui font échouer/annuler toute la transaction si
 * une donnée personnelle (user_vocabulary) ou un savoir (linguistic_knowledge)
 * serait perdu(e) silencieusement.
 *
 * Usage :
 *   npx tsx scripts/lemma-dedup-generate-execute-sql.ts
 *   -> écrit supabase/seed/lemma_dedup_execute_20260727.sql
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "dotenv";

import { computeDedupGroups } from "./lemma-dedup/compute-groups";

config({ path: ".env.local" });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function sqlLit(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

interface GroupsArg {
  keep: { id: string; form: string; hasKnowledgeV2: boolean };
  drop: Array<{
    id: string;
    form: string;
    hasKnowledgeV2: boolean;
    migrateKnowledge?: boolean;
  }>;
  renameKeep: boolean;
  groupKey: string;
  reason: string;
}

async function main() {
  const { createClient } = await import("@supabase/supabase-js");
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const groups = await computeDedupGroups(sb);
  const mergeGroups: GroupsArg[] = groups.filter((g) => g.drop.length > 0);
  const renameOnlyGroups: GroupsArg[] = groups.filter(
    (g) => g.drop.length === 0 && g.renameKeep,
  );

  buildAndWrite(mergeGroups, renameOnlyGroups);
}

function buildAndWrite(mergeGroups: GroupsArg[], renameOnlyGroups: GroupsArg[]) {
  const out: string[] = [];
  const push = (s: string) => out.push(s);

  push("-- ============================================================");
  push("-- EXECUTION -- dedup des lemmes (PROMPT CURSOR 27/07/2026)");
  push("-- Genere automatiquement depuis le dry-run live : NE PAS EDITER A LA MAIN.");
  push("-- Regenerer avec : npx tsx scripts/lemma-dedup-generate-execute-sql.ts");
  push(`-- Genere le ${new Date().toISOString()}`);
  push("--");
  push("-- PREALABLE OBLIGATOIRE : supabase/seed/lemma_dedup_backup_20260727.sql");
  push("-- doit deja avoir ete execute et verifie (comptes backup = comptes live).");
  push("--");
  push("-- Transaction UNIQUE : soit tout reussit, soit tout est annule. Les gardes");
  push("-- ci-dessous (blocs DO) font echouer toute la transaction -- sans rien");
  push("-- supprimer -- si une donnee personnelle ou un savoir serait perdu(e).");
  push("-- Les FK (explanation_cache.lemma_id, user_vocabulary.lemma_id, sans");
  push("-- ON DELETE CASCADE) bloquent aussi nativement le DELETE final si un remap");
  push("-- avait ete oublie : filet de securite supplementaire independant.");
  push("-- ============================================================");
  push("");
  push("begin;");
  push("");
  push("-- ------------------------------------------------------------");
  push("-- 0. GARDE-FOUS -- abandon (rollback) si l'etat live a diverge du dry-run");
  push("--    de reference, plutot que de risquer une perte de donnee.");
  push("-- ------------------------------------------------------------");
  push("");

  for (const group of mergeGroups) {
    const keepId = sqlLit(group.keep.id);

    for (const drop of group.drop) {
      const dropId = sqlLit(drop.id);

      push(
        `-- Garde ${group.groupKey} : "${drop.form}" (${drop.id}) -> "${group.keep.form}" (${group.keep.id})`,
      );
      push("do $$");
      push("begin");
      push("  if exists (");
      push("    select 1 from user_vocabulary a");
      push("    join user_vocabulary b on a.user_id = b.user_id");
      push(`    where a.lemma_id = ${dropId} and b.lemma_id = ${keepId}`);
      push("  ) then");
      push(
        `    raise exception 'ABANDON : conflit UNIQUE(user_id, lemma_id) entre % et % -- fusion manuelle requise avant dedup, aucune donnee personnelle supprimee', ${dropId}, ${keepId};`,
      );
      push("  end if;");
      push("");

      if (!drop.migrateKnowledge) {
        push(`  if exists (select 1 from linguistic_knowledge where lemma_id = ${dropId})`);
        push(`     and not exists (select 1 from linguistic_knowledge where lemma_id = ${keepId}) then`);
        push(
          `    raise exception 'ABANDON : % (supprime) a une linguistic_knowledge mais % (conserve) n''en a pas -- risque de perte de savoir', ${dropId}, ${keepId};`,
        );
        push("  end if;");
        push("");
      } else {
        push(
          `  -- ${dropId} porte la seule linguistic_knowledge du groupe : migree (UPDATE) vers ${keepId} en section 2, pas de garde de perte ici.`,
        );
        push("");
      }
      push("  if exists (");
      push("    select 1 from texts,");
      push("    jsonb_array_elements(coalesce(content_annotated->'sentences', '[]'::jsonb)) as sentence,");
      push("    jsonb_array_elements(coalesce(sentence->'words', '[]'::jsonb)) as word");
      push(`    where word->>'lemmaId' = ${dropId}`);
      push("  ) then");
      push(
        `    raise exception 'ABANDON : texts.content_annotated reference encore % -- remap JSONB manuel requis avant dedup (hors perimetre de ce script)', ${dropId};`,
      );
      push("  end if;");
      push("end $$;");
      push("");
    }
  }

  push("-- ------------------------------------------------------------");
  push("-- 1. REMAP DES REFERENCES -- doublon -> lemme conserve");
  push("--    (dedup-safe : sur les tables avec contrainte UNIQUE incluant");
  push("--    lemma_id, on supprime d'abord le doublon en collision avec une");
  push("--    ligne deja existante cote lemme conserve, pour eviter une erreur");
  push("--    de contrainte -- jamais l'inverse.)");
  push("-- ------------------------------------------------------------");
  push("");

  for (const group of mergeGroups) {
    const keepId = sqlLit(group.keep.id);

    for (const drop of group.drop) {
      const dropId = sqlLit(drop.id);

      push(`-- ${group.groupKey} : "${drop.form}" -> "${group.keep.form}"`);

      push("-- explanation_cache (pas de contrainte unique sur lemma_id seul)");
      push(`update explanation_cache set lemma_id = ${keepId} where lemma_id = ${dropId};`);
      push("");

      push("-- word_forms (UNIQUE(lemma_id, surface, functional_role))");
      push("delete from word_forms d");
      push("using word_forms k");
      push(
        `where d.lemma_id = ${dropId} and k.lemma_id = ${keepId} ` +
          "and k.surface = d.surface and k.functional_role = d.functional_role;",
      );
      push(`update word_forms set lemma_id = ${keepId} where lemma_id = ${dropId};`);
      push("");

      push("-- lemma_concept_links (UNIQUE(lemma_id, concept_id))");
      push("delete from lemma_concept_links d");
      push("using lemma_concept_links k");
      push(
        `where d.lemma_id = ${dropId} and k.lemma_id = ${keepId} and k.concept_id = d.concept_id;`,
      );
      push(`update lemma_concept_links set lemma_id = ${keepId} where lemma_id = ${dropId};`);
      push("");

      push("-- user_vocabulary (UNIQUE(user_id, lemma_id)) -- 0 collision attendue (garde-fou ci-dessus)");
      push("delete from user_vocabulary d");
      push("using user_vocabulary k");
      push(
        `where d.lemma_id = ${dropId} and k.lemma_id = ${keepId} and k.user_id = d.user_id;`,
      );
      push(`update user_vocabulary set lemma_id = ${keepId} where lemma_id = ${dropId};`);
      push("");
    }
  }

  push("-- ------------------------------------------------------------");
  push("-- 2. linguistic_knowledge : MIGRATION (si le conserve n'en a pas) OU SUPPRESSION");
  push("--    des doublons (si le conserve a deja la sienne, jamais de perte de savoir).");
  push("-- ------------------------------------------------------------");
  push("");

  for (const group of mergeGroups) {
    const keepId = sqlLit(group.keep.id);

    for (const drop of group.drop) {
      const dropId = sqlLit(drop.id);

      if (drop.migrateKnowledge) {
        push(
          `update linguistic_knowledge set lemma_id = ${keepId}, updated_at = now() where lemma_id = ${dropId}; -- ${group.groupKey} : migration savoir depuis "${drop.form}" (le conserve n'en avait pas)`,
        );
      } else {
        push(
          `delete from linguistic_knowledge where lemma_id = ${dropId}; -- ${group.groupKey} : "${drop.form}"`,
        );
      }
    }
  }
  push("");

  push("-- ------------------------------------------------------------");
  push("-- 3. SUPPRESSION DES LEMMES DOUBLONS");
  push("--    (fait AVANT le renommage ci-dessous : garantit qu'aucun rename ne peut");
  push("--    entrer en collision avec une ligne sur le point d'etre supprimee.");
  push("--    Si une reference avait ete oubliee plus haut, les FK");
  push("--    explanation_cache.lemma_id / user_vocabulary.lemma_id -- sans");
  push("--    ON DELETE CASCADE -- bloquent ce DELETE et annulent toute la");
  push("--    transaction : aucune suppression partielle possible.)");
  push("-- ------------------------------------------------------------");
  push("");

  const allDropIds = mergeGroups.flatMap((g) => g.drop.map((d) => d.id));

  if (allDropIds.length > 0) {
    push(`delete from lemmas where id in (${allDropIds.map(sqlLit).join(", ")});`);
  }
  push("");

  push("-- ------------------------------------------------------------");
  push("-- 4. RENOMMAGE DE LA FORME CANONIQUE (accent NFC) DU LEMME CONSERVE");
  push("--    Garde generique : n'est genere QUE quand aucune autre ligne du groupe ne");
  push("--    porte deja la forme cible (cf. resolveKeepAndDrop dans compute-groups.ts) ;");
  push("--    le check ci-dessous re-verifie l'etat live juste avant, au cas ou une ligne");
  push("--    hors-groupe occuperait deja cette forme (garde generique demandee).");
  push("-- ------------------------------------------------------------");
  push("");

  const allRenames = [...mergeGroups.filter((g) => g.renameKeep), ...renameOnlyGroups];

  if (allRenames.length === 0) {
    push("-- (aucun renommage necessaire sur ce dry-run)");
  }

  for (const group of allRenames) {
    const keepId = sqlLit(group.keep.id);
    const targetForm = sqlLit(group.keep.form);

    push(`-- ${group.groupKey} : rename vers "${group.keep.form}"`);
    push("do $$");
    push("begin");
    push(`  if exists (select 1 from lemmas where form = ${targetForm} and id <> ${keepId}) then`);
    push(
      `    raise exception 'ABANDON : forme cible % deja portee par une autre ligne -- fusion requise, pas de rename (garde generique)', ${targetForm};`,
    );
    push("  end if;");
    push("");
    push(`  update lemmas set form = ${targetForm}, updated_at = now() where id = ${keepId};`);
    push("end $$;");
    push("");
  }

  push("commit;");
  push("");
  push("-- ============================================================");
  push("-- VERIFICATION POST-EXECUTION -- a lancer juste apres le commit ci-dessus");
  push("-- ============================================================");
  push("");
  push("-- 1. Comptes globaux (comparer aux comptes AVANT, voir rapport dry-run)");
  push("select 'lemmas' as table_name, count(*) from lemmas");
  push("union all select 'explanation_cache', count(*) from explanation_cache");
  push("union all select 'word_forms', count(*) from word_forms");
  push("union all select 'linguistic_knowledge', count(*) from linguistic_knowledge");
  push("union all select 'lemma_concept_links', count(*) from lemma_concept_links");
  push("union all select 'user_vocabulary', count(*) from user_vocabulary");
  push("union all select 'srs_reviews', count(*) from srs_reviews");
  push("union all select 'review_history', count(*) from review_history;");
  push("");
  push("-- 2. Doublons restants (meme forme sans l'accent tonique U+0301) : doit renvoyer 0 ligne");
  push("-- (l'accent cyrillique est une lettre combinante U+0301, sans forme precomposee :");
  push("--  NFC et NFD sont donc identiques ici, il suffit de retirer chr(769) puis lower())");
  push("select lower(replace(form, chr(769), '')) as normalized, count(*), array_agg(form) as forms");
  push("from lemmas");
  push("group by 1");
  push("having count(*) > 1;");
  push("");
  push("-- 3. Lemmes orphelins / references pendantes : doit renvoyer 0 ligne sur les 4 requetes");
  push("select ec.id, ec.lemma_id from explanation_cache ec");
  push("left join lemmas l on l.id = ec.lemma_id where l.id is null;");
  push("");
  push("select uv.id, uv.lemma_id from user_vocabulary uv");
  push("left join lemmas l on l.id = uv.lemma_id where l.id is null;");
  push("");
  push("select wf.id, wf.lemma_id from word_forms wf");
  push("left join lemmas l on l.id = wf.lemma_id where l.id is null;");
  push("");
  push("select lcl.id, lcl.lemma_id from lemma_concept_links lcl");
  push("left join lemmas l on l.id = lcl.lemma_id where l.id is null;");
  push("");

  const outPath = path.join(root, "supabase/seed/lemma_dedup_execute_20260727.sql");
  fs.writeFileSync(outPath, out.join("\n"), "utf8");
  console.log(`Wrote ${outPath}`);
  console.log(`Merge groups: ${mergeGroups.length}`);
  console.log(`Rename-only groups: ${renameOnlyGroups.length}`);
  console.log(
    "Drop lemma ids:",
    mergeGroups.flatMap((g) => g.drop.map((d) => d.id)),
  );
}

void main();
