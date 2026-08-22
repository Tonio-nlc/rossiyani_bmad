# Ticket — боле́ть : deux sens, un seul accent

**Statut** : ouvert — ne pas traiter dans M3a.  
**Date** : 2026-08-22.

## Problème

`бо́леть` **n’existe pas** en russe comme infinitif distinct.

Les deux sens pédagogiques Rossiyani :

1. « être malade » — conjugaison type я боле́ю, ты боле́ешь…
2. « avoir mal » (partie du corps) — surtout 3e personne : боли́т / боля́т

…partagent le **même** infinitif **боле́ть**. La distinction se fait à la
**conjugaison / défectivité**, pas à la place de l’accent sur l’infinitif.

OpenRussian et le gold confirment боле́ть. L’accent бо́леть en base / docs
est une **forme fabriquée** (LLM / confusion), présente depuis plusieurs
sessions.

## Hors M3a

Exclu de l’import des 22 conflits d’accent. Ne pas « corriger » en
remplaçant simplement бо́леть → боле́ть sans traiter les deux sens.

## Travail attendu (plus tard)

1. Inventaire : où `бо́леть` apparaît (`public.lemmas`, `morphology_*`,
   docs, `explanation_cache`, curated `CURATED_BOLET_HURT`).
2. Une seule entrée lemme **боле́ть** ; distinguer les sens via
   `morphology_sense_overrides.sense_key` (ex. `boleть.ill` /
   `boleть.hurt`) + `allowed_slots` (présent complet vs sg3/pl3).
3. Purger l’affichage de `бо́леть` (UI, cache, seeds docs).
4. Ne plus jamais utiliser l’accent d’infinitif comme discriminant de sens.

## Références

- `docs/knowledge/accent-conflicts-m3a.md` (exclu болеть)
- `src/lib/knowledge/morphology/curated/present-verbs.ts` (`CURATED_BOLET_HURT`)
