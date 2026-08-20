# Rossiyani — État du projet (source de vérité)

> **Miroir du code et de la base**, pas d’un résumé de conversation.  
> Dernière mise à jour : **2026-08-20** (vérifications live le même jour).  
> Règle : chaque affirmation a une preuve (chemin + lignes, ou requête).  
> Toute affirmation non vérifiable ici est marquée **NON VÉRIFIÉE**.

---

## Légende

| Tag | Signification |
|-----|---------------|
| **PROD** | Parcours utilisateur bout-en-bout |
| **WIP** | Fonctionnel avec lacunes documentées |
| **DETTE** | Défaut structurel ouvert |

---

## Baseline chiffrée (2026-08-20)

Requêtes via client service role (`@supabase/supabase-js` + `.env.local`) :

| Table | Count | Preuve |
|-------|------:|--------|
| `lemmas` | **256** | `select count` / `head: true` |
| `linguistic_knowledge` | **67** | idem |
| `linguistic_concepts` | **19** | idem |
| `explanation_cache` | **537** | idem |
| `user_vocabulary` | **16** | idem |
| `word_forms` | **0** | idem |
| `lemmas` avec U+0301 | **179** | filtre `form.normalize('NFD').includes('\u0301')` sur les 256 lignes |

`pg_database_size(current_database())` : **NON VÉRIFIÉE** dans cette session (pas de `DATABASE_URL` locale ; MCP SQL refusé). Taille ~16,45 Mo citée hors session — à confirmer dans le SQL Editor.

Paire volontaire `бо́леть` / `боле́ть` : **2 lignes distinctes** (ids `5a2457c4-…` / `6faef839-…`) — vérifié `select … where form in ('бо́леть','боле́ть')`.

---

## Boucle Lire → Rencontrer → Comprendre

| Étape | Route / surface | Preuve |
|-------|-----------------|--------|
| **Lire** | `/reader/[textId]` — clic mot → `POST /api/word/explain` | `src/lib/orchestrator/index.ts` (`explainWord`) |
| **Rencontrer** | Explorer (prose + rôle) ; sauvegarde → `user_vocabulary` | `ExplorerPanel.tsx` ; `prepare-and-persist-word-scenario.ts` |
| **Comprendre** | Fiche vocabulaire / concept / leçons | `get-vocabulary-entry.ts` ; Concept Graph |

Méthode produit : `docs/METHODE_ROSSIYANI.md` (cadre pédagogique — non re-vérifié ligne à ligne ici).

---

## Modules (parcours principal)

| Module | Statut | Preuve d’existence |
|--------|--------|-------------------|
| Auth | PROD | `src/app/(auth)/` |
| Onboarding | PROD | `src/components/onboarding/OnboardingFlow.tsx` |
| Home | PROD | `src/lib/home/get-home-data.ts` |
| Library | PROD | `src/app/.../library` + seeds gold |
| Reader | PROD / partiel | `src/components/reader/` |
| Lessons | PROD | `src/app/.../lessons` |
| Vocabulary | PROD | `src/lib/vocabulary/` |
| Review (SRS) | PROD / partiel | `src/lib/review/` |
| Practice | PROD / partiel | `src/app/.../practice` |

---

## Orchestrateur Reader — chaîne d’overrides (vérifiée)

Point d’entrée : `explainWord` → `attachConceptResolution` → `applyDeterministicRoleOverride`  
(`src/lib/orchestrator/index.ts` L258–290).

Ordre **déterministe** (avant résolution de concept) :

1. `isCuratedPrepositionSurface` → clear badge (`preposition-government.ts` L110–114)
2. `isCuratedInvariableSurface` → clear badge (`invariable-words.ts`)
3. `isCuratedPronounSurface` → `derivePronounRoleOverride`
4. `deriveGenitiveTriggerRoleOverride` (noms / suite pronom génitif)
5. `deriveInstrumentRoleOverride` (rail instrument / teal)

Verbes : clear rôle via `isDeterministicVerbForRoleClear` dans `attachConceptResolution` (même fichier).

Carte « rencontre » : même ordre dans `get-vocabulary-entry.ts` (`applyDeterministicRoleOverrideToEncounter`, ~L340+).

Architecture détaillée : [`docs/architecture/READER_ORCHESTRATOR.md`](./architecture/READER_ORCHESTRATOR.md).

---

## Rôle par déclencheur (génitif)

Fonction unique : `deriveGenitiveTriggerRoleOverride`  
`src/lib/knowledge/concept-graph/resolve-reader-concept.ts` **L260+** (table documentée L245–258).

