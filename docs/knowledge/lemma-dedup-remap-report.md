# Rapport de remappage — déduplication des lemmes

> Généré le 28/07/2026 12:29:37 — **DRY-RUN** (aucune écriture)

## Règles

1. Forme canonique = forme **avec accent tonique** (NFC), si disponible.
2. Conserver l'entrée qui a une `linguistic_knowledge` v2 ; sinon la forme accentuée.
3. Remapper `user_vocabulary`, `explanation_cache`, `word_forms`, `lemma_concept_links`,
   `texts.content_annotated` (colonne JSONB, pas une table séparée) vers le lemme
   conservé **avant** suppression du doublon.
4. `srs_reviews` et `review_history` référencent `user_vocabulary_id` (pas `lemma_id`) :
   pas de remap direct sur ces tables ; leur exposition est **indirecte**, via les lignes
   `user_vocabulary` qui référencent un lemme supprimé (comptées ci-dessous quand même,
   car ce sont des données personnelles/historique — vigilance maximale demandée).
5. Corrompus : `иди́ти` → `идти́` ; `здора́ваться` → `здоро́ваться`.

## ⚠️ Vigilance données personnelles

Aucun remap détecté sur `user_vocabulary`, `srs_reviews` ou `review_history`, et aucun conflit d'unicité `user_id`+`lemma_id` sur les groupes analysés. Risque faible pour les données personnelles sur ce dry-run.

## Totaux de remappage prévus

| Table | Lignes / occurrences à remapper ou supprimer |
|-------|-----------------------------------------------|
| **user_vocabulary**  | 0 |
| **srs_reviews** (indirect, via user_vocabulary)  | 0 |
| **review_history** (indirect, via user_vocabulary)  | 0 |
| explanation_cache | 10 |
| word_forms | 0 |
| lemma_concept_links | 7 |
| texts.content_annotated (mots, colonne JSONB) | 0 |
| linguistic_knowledge (sur doublons supprimés) | 5 |
| **Conflits UNIQUE(user_id, lemma_id)**  | 0 |
| **Lignes lemmas supprimées au total** | 6 |

**Groupes planifiés : 7**

## Détail par groupe

### `вагон` (accent-duplicate)

- **Conserver** : « ваго́н » (`f23801c0-b4e5-483f-bf8c-6bd7a41e3a6d`) — knowledge v2 (après migration éventuelle) : oui
- **Action** : FUSION (le lemme conservé porte déjà exactement la forme canonique « ваго́н » — aucun renommage, donc aucun risque de collision UNIQUE(lemmas.form))
- **Supprimer après remap** : « вагон » (`568bf0a3-08ed-4cd0-a984-829315f05c5a`) — knowledge v2 : oui
- Remaps : uv=0, srs_reviews=0, review_history=0, cache=1, word_forms=0, lemma_concept_links=0, annotated=0, knowledge_drop=1
- Conflits UNIQUE(user_id, lemma_id) à fusionner manuellement : 0

### `читать` (accent-duplicate)

- **Conserver** : « чита́ть » (`81772f4b-3be2-4b6e-a809-03ffaaa26f0b`) — knowledge v2 (après migration éventuelle) : oui
- **Action** : FUSION (le lemme conservé porte déjà exactement la forme canonique « чита́ть » — aucun renommage, donc aucun risque de collision UNIQUE(lemmas.form))
- **Supprimer après remap** : « читать » (`6b92f2ef-5179-41e9-9cf7-f1e868919c59`) — knowledge v2 : oui
- Remaps : uv=0, srs_reviews=0, review_history=0, cache=1, word_forms=0, lemma_concept_links=3, annotated=0, knowledge_drop=1
- Conflits UNIQUE(user_id, lemma_id) à fusionner manuellement : 0

### `анна` (accent-duplicate)

