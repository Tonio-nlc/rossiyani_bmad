# Hiérarchie de résolution de concept

> Source code : `src/lib/knowledge/concept-graph/pedagogical-hierarchy.ts`
> Scores bruts : `src/lib/knowledge/concept-graph/match-signals.ts`

## Scores bruts des règles (`matchConceptSignals`)

| Concept | Score | Weight défaut |
|---------|------:|---------------|
| `preposition-government` | 96 | primary |
| `verb-perfective-aspect` | 95 | primary |
| `verb-movement-prefixes` | 92 | primary |
| `verb-present-conjugation` | 90 | primary |
| `reflexive-possessive` | 88 | primary |
| `verbs-of-motion` | 80 | secondary |
| `noun-declension` | 80 | primary |
| `adjective-agreement` | 78 | primary |
| `verb-imperfective-aspect` | 70 | secondary |
| `aspect-pairs` | 65 | secondary |
| `noun-gender` | 55 | secondary |

## Cas fragiles (écart &lt; 10 points)

| Paire | Scores | Δ | Risque |
|-------|--------|--:|--------|
| perfectif vs préfixes de mouvement | 95 / 92 | 3 | **пойдём** → perfectif au lieu de mouvement |
| préfixes vs présent | 92 / 90 | 2 | conflit préfixe + présent |
| présent vs possessif réfléchi | 90 / 88 | 2 | POS différent en pratique |
| mouvement vs déclinaison | 80 / 80 | 0 | POS différent |
| déclinaison vs accord | 80 / 78 | 2 | POS différent |

Le réglage par scores rapprochés est **interdit** comme seul levier : une hiérarchie pédagogique explicite tranche.

## Hiérarchie retenue

Du plus spécifique au plus général :

1. **Régence prépositionnelle** — si détectée (préposition curée + cas)
2. **Famille mouvement** — si `movementType` ou lemme de mouvement (curé / famille)
   - primaire : `verbs-of-motion` (sinon `verb-movement-prefixes`)
   - secondaire : l’autre concept mouvement + **tout aspect** (perfectif, imperfectif, paires)
3. Autres primaires POS (conjugaison, déclinaison, accord…)
4. Aspect — primaire seulement hors verbe de mouvement

Exemple : `пойдём` → lemme `пойти́` (mouvement + perfectif) → concept principal **Verbes de mouvement** ; aspect perfectif en concept lié.
