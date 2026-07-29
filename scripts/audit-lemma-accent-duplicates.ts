/**
 * Audit (lecture seule) des doublons d'accent dans `lemmas`.
 *
 * Usage : npx tsx scripts/audit-lemma-accent-duplicates.ts
 *
 * Distingue deux catégories, à ne JAMAIS traiter de la même façon :
 * - "bare vs accent" : une forme SANS accent et une forme AVEC accent
 *   partagent les mêmes lettres → même mot, doublon réel à fusionner via
 *   scripts/lemma-dedup-plan.ts puis scripts/lemma-dedup-generate-execute-sql.ts.
 * - "paire accentuée ambiguë" : deux formes qui portent CHACUNE un accent, à
 *   des positions différentes, partagent les mêmes lettres une fois l'accent
 *   retiré → peuvent être des mots RÉELLEMENT DISTINCTS (му́ка "tourment" /
 *   мука́ "farine", за́мок "château" / замо́к "serrure") ou une erreur de
 *   curation. NE JAMAIS fusionner automatiquement : vérifier manuellement
 *   dans un dictionnaire russe avant toute action.
 *
 * N'écrit rien en base. Voir docs/knowledge/lemma-canonicalization.md.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import {
  hasStressMark,
  stripStressMark,
} from "../src/lib/vocabulary/canonicalize-lemma-form";

interface LemmaRow {
  id: string;
  form: string;
}

async function main() {
  const { createClient } = await import("@supabase/supabase-js");
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { count } = await sb
    .from("lemmas")
    .select("*", { count: "exact", head: true });
  const { data: lemmas } = await sb.from("lemmas").select("id, form");
  const rows = (lemmas ?? []) as LemmaRow[];

  const nonNfc = rows.filter((r) => r.form !== r.form.normalize("NFC"));

  const byStripped = new Map<string, LemmaRow[]>();
  for (const row of rows) {
    const key = stripStressMark(row.form);
    const list = byStripped.get(key) ?? [];
    list.push(row);
    byStripped.set(key, list);
  }

  const bareVsAccent: { key: string; forms: string[] }[] = [];
  const ambiguousPairs: { key: string; forms: string[] }[] = [];

  for (const [key, group] of byStripped) {
    if (group.length < 2) continue;

    const bare = group.filter((r) => !hasStressMark(r.form));
    const accented = group.filter((r) => hasStressMark(r.form));
    const distinctAccented = new Set(accented.map((r) => r.form));

    if (bare.length > 0 && distinctAccented.size > 0) {
      bareVsAccent.push({ key, forms: group.map((r) => r.form) });
    } else if (distinctAccented.size > 1) {
      ambiguousPairs.push({ key, forms: [...distinctAccented] });
    }
  }

  console.log(`Total lemmes : ${count}`);
  console.log(`Formes non-NFC : ${nonNfc.length}`);
  for (const r of nonNfc) console.log(`  - ${r.id} ${JSON.stringify(r.form)}`);

  console.log(
    `\nDoublons "bare vs accent" (à fusionner via l'outil de dédup) : ${bareVsAccent.length}`,
  );
  for (const g of bareVsAccent) console.log(`  - ${g.forms.join(" / ")}`);

  console.log(
    `\nPaires accentuées ambiguës (vérification manuelle requise, NE PAS fusionner) : ${ambiguousPairs.length}`,
  );
  for (const g of ambiguousPairs) console.log(`  - ${g.forms.join(" / ")}`);

  if (nonNfc.length === 0 && bareVsAccent.length === 0) {
    console.log(
      "\n✓ Aucun doublon accent/non-accent détecté — le garde-fou DB (supabase/seed/lemma_canonicalization_guardrail.sql, étape 2) peut être appliqué sans conflit.",
    );
  } else {
    console.log(
      "\n✗ Doublons résiduels détectés — corriger avant d'appliquer l'étape 2 du garde-fou DB (sinon la contrainte EXCLUDE refusera d'être créée).",
    );
  }
}

void main();