| Déclencheur | Rôle / couleur |
|-------------|----------------|
| `у` + pronom curé | `possession` / violet |
| `у` + nom (inanimé / animacy inconnue) | `location` / green |
| `у` + nom animé | `possession` / violet (branche inactive tant qu’animacy inconnue — commentaire L249–251) |
| `после` | `time` / green |
| `из` | `location` / green |
| `без` | clear badge |
| numéral curé | `quantity`, couleur `""` |
| expression figée (`до`+`свидания`, `очень`+`приятно`) | `fixed_expression`, couleur `""` |
| adnominal / sans déclencheur | `null` (LLM pour noms) |

Appliqué aux **pronoms** (`derivePronounRoleOverride` appelle le même rail) **et** aux **noms**.

---

## Rôles sans couleur (`quantity` / `fixed_expression`)

| Constante | Valeur | Preuve |
|-----------|--------|--------|
| `QUANTITY_FUNCTIONAL_ROLE` | `"quantity"` | `resolve-reader-concept.ts` L210 |
| `FIXED_EXPRESSION_FUNCTIONAL_ROLE` | `"fixed_expression"` | L211 |
| Libellés UI | « indique combien » / « se dit tel quel » | `src/lib/utils/russian.ts` L296–297 |
| Pastille | quantity = pastille neutre ; fixed_expression = libellé **sans** pastille | `ExplorerPanel.tsx` L193–199 |
| Absents de `ALLOWED_FUNCTIONAL_ROLES` | Oui — Zod LLM = 7 rôles classiques | `orchestrator/llm.ts` L6–14 |
| Modèle | Même idée que le rail **instrument** (dérivation serveur, pas enum LLM) | `UI_FREEZE.md` (2026-07-31) |

`manner` reste dans `ALLOWED_FUNCTIONAL_ROLES` (L13) — **statut produit non tranché** (voir Dette).

---

## Invariables et prépositions — aucun badge

| Mécanisme | Fichier |
|-----------|---------|
| Liste invariables | `src/lib/knowledge/morphology/curated/invariable-words.ts` |
| Prépositions (table de régence, **pas** de liste dupliquée) | `isCuratedPrepositionSurface` — `preposition-government.ts` L110–114 |
| Application | Orchestrateur L263–270 ; vocab L352–356 |

---

## Gardes à l’insertion (`resolveOrCreateLemma`)

Fichier : `src/lib/orchestrator/cache.ts` L212–220 +  
`src/lib/vocabulary/canonicalize-lemma-form.ts`.

Ordre :

1. `canonicalizeLemmaForm` (NFC + trim)
2. **`assertLemmaFormCharset`** — rejet si hors cyrillique U+0400–U+04FF / `-` / U+0301 (L51–57, commentaire L45–46)
3. **`stripMonosyllableStress`** — une voyelle ⇒ retire U+0301 (L80+)

### Pourquoi le rejet charset

Le LLM produit des **homoglyphes latins** récurrents. Preuve journalisée :

```text
docs/knowledge/cache-prefill-run-log.jsonl
timestamp 2026-08-12T13:57:25.884Z
surface « По́сле »
error : Lemme rejeté : … « по́слe » (e latin)
```

Les 3 lemmes homoglyphes historiques (`садитьcя`, `двa`, `знáть`) ont été corrigés en base (scan 2026-08-20 : **0** forme `lemmas` hors charset).

---

## Précédence d’affichage du lemme

`resolveDisplayLemma` — `src/lib/vocabulary/resolve-display-lemma.ts` L9–26 :

1. `lemmas.form` (hydraté dans la réponse / jointure cache)
2. `lemmaStressed` **seulement** si `lemmas.form` absent

Utilisé par `ExplorerPanel.tsx` L203–207 et la carte vocabulaire (`get-vocabulary-entry.ts` L486).

---

## Contraintes DB (canonicalisation)

Scripts / doc : `supabase/seed/lemma_canonicalization_guardrail.sql`,  
`docs/knowledge/lemma-canonicalization.md`.

| Garde | Effet |
|-------|--------|
| `lemmas.form` UNIQUE + NFC (`lemmas_form_is_nfc` si appliqué) | Une seule ligne par forme exacte |
| `lemmas_no_bare_vs_accented_dup` (EXCLUDE) | Interdit coexistence nue ↔ accentuée **même base** |
| **Ne fusionne pas** deux accents à positions différentes | Protège `бо́леть` / `боле́ть`, `му́ка` / `мука́` |

Statut « contraintes présentes en prod » : scripts collés à la main — présence exacte des noms de contrainte en live : **NON VÉRIFIÉE** (MCP SQL refusé) ; la paire `бо́леть`/`боле́ть` **existe** bien comme 2 lignes.

---

## Quality Gates

