# Audit — vocabulaire de conception interdit

> Généré le 2026-07-25T14:51:17.988Z
> Règle : `SCENARIO_FORBIDDEN_DISPLAY_VOCAB` — docs/knowledge/forbidden-display-vocabulary.md

## Synthèse

| Métrique | Valeur |
|----------|--------|
| Concepts audités | 15 |
| Non conformes | 0 |
| Conformes | 15 |

## Concepts non conformes

_Tous les scénarios seed passent la règle._

## Concepts conformes

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
- `case-accusative` — Accusatif
- `noun-animacy` — Animation (animé / inanimé)
- `case-genitive` — Génitif
- `case-dative` — Datif

## Note (lot purge 2026-07-25)

Lors de l'activation de la règle, les hits suivants ont été corrigés en même temps
que le lot 01 (sinon l'audit les aurait listés ici) :

- `case-accusative` / `noun-animacy` — corail, citation, explication circulaire
- `noun-declension` — « citation » dans le contraste du scénario
- `verb-present-conjugation` — « lemme » dans `visualModel.caption` du registry
- UI `TeachingScenarioView` — « ce lemme » → « ce mot »
