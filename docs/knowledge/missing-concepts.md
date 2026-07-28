# Concepts manquants — feuille de route catalogue

> Généré automatiquement par `npm run concept-graph:generate-seed`.
> Date : 2026-07-28T15:27:04.391Z

Les concepts seed référencent (via `TEACHING_GRAPH_EDGES` ou `relatedConcepts`)
des concepts qui ne sont **pas encore écrits** dans le registry / la base.
Cette liste guide l’extension du catalogue (objectif 50, puis 200–300).

## Concepts seed présents (19)

- `verb-present-conjugation` — Conjugaison du présent
- `verb-past-tense` — Passé
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
- `case-nominative` — Nominatif
- `case-accusative` — Accusatif
- `noun-animacy` — Animation (animé / inanimé)
- `case-genitive` — Génitif
- `case-dative` — Datif
- `case-instrumental` — Instrumental
- `case-prepositional` — Prépositionnel

## Concepts référencés mais absents

_Aucun concept manquant._

## Relations teaching-graph ignorées au seed

Ces arêtes ne sont **pas** insérées en base tant que l’extrémité manquante n’existe pas.

_Aucune relation ignorée._

## Comment étendre

1. Ajouter le concept manquant dans `src/lib/knowledge/concept-graph/registry/seed-concepts.ts`.
2. Relancer `npm run concept-graph:generate-seed`.
3. Coller le nouveau `021_seed_linguistic_concept_graph.sql` dans le SQL Editor.