Implémentation : `src/lib/knowledge/teaching-engine/scenario-quality-rules.ts`  
(ex. `SCENARIO_FOREIGN_LEMMA_FORM`, `SCENARIO_FORBIDDEN_DISPLAY_VOCAB`, anti-meublage ~L588+).

Vocabulaire d’affichage interdit : `docs/knowledge/forbidden-display-vocabulary.md`.

---

## Dette explicite (section prioritaire)

### 1. LEMMATISATION DÉLÉGUÉE AU LLM — défaut structurel majeur

`resolveOrCreateLemma` reçoit `llmPayload.lemma` / `lemmaStressed` (`orchestrator/index.ts` après `generateWordExplanation`). Aucun analyseur morphologique en prod.

**Lemmes inexistants / fautifs encore en base (2026-08-20)** — `select` par forme exacte :

| Forme en base | Commentaire |
|---------------|-------------|
| `ечьсли` | pour Если |
| `иди́ти`, `и́дти` | pour идти́ (qui existe aussi : `идти́`) |
| `бере́ть` | pour брать (qui existe) |
| `спраши́вать` | faute d’accent / forme |
| `потому́` | pour потом |
| `садить` | pour садиться (qui existe) |
| `булочна́я` | pour бу́лочная |
| `ча́сы` | vs `час` (les deux coexistent) |
| `моло́дой` | vs `молодо́й` (les deux coexistent) |
| `дорога́`, `рано́` | accents / formes à revoir |

**Corrigés à la main (absents de `lemmas` au 2026-08-20)** : `ойти́`, `моло́дый`, `хото́ть`, `свиде́ние` ; homoglyphes `садитьcя`, `двa`, `знáть`.

→ Périmètre exact du chantier morphologie (`docs/architecture/MORPHOLOGY_ENGINE.md`).

### 2. Gloses et prose encore LLM

- `меня́` : translations cache observées `je`, `je / moi`, `je, moi` (select `explanation_cache` ilike `%меня%`, 2026-08-20) — glose « je » seule encore présente.
- Prose « после + génitif » : override rôle = `time` à la lecture ; la prose cache peut encore parler de lieu — **NON VÉRIFIÉE** phrase par phrase aujourd’hui (fait curé injecté dans le prompt : `orchestrator/llm.ts` + hints pronoms ; insuffisant pour garantir la prose).

### 3. Six mots en échec prefill (2026-08-20)

Journal : `docs/knowledge/cache-prefill-run-log.jsonl` (journée `2026-08-20`, 6 erreurs) :

`немно́го`, `хо́чешь?`, `Нет,`, `Вме́сте`, `то́же`, `то́лько`

Erreur observée : `Réponse LLM invalide : le JSON retourné n'a pas pu être analysé` — **pas** un message Zod explicite.  
Hypothèse « Zod exige `functionColor` non vide (`llm.ts` L73) vs prompt invariables sans couleur (L49–50) » : **NON DIAGNOSTIQUÉ**.

### 4. Autres dettes ponctuelles

| Item | État vérifié 2026-08-20 |
|------|-------------------------|
| `гото́вится` sans clear verbe (POS absent) | **NON VÉRIFIÉE** (pas rejoué ici) |
| `Пойдём` → lemme | **RÉSOLU** : cache pointe `пойти́` (`09284ed8-…`) — curated `CURATED_POJTI_PRESENT` |
| 150 lemmes accentués « jamais relus » | Base : **179** formes avec U+0301 — audit Mario **ouvert** |
| `prepare-and-persist-word-scenario.ts` | Existe ; compose/persiste `teaching_scenario` à l’enregistrement — dette de robustesse / morpho **ouverte** (fichier `src/lib/vocabulary/prepare-and-persist-word-scenario.ts`) |
| `manner` en cache | **82** lignes `functional_role='manner'` (pas 83) ; reste dans `ALLOWED_FUNCTIONAL_ROLES` — **non tranché** |

---

## Points d’écriture uniques (lemmes)

Seul chemin d’écriture `lemmas` applicatif documenté : `resolveOrCreateLemma` (`cache.ts`) appelé depuis `explainWord` / morphologie curée.  
Seeds SQL / scripts manuels : hors runtime.

---

## Voir aussi

- [`docs/architecture/READER_ORCHESTRATOR.md`](./architecture/READER_ORCHESTRATOR.md)
- [`docs/architecture/MORPHOLOGY_ENGINE.md`](./architecture/MORPHOLOGY_ENGINE.md)
- [`docs/knowledge/lemma-canonicalization.md`](./knowledge/lemma-canonicalization.md)
- [`docs/architecture.md`](./architecture.md) (vue stack globale — sections historiques peuvent être en retard)
