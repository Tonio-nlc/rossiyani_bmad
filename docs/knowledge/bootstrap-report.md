# Knowledge Bootstrap Report

> Généré le 12/07/2026 12:34:00 — RC-019

## Résumé

| Métrique | Valeur |
|----------|--------|
| Lemmes candidats | 45 |
| Générés (v2) | 45 |
| Ignorés (déjà v2) | 0 |
| Dry-run | 0 |
| Erreurs validation | 0 |
| Timeouts | 0 |
| Autres erreurs | 0 |
| Payloads normalisés | ~41 |
| Durée totale | ~17 min (2 passes) |

## Normalisation (RC-019)

Étape `normalizeKnowledgePayload()` insérée entre LLM et Zod. Le schéma reste strict ; seuls les écarts de format sont corrigés de façon déterministe.

| Catégorie | Occurrences (estimé) |
|-----------|----------------------|
| plural | 25 |
| animacy | 18 |
| government | 15 |
| aspectPair | 11 |
| specialForms | 14 |
| paradigms | 6 |
| morphologyScalar | 6 |
| caseParadigm | 6 |
| falseFriends | 6 |
| governedCases | 5 |
| preverbs | 5 |
| confusions | 5 |
| constructionPatterns | 2 |
| gender | 1 |

**Première passe** (45 lemmes) : 29 OK, 16 validation — tous des écarts de format identifiés en RC-018/019.

**Seconde passe** (16 lemmes en échec, normalisation étendue) : 16/16 OK.

**Couverture P0 finale : 45/45 (100 %)**

## Options

- force : true
- dry-run : false
- only : P0
- limit : aucune

## Couverture finale

| Priorité | Total | Enrichis (v2) | Taux |
|----------|-------|---------------|------|
| P0 — textes Rossiyani | 45 | 45 | 100 % |
| P1 — leçons | 0 | 0 | — |
| P2 — vocabulaire utilisateur | 0 | 0 | — |

## Critères RC-019

- [x] `knowledge:bootstrap --only=P0` ≥ 90 % de réussite (atteint **100 %**)
- [x] Schéma Zod inchangé
- [x] Profils conformes au modèle v2
- [x] Aucun changement React / Knowledge Layer consommation
- [x] `npm run build` OK

## Architecture

À 45/45, le socle Knowledge Layer est considéré **terminé**. Prochaine phase : contenu, audit pédagogique, bêta professeurs.
