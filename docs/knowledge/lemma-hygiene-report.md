# Rapport d'hygiène — table `lemmas`

> Mis à jour le 23/07/2026 — voir aussi le plan de remappage
> [`lemma-dedup-remap-report.md`](./lemma-dedup-remap-report.md) (**dry-run, aucune suppression**).

## Doublons ne différant que par l'accent (U+0301)

**3 groupes** détectés (même forme après strip d'accent).

- `вагон` → « ваго́н » / « вагон »
- `человек` → « челове́к » / « человек »
- `читать` → « чита́ть » / « читать »

## Lemmes orthographiquement corrompus / inexistants

- « здора́ваться » → renommer en « здоро́ваться »
- « иди́ти » → fusionner vers « идти́ »

## P2 — vocabulaire utilisateur

Corrigé dans le collecteur bootstrap : la couverture P2 se calcule sur le bucket
`user_vocabulary` **indépendamment** de P0 (plus d'écrasement par la dédup merge).

## найти́ / прочитать

Inclus via `collectReaderEncounterLemmas()` (tous les `lemma_id` de `explanation_cache`,
sans filtre « phrase dans un texte Rossiyani »).
