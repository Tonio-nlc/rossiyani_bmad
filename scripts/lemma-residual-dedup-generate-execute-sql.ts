/**
 * Génère le SQL d'EXÉCUTION RÉELLE de la fusion des 15 doublons résiduels
 * curatés (PROMPT CURSOR 28/07/2026), à partir des MÊMES groupes que le
 * dry-run (scripts/lemma-residual-dedup-plan.ts), via le module partagé
 * scripts/lemma-residual-dedup/{curated-groups,resolve}.ts.
 *
 * Ce script n'écrit RIEN en base : il émet un fichier .sql prêt à coller
 * dans le SQL Editor Supabase (BEGIN ... COMMIT, transaction unique, avec
 * garde-fous qui annulent toute la transaction si бо́леть/боле́ть ne sont
 * plus 2 lignes distinctes, si une donnée personnelle ou un savoir serait
 * perdu(e) silencieusement).
 *
 * Usage :
 *   npx tsx scripts/lemma-residual-dedup-generate-execute-sql.ts
 *   -> écrit supabase/seed/lemma_residual_dedup_execute_20260728.sql
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "dotenv";

import { EXCLUDED_DISTINCT_PAIR } from "./lemma-residual-dedup/curated-groups";
import { resolveCuratedGroups, type ResolvedGroup } from "./lemma-residual-dedup/resolve";

config({ path: ".env.local" });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function sqlLit(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

async function main() {
  const { createClient } = await import("@supabase/supabase-js");
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { groups, missingForms, excludedPairStatus } = await resolveCuratedGroups(sb);

  if (missingForms.length > 0) {
    console.error("ABANDON : formes attendues introuvables en base :", missingForms);
    process.exit(1);
  }

  if (!excludedPairStatus.bothPresentAsDistinctRows) {
    console.error(
      "ABANDON : бо́леть/боле́ть ne sont plus 2 lignes distinctes — état inattendu, génération refusée.",
    );
    process.exit(1);
  }

  buildAndWrite(groups);
}

function buildAndWrite(groups: ResolvedGroup[]) {
  const out: string[] = [];
  const push = (s: string) => out.push(s);

  const excludedForm1 = sqlLit(EXCLUDED_DISTINCT_PAIR[0]);
  const excludedForm2 = sqlLit(EXCLUDED_DISTINCT_PAIR[1]);

  push("-- ============================================================");
  push("-- EXECUTION -- nettoyage des doublons de lemmes residuels (PROMPT CURSOR 28/07/2026)");
  push("-- Genere automatiquement depuis le dry-run live : NE PAS EDITER A LA MAIN.");
  push("-- Regenerer avec : npx tsx scripts/lemma-residual-dedup-generate-execute-sql.ts");
  push(`-- Genere le ${new Date().toISOString()}`);
  push("--");
  push("-- PREALABLE OBLIGATOIRE : backup manuel deja confirme par le fondateur");
  push("-- (scripts/db-backup-manual.sql).");
  push("--");
  push("-- Transaction UNIQUE : soit tout reussit, soit tout est annule. Les gardes");
  push("-- ci-dessous (blocs DO) font echouer toute la transaction -- sans rien");
  push("-- supprimer -- si une donnee personnelle ou un savoir serait perdu(e), ou si");
  push("-- la paire exclue (boleth vs boleth accentue different) n'est plus 2 lignes");
  push("-- distinctes (voir garde 0 ci-dessous).");
  push("-- Les FK (explanation_cache.lemma_id, user_vocabulary.lemma_id, sans");
  push("-- ON DELETE CASCADE) bloquent aussi nativement le DELETE final si un remap");
  push("-- avait ete oublie : filet de securite supplementaire independant.");
  push("-- ============================================================");
  push("");
  push("begin;");
  push("");
  push("-- ------------------------------------------------------------");
  push("-- 0. GARDE-FOU D'EXCLUSION -- abandon si бо́леть/боле́ть ne sont plus 2 lignes");
  push("--    distinctes (mots reellement differents, jamais fusionnes par ce script).");
  push("--    AUCUNE ligne de ce fichier ne touche a ces deux ids -- ce garde ne fait que");
  push("--    confirmer l'etat attendu avant de continuer.");
  push("-- ------------------------------------------------------------");
  push("");
  push("do $$");
  push("declare");
  push("  v_count integer;");
  push("begin");
  push(`  select count(distinct id) into v_count from lemmas where form in (${excludedForm1}, ${excludedForm2});`);
  push("  if v_count <> 2 then");
  push(
    `    raise exception 'ABANDON : % et % doivent etre 2 lignes distinctes (mots differents) -- etat inattendu (% ligne(s) trouvee(s)), aucune ecriture effectuee', ${excludedForm1}, ${excludedForm2}, v_count;`,
  );
  push("  end if;");
  push("end $$;");
  push("");

  push("-- ------------------------------------------------------------");
  push("-- 1. GARDES PAR GROUPE -- abandon (rollback) si l'etat live a diverge du");
  push("--    dry-run de reference, plutot que de risquer une perte de donnee.");
  push("-- ------------------------------------------------------------");
  push("");

  for (const group of groups) {
    const keepId = sqlLit(group.keep.id);
    const dropId = sqlLit(group.drop.id);

    push(
      `-- ${group.reason} : "${group.drop.form}" (${group.drop.id}) -> "${group.keep.form}" (${group.keep.id})`,
    );
    push("do $$");
    push("begin");
    push("  if exists (");
    push("    select 1 from user_vocabulary a");
    push("    join user_vocabulary b on a.user_id = b.user_id");
    push(`    where a.lemma_id = ${dropId} and b.lemma_id = ${keepId}`);
    push("  ) then");
    push(
      `    raise exception 'ABANDON : conflit UNIQUE(user_id, lemma_id) entre % et % -- fusion manuelle requise, aucune donnee personnelle supprimee', ${dropId}, ${keepId};`,
    );
    push("  end if;");
    push("");

    if (!group.migrateKnowledge) {
      push(`  if exists (select 1 from linguistic_knowledge where lemma_id = ${dropId})`);
      push(`     and not exists (select 1 from linguistic_knowledge where lemma_id = ${keepId}) then`);
      push(
        `    raise exception 'ABANDON : % (supprime) a une linguistic_knowledge mais % (conserve) n''en a pas -- risque de perte de savoir', ${dropId}, ${keepId};`,
      );
      push("  end if;");
      push("");
    } else {
      push(
        `  -- ${dropId} porte la seule linguistic_knowledge du groupe : migree (UPDATE) vers ${keepId} en section 3, pas de garde de perte ici.`,
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
      `    raise exception 'ABANDON : texts.content_annotated reference encore % -- remap JSONB manuel requis avant execution (hors perimetre de ce script)', ${dropId};`,
    );
    push("  end if;");
    push("end $$;");
    push("");
  }

  push("-- ------------------------------------------------------------");
  push("-- 2. REMAP DES REFERENCES -- doublon -> lemme conserve");
  push("--    (delete-then-update sur les tables avec contrainte UNIQUE incluant");
  push("--    lemma_id, pour eviter une erreur de contrainte si l'utilisateur/mot a");
  push("--    deja une ligne cote lemme conserve.)");
  push("-- ------------------------------------------------------------");
  push("");

  for (const group of groups) {
    const keepId = sqlLit(group.keep.id);
    const dropId = sqlLit(group.drop.id);

    push(`-- "${group.drop.form}" -> "${group.keep.form}"`);

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

  push("-- ------------------------------------------------------------");
  push("-- 3. linguistic_knowledge : MIGRATION (si le conserve n'en a pas) OU");
  push("--    SUPPRESSION du doublon (si le conserve a deja la sienne).");
  push("-- ------------------------------------------------------------");
  push("");

  for (const group of groups) {
    const keepId = sqlLit(group.keep.id);
    const dropId = sqlLit(group.drop.id);

    if (group.migrateKnowledge) {
      push(
        `update linguistic_knowledge set lemma_id = ${keepId}, updated_at = now() where lemma_id = ${dropId}; -- migration savoir depuis "${group.drop.form}" (le conserve n'en avait pas)`,
      );
    } else {
      push(`delete from linguistic_knowledge where lemma_id = ${dropId}; -- "${group.drop.form}"`);
    }
  }
  push("");

  push("-- ------------------------------------------------------------");
  push("-- 4. SUPPRESSION DES LEMMES DOUBLONS");
  push("--    Aucun renommage necessaire dans ce lot : chaque lemme conserve porte");
  push("--    deja sa forme finale correcte (accentuee) en base. Si une reference");
  push("--    avait ete oubliee plus haut, les FK explanation_cache.lemma_id /");
  push("--    user_vocabulary.lemma_id -- sans ON DELETE CASCADE -- bloquent ce DELETE");
  push("--    et annulent toute la transaction : aucune suppression partielle possible.");
  push("-- ------------------------------------------------------------");
  push("");

  const allDropIds = groups.map((g) => g.drop.id);
  push(`delete from lemmas where id in (${allDropIds.map(sqlLit).join(", ")});`);
  push("");

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
  push("-- 2. Doublons \"forme nue / forme accentuee\" restants : doit renvoyer 0 ligne.");
  push("--    ⚠️ Contrairement a un simple regroupement par forme desaccentuee (qui");
  push("--    fusionnerait a tort des paires comme бо́леть/боле́ть), cette requete ne");
  push("--    signale QUE les groupes qui melangent une forme SANS accent et une forme");
  push("--    AVEC accent -- deux formes accentuees a des positions differentes ne sont");
  push("--    JAMAIS signalees ici (voir requete 3 pour les distinguer explicitement).");
  push("with base as (");
  push("  select");
  push("    form,");
  push("    replace(form, chr(769), '') as form_unaccented,");
  push("    (strpos(form, chr(769)) > 0) as has_accent");
  push("  from lemmas");
  push(")");
  push("select form_unaccented, array_agg(form order by has_accent, form) as forms");
  push("from base");
  push("group by form_unaccented");
  push("having count(*) filter (where not has_accent) > 0");
  push("   and count(distinct form) filter (where has_accent) > 0;");
  push("");
  push("-- 3. Confirmation explicite : боле́ть et бо́леть doivent TOUJOURS etre 2 lignes");
  push("--    distinctes (mots differents, jamais fusionnes). Doit renvoyer 2 lignes.");
  push(`select id, form from lemmas where form in (${excludedForm1}, ${excludedForm2});`);
  push("");
  push("-- 4. Lemmes orphelins / references pendantes : doit renvoyer 0 ligne sur les 4 requetes");
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

  const outPath = path.join(root, "supabase/seed/lemma_residual_dedup_execute_20260728.sql");
  fs.writeFileSync(outPath, out.join("\n"), "utf8");
  console.log(`Wrote ${outPath}`);
  console.log(`Groupes fusionnes : ${groups.length}`);
  console.log(
    "Drop lemma ids:",
    groups.map((g) => g.drop.id),
  );
}

void main();
