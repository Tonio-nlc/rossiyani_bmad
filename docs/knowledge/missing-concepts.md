# Concepts manquants — feuille de route catalogue

> Généré automatiquement par `npm run concept-graph:generate-seed`.
> Date : 2026-07-24T13:24:12.804Z

Les **11 concepts seed** référencent (via `TEACHING_GRAPH_EDGES` ou `relatedConcepts`)
des concepts qui ne sont **pas encore écrits** dans le registry / la base.
Cette liste guide l’extension du catalogue (objectif 50, puis 200–300).

## Concepts seed présents (11)

- `verb-present-conjugation` — Conjugaison du présent
- `verb-imperfective-aspect` — Aspect imperfectif
- `verb-perfective-aspect` — Aspect perfectif
- `aspect-pairs` — Paires aspectuelles
- `verb-movement-prefixes` — Préfixes des verbes de mouvement
- `verbs-of-motion` — Verbes de mouvement
- `reflexive-possessive` — Possessif réfléchi
- `noun-declension` — Déclinaison
- `noun-gender` — Genre des noms
- `adjective-agreement` — Accord de l'adjectif
- `preposition-government` — Régence des prépositions

## Concepts référencés mais absents

| Concept manquant | Référencé par | Source |
|------------------|---------------|--------|
| `noun-animacy` | `noun-declension` | `noun-animacy --[extends]--> noun-declension`<br>`noun-declension`.relatedConcepts |

## Relations teaching-graph ignorées au seed

Ces arêtes ne sont **pas** insérées en base tant que l’extrémité manquante n’existe pas.

- `noun-animacy --[extends]--> noun-declension`

## Comment étendre

1. Ajouter le concept manquant dans `src/lib/knowledge/concept-graph/registry/seed-concepts.ts`.
2. Relancer `npm run concept-graph:generate-seed`.
3. Coller le nouveau `021_seed_linguistic_concept_graph.sql` dans le SQL Editor.
