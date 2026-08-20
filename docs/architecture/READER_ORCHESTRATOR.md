# Reader Orchestrator — architecture réelle

> Miroir du code (2026-08-20). Complète [`../PROJECT_STATE.md`](../PROJECT_STATE.md).  
> Implémentation : `src/lib/orchestrator/`.

---

## Rôle

Répond à : **pourquoi cette forme ici ?**  
Entrée API : `POST /api/word/explain` → `explainWord` (`src/lib/orchestrator/index.ts`).

Sortie : réponse Reader (lemme, glose, prose, rôle/couleur, concept) + écriture éventuelle dans `explanation_cache` / `lemmas`.

---

## Flux (ordre réel)

```
surface + sentence + textId
        ↓
cache HIT ?  → hydrate lemma + attachConceptResolution
        ↓ miss
LLM generateWordExplanation (llm.ts)
        ↓
resolveOrCreateLemma (cache.ts)     ← SEUL écriture lemmas runtime
        ↓
persist explanation_cache
        ↓
attachConceptResolution
  → ensureConceptGraphHydrated
  → getKnowledgeForConceptResolution
  → clear rôle si verbe déterministe
  → applyDeterministicRoleOverride
```

Preuve : `explainWord` / `attachConceptResolution` / `applyDeterministicRoleOverride` dans `index.ts` (L258–290, L302+, L471+).

---

## Chaîne d’overrides déterministes

Fonction : `applyDeterministicRoleOverride` (`index.ts` L258–290).  
**Même logique** côté vocabulaire « rencontre » : `applyDeterministicRoleOverrideToEncounter` dans `get-vocabulary-entry.ts`.

| Rang | Garde | Effet | Source |
|-----:|-------|-------|--------|
| 1 | `isCuratedPrepositionSurface` | clear badge | `preposition-government.ts` L110–114 |
| 2 | `isCuratedInvariableSurface` | clear badge | `invariable-words.ts` |
| 3 | `isCuratedPronounSurface` → `derivePronounRoleOverride` | rôle / couleur | `pronouns.ts` + `resolve-reader-concept.ts` |
| 4 | `deriveGenitiveTriggerRoleOverride` | rôle par déclencheur | `resolve-reader-concept.ts` L260+ |
| 5 | `deriveInstrumentRoleOverride` | `instrument` / teal | `resolve-reader-concept.ts` |

Verbes : `isDeterministicVerbForRoleClear` dans `attachConceptResolution` (avant / autour de l’override) — clear rôle fonctionnel.

Rôles serveur hors enum LLM : `quantity`, `fixed_expression` (absents de `ALLOWED_FUNCTIONAL_ROLES` dans `llm.ts` L6–14) — modèle du rail instrument.

---

## Points d’écriture

| Table | Qui écrit | Fichier |
|-------|-----------|---------|
| `lemmas` | `resolveOrCreateLemma` uniquement (runtime) | `cache.ts` L212+ |
| `explanation_cache` | persist après LLM / curated path | `cache.ts` / `index.ts` |
| `user_vocabulary` + `teaching_scenario` | enregistrement vocabulaire | `prepare-and-persist-word-scenario.ts` |
| `linguistic_knowledge` | Knowledge Builder (autre pipeline) | `generate-knowledge-llm.ts` / builders |

Gardes à l’insertion lemme (après NFC) :

1. `assertLemmaFormCharset` — rejet (homoglyphes latins)
2. `stripMonosyllableStress`

Preuve rejet latin : `docs/knowledge/cache-prefill-run-log.jsonl` (2026-08-12, `по́слe`).

---

## Affichage lemme

`resolveDisplayLemma` (`resolve-display-lemma.ts`) : **`lemmas.form` avant `lemmaStressed`**.

---

## Ce que l’orchestrateur ne fait pas

- Pas d’analyseur morphologique (pymorphy / OpenRussian) en runtime — voir [`MORPHOLOGY_ENGINE.md`](./MORPHOLOGY_ENGINE.md).
- Pas de correction de glose / prose après override de rôle (le fait curé injecté dans le prompt ne garantit pas la prose — dette documentée dans `PROJECT_STATE.md`).