- **Conserver** : « А́нна » (`99b45cd6-19ef-4866-8945-9b7461c77323`) — knowledge v2 (après migration éventuelle) : oui
- **Action** : FUSION (le lemme conservé porte déjà exactement la forme canonique « А́нна » — aucun renommage, donc aucun risque de collision UNIQUE(lemmas.form))
- **Supprimer après remap** : « Анна » (`68c2a23e-891b-4c75-b187-f4454e37e733`) — knowledge v2 : oui — ⚠️ savoir **migré** vers le lemme conservé (celui-ci n'en avait pas)
- Remaps : uv=0, srs_reviews=0, review_history=0, cache=2, word_forms=0, lemma_concept_links=4, annotated=0, knowledge_drop=1
- Conflits UNIQUE(user_id, lemma_id) à fusionner manuellement : 0

### `человек` (accent-duplicate)

- **Conserver** : « челове́к » (`d10ed22b-8562-4cdb-a424-33c94ead2dec`) — knowledge v2 (après migration éventuelle) : oui
- **Action** : FUSION (le lemme conservé porte déjà exactement la forme canonique « челове́к » — aucun renommage, donc aucun risque de collision UNIQUE(lemmas.form))
- **Supprimer après remap** : « человек » (`e1759615-d365-4a26-8d4e-0fb068327e75`) — knowledge v2 : oui
- Remaps : uv=0, srs_reviews=0, review_history=0, cache=2, word_forms=0, lemma_concept_links=0, annotated=0, knowledge_drop=1
- Conflits UNIQUE(user_id, lemma_id) à fusionner manuellement : 0

### `дорога` (accent-duplicate)

- **Conserver** : « дорога́ » (`e1221f82-6abc-4968-8c0e-04da3873b066`) — knowledge v2 (après migration éventuelle) : non
- **Action** : FUSION (le lemme conservé porte déjà exactement la forme canonique « дорога́ » — aucun renommage, donc aucun risque de collision UNIQUE(lemmas.form))
- **Supprimer après remap** : « дорога » (`214abe48-e15f-4d41-a8a2-24f9ceaa3427`) — knowledge v2 : non
- Remaps : uv=0, srs_reviews=0, review_history=0, cache=1, word_forms=0, lemma_concept_links=0, annotated=0, knowledge_drop=0
- Conflits UNIQUE(user_id, lemma_id) à fusionner manuellement : 0

### `идити→идти` (corrupt-spelling)

- **Conserver** : « идти́ » (`2359b010-21b8-4cd4-b60c-0c38d7ba369f`) — knowledge v2 (après migration éventuelle) : oui
- **Action** : FUSION (le lemme conservé porte déjà exactement la forme canonique « идти́ » — aucun renommage, donc aucun risque de collision UNIQUE(lemmas.form))
- **Supprimer après remap** : « иди́ти » (`0a82c80e-1622-48a7-b933-748e73abd509`) — knowledge v2 : oui
- Remaps : uv=0, srs_reviews=0, review_history=0, cache=3, word_forms=0, lemma_concept_links=0, annotated=0, knowledge_drop=1
- Conflits UNIQUE(user_id, lemma_id) à fusionner manuellement : 0

### `здораваться→здороваться` (corrupt-spelling)

- **Conserver** : « здоро́ваться » (`15bb79a5-3666-4018-bc30-1b2e4e689c7a`) — knowledge v2 (après migration éventuelle) : oui
- **Action** : renommer la forme du lemme conservé → « здоро́ваться » (pas de fusion : aucune autre ligne n'occupe déjà cette forme)
- Remaps : uv=0, srs_reviews=0, review_history=0, cache=0, word_forms=0, lemma_concept_links=0, annotated=0, knowledge_drop=0
- Conflits UNIQUE(user_id, lemma_id) à fusionner manuellement : 0

## Plan d'exécution

0. **Préalable obligatoire** : exécuter le backup manuel
   (`supabase/seed/lemma_dedup_backup_20260727.sql`) dans le SQL Editor Supabase
   AVANT toute écriture — pas de backup automatique sur le plan gratuit.
1. Relire ce rapport et valider les totaux, en particulier les lignes ⚠️.
2. Relancer ce dry-run juste avant exécution (les données changent chaque jour) :
   si `user_vocabulary`/`srs_reviews`/`review_history` ou les conflits ne sont plus
   à 0, ne pas exécuter.
3. Exécuter `supabase/seed/lemma_dedup_execute_20260727.sql` (transaction
   `BEGIN`/`COMMIT` unique, générée par
   `npx tsx scripts/lemma-dedup-generate-execute-sql.ts` depuis les MÊMES groupes
   que ce rapport) dans le SQL Editor Supabase. Contient ses propres garde-fous
   (abandon si une donnée personnelle ou un savoir serait perdu).
4. Lancer les requêtes de vérification en fin de ce même fichier (comptes,
   doublons restants, lemmes orphelins — tout doit être à 0).
5. Relancer `npm run knowledge:bootstrap` et vérifier P0/P2.

## Script

```bash
npx tsx scripts/lemma-dedup-plan.ts                    # dry-run (ce rapport)
npx tsx scripts/lemma-dedup-generate-execute-sql.ts     # génère le SQL d'exécution
# Exécution réelle : coller supabase/seed/lemma_dedup_execute_20260727.sql
# dans le SQL Editor Supabase (transaction atomique, hors de la portée de ce script).
```
