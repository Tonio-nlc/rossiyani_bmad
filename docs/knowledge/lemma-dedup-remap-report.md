# Rapport de remappage — déduplication des lemmes

> Généré le 23/07/2026 18:44:12 — **DRY-RUN** (aucune écriture)

## Règles

1. Forme canonique = forme **avec accent tonique** (NFC), si disponible.
2. Conserver l'entrée qui a une `linguistic_knowledge` v2 ; sinon la forme accentuée.
3. Remapper `user_vocabulary`, `explanation_cache`, `word_forms`, `texts.content_annotated`
   vers le lemme conservé **avant** suppression du doublon.
4. `srs_reviews` référence `user_vocabulary_id` (pas `lemma_id`) : pas de remap direct ;
   la cohérence passe par le remap de `user_vocabulary`.
5. Corrompus : `иди́ти` → `идти́` ; `здора́ваться` → `здоро́ваться`.

## Totaux de remappage prévus

| Table | Lignes / occurrences à remapper ou supprimer |
|-------|-----------------------------------------------|
| user_vocabulary | 0 |
| explanation_cache | 5 |
| word_forms | 0 |
| texts.content_annotated (mots) | 0 |
| linguistic_knowledge (sur doublons drop) | 3 |

**Groupes planifiés : 5**

## Détail par groupe

### `вагон` (accent-duplicate)

- **Conserver** : « ваго́н » (`f23801c0-b4e5-483f-bf8c-6bd7a41e3a6d`) — knowledge v2 : oui
- **Supprimer après remap** : « вагон » (`568bf0a3-08ed-4cd0-a984-829315f05c5a`) — knowledge v2 : oui
- Remaps : uv=0, cache=1, word_forms=0, annotated=0, knowledge_drop=1

### `читать` (accent-duplicate)

- **Conserver** : « чита́ть » (`81772f4b-3be2-4b6e-a809-03ffaaa26f0b`) — knowledge v2 : oui
- **Supprimer après remap** : « читать » (`6b92f2ef-5179-41e9-9cf7-f1e868919c59`) — knowledge v2 : non
- Remaps : uv=0, cache=1, word_forms=0, annotated=0, knowledge_drop=0

### `человек` (accent-duplicate)

- **Conserver** : « челове́к » (`d10ed22b-8562-4cdb-a424-33c94ead2dec`) — knowledge v2 : oui
- **Supprimer après remap** : « человек » (`e1759615-d365-4a26-8d4e-0fb068327e75`) — knowledge v2 : oui
- Remaps : uv=0, cache=2, word_forms=0, annotated=0, knowledge_drop=1

### `идити→идти` (corrupt-spelling)

- **Conserver** : « идти́ » (`2359b010-21b8-4cd4-b60c-0c38d7ba369f`) — knowledge v2 : oui
- **Supprimer après remap** : « иди́ти » (`0a82c80e-1622-48a7-b933-748e73abd509`) — knowledge v2 : oui
- Remaps : uv=0, cache=1, word_forms=0, annotated=0, knowledge_drop=1

### `здораваться→здороваться` (corrupt-spelling)

- **Conserver** : « здоро́ваться » (`15bb79a5-3666-4018-bc30-1b2e4e689c7a`) — knowledge v2 : oui
- **Action** : renommer la forme du lemme conservé → « здоро́ваться » (pas de fusion)
- Remaps : uv=0, cache=0, word_forms=0, annotated=0, knowledge_drop=0

## Plan d'exécution (ticket suivant)

1. Relire ce rapport et valider les totaux.
2. Transaction / script `--execute` :
   - pour chaque drop : UPDATE refs → keep.id (gérer UNIQUE user_id+lemma_id en fusionnant)
   - UPDATE `lemmas.form` du keep vers la forme canonique accentuée si besoin
   - DELETE `linguistic_knowledge` orpheline du drop si keep a déjà v2
   - DELETE lemme drop
3. Relancer `npm run knowledge:bootstrap` et vérifier P0/P2.

## Script

```bash
npx tsx scripts/lemma-dedup-plan.ts          # dry-run (ce rapport)
# npx tsx scripts/lemma-dedup-plan.ts --execute  # interdit tant que non revu
```
