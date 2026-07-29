# Rapport dry-run — nettoyage des doublons de lemmes résiduels

> Généré le 28/07/2026 20:26:23 — **DRY-RUN** (aucune écriture)

## ⚠️ Confirmation d'exclusion — бо́леть / боле́ть

- Forme 1 : « бо́леть » → id `5a2457c4-f1ac-4d2b-bbd2-09c4e14f220b`
- Forme 2 : « боле́ть » → id `6faef839-6713-4fbc-9d0c-d1f8c2ed2390`
- **✅ CONFIRMÉ** : les deux formes existent en base comme **deux lignes distinctes**, et **n'apparaissent dans AUCUN groupe de fusion ci-dessous** (vérifié par `assertExclusionIsRespected()` avant tout calcul — le script échoue si l'une des deux apparaît dans la liste curatée).

## Règles appliquées (arbitrage fondateur, russophone)

1. 12 doublons **forme nue / forme accentuée** du même mot → fusion vers la forme accentuée déjà existante.
2. 3 doublons **accent erroné** (mot inexistant) → fusion vers la forme correcte déjà existante (дума́ть→ду́мать, у́рок→уро́к, до́мой→домо́й).
3. **бо́леть / боле́ть exclus** : deux mots distincts (« avoir mal » vs « être malade ») — intacts, aucune fusion.

## ⚠️ Vigilance données personnelles

Aucun remap détecté sur `user_vocabulary`, `srs_reviews` ou `review_history`, et aucun conflit d'unicité `user_id`+`lemma_id` sur les 15 groupes. Risque faible pour les données personnelles sur ce dry-run.

## Totaux de remappage prévus

| Table | Lignes / occurrences à remapper ou supprimer |
|-------|-----------------------------------------------|
| **user_vocabulary**  | 0 |
| **srs_reviews** (indirect, via user_vocabulary)  | 0 |
| **review_history** (indirect, via user_vocabulary)  | 0 |
| explanation_cache | 30 |
| word_forms | 0 |
| lemma_concept_links | 0 |
| texts.content_annotated (mots, colonne JSONB) | 0 |
| **Conflits UNIQUE(user_id, lemma_id)**  | 0 |
| **Lignes lemmas supprimées au total** | 15 |

**Groupes planifiés : 15** (12 nu/accentué + 3 corrections d'accent)

## Détail par groupe

| # | Type | Conserver (keep) | Supprimer (drop) | knowledge keep/drop | uv | srs | review_hist | cache | word_forms | concept_links | annotated | Conflit UNIQUE |
|---|------|-------------------|-------------------|----------------------|----|----|-------------|-------|------------|----------------|-----------|-----------------|
| 1 | nu→accent | « де́нь » (`5612ff4e`) | « день » (`6449090c`) | ✗/✗ | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 |
| 2 | nu→accent | « язы́к » (`1825e807`) | « язык » (`ad714a7b`) | ✗/✗ | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 |
| 3 | nu→accent | « они́ » (`3d85f081`) | « они » (`89041c6d`) | ✗/✗ | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 |
| 4 | nu→accent | « ка́ждый » (`b9a9daf6`) | « каждый » (`9b1b8cbe`) | ✗/✗ | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 |
| 5 | nu→accent | « ко́фе » (`b66a2de0`) | « кофе » (`7817ebbc`) | ✗/✗ | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 |
| 6 | nu→accent | « су́п » (`a948831a`) | « суп » (`4a2ec642`) | ✗/✗ | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 |
| 7 | nu→accent | « Оле́г » (`97403c75`) | « Олег » (`67b2a6ff`) | ✗/✗ | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 |
| 8 | nu→accent | « Луи́ » (`c369ba8d`) | « Луи » (`4e91cf38`) | ✗/✗ | 0 | 0 | 0 | 9 | 0 | 0 | 0 | 0 |
| 9 | nu→accent | « уже́ » (`2b177685`) | « уже » (`8d7c38d5`) | ✗/✗ | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 |
| 10 | nu→accent | « по́сле » (`efd9a35d`) | « после » (`ce542be7`) | ✗/✗ | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 |
| 11 | nu→accent | « я́ » (`61ff3872`) | « я » (`d0258cc0`) | ✗/✗ | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 |
| 12 | nu→accent | « пи́ть » (`d05f363b`) | « пить » (`4c734772`) | ✗/✗ | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 |
| 13 | correction | « ду́мать » (`fa1bac55`) | « дума́ть » (`b769020e`) | ✗/✗ | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 |
| 14 | correction | « уро́к » (`3b050e8b`) | « у́рок » (`4caeb40c`) | ✗/✗ | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 |
| 15 | correction | « домо́й » (`b450a8a5`) | « до́мой » (`c22888aa`) | ✗/✗ | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 |

## Plan d'exécution

0. **Préalable obligatoire** : backup manuel déjà confirmé par le fondateur
   (`scripts/db-backup-manual.sql`).
1. Relire ce rapport, en particulier la confirmation d'exclusion бо́леть/боле́ть
   et les lignes ⚠️.
2. Relancer ce dry-run juste avant exécution (les données changent chaque jour) :
   si l'exclusion n'est plus confirmée, ou si `user_vocabulary`/`srs_reviews`/
   `review_history`/conflits ont changé, ne pas exécuter sans revérifier.
3. Exécuter `supabase/seed/lemma_residual_dedup_execute_20260728.sql`
   (transaction `BEGIN`/`COMMIT` unique, générée par
   `npx tsx scripts/lemma-residual-dedup-generate-execute-sql.ts` depuis les MÊMES
   groupes que ce rapport) dans le SQL Editor Supabase.
4. Lancer le bloc de vérification en fin de ce même fichier SQL (comptes,
   0 doublon nu/accentué, бо́леть ET боле́ть toujours 2 lignes distinctes, 0 orphelin).
5. Relancer `npm run lemma:audit-accents` : doit afficher 0 doublon nu/accentué
   (les 4 paires ambiguës doivent tomber à 1 seule — бо́леть/боле́ть restant).
6. Une fois propre, appliquer le garde-fou DB
   (`supabase/seed/lemma_canonicalization_guardrail.sql`, étape 2).

## Script

```bash
npx tsx scripts/lemma-residual-dedup-plan.ts                    # dry-run (ce rapport)
npx tsx scripts/lemma-residual-dedup-generate-execute-sql.ts     # génère le SQL d'exécution
# Exécution réelle : coller supabase/seed/lemma_residual_dedup_execute_20260728.sql
# dans le SQL Editor Supabase (transaction atomique, hors de la portée de ce script).
```
