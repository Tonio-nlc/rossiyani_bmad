# Import — Stories techniques V1

> Découpage BMAD issu de [CONCEPTION_V1.md](./CONCEPTION_V1.md) (Story 4.1)  
> **UX figée** : [UX_V1.md](./UX_V1.md) (Story 4.1.5) — gate obligatoire avant 4.2  
> **Aucune implémentation** dans ce fichier — fiches de travail pour les stories suivantes.

---

## Prérequis

| Story | Gate |
|-------|------|
| **4.1.5** UX maquettes | Checklist §9 de `UX_V1.md` signée |
| **4.2+** | Ne démarre pas sans 4.1.5 validée |

## Story 4.2 — RLS & schéma import ✅

**Objectif** : un texte importé n'est lisible que par son propriétaire ; les textes curated restent publics.

**Livrables** : `supabase/migrations/017_import_schema_security.sql`, `scripts/verify-import-security.mjs`, `docs/import/RLS_VERIFICATION.md`

**Propriétaire** : `texts.imported_by` (pas de colonne `owner` séparée).

### Tâches

- [x] Policy `texts` SELECT : `source = 'curated' OR imported_by = auth.uid()`
- [x] Policy `texts` INSERT : authenticated, `source = 'imported'`, `imported_by = auth.uid()`
- [x] Policy `texts` UPDATE / DELETE : propriétaire uniquement si `imported`
- [x] CHECK : `(source = 'curated' AND imported_by IS NULL) OR (source = 'imported' AND imported_by IS NOT NULL)`
- [x] CHECK collection `imported`, word_count 30–15k, content ≤ 500k chars, titre ≤ 120
- [x] Triggers quota 20 textes / 5 par jour, max 500 phrases, immutabilité `imported_by`
- [x] Index `imported_by`, `source`, Library curated/imported, `lower(title)`
- [x] Index titre : unique curated global, unique `(imported_by, title)` pour imports
- [x] RLS activé sur `texts` ; ancienne policy `authenticated_read_texts` remplacée

### Critère d'acceptation

- Utilisateur A ne voit pas les imports de B → [RLS_VERIFICATION.md](./RLS_VERIFICATION.md)
- Tous voient les textes `curated`
- Migration idempotente, `db push` OK

---

## Story 4.3 — Pipeline d'analyse ✅

**Objectif** : transformer du texte brut en structure importable.

**Livrables** : `src/lib/import/` (moteur pur), `analyze-import.test.ts`, `npm run test:import`

### Tâches

- [x] `analyzeImport`, `buildImportPreview`, `detectRussian`, `cleanImportText`
- [x] `validateRawInput`, `validateImportLimits` (quotas optionnels pour l'API)
- [x] Réutilise `splitIntoSentences`, `toNfc`, `tokenizeSentence`, `normalizeToken`
- [x] Estimation niveau heuristique (sans LLM)
- [x] Warnings non bloquants
- [x] Tests unitaires (vide, FR, RU, long, accents, ponctuation)

### Critère d'acceptation

- Entrée collée → structure JSON preview sans écriture DB
- Limites §5 CONCEPTION respectées
- Appelable depuis API, CLI, tests, batch — aucune dépendance React/HTTP/Supabase

---

## Story 4.4 — API import ✅

**Objectif** : endpoints preview et persist — façade HTTP sans logique métier.

**Livrables** : `POST /api/import/preview`, `POST /api/import`, `api-schemas.ts`, `persist-import.ts`

### Tâches

- [x] `POST /api/import/preview` — `analyzeImport()` → `{ preview }` ou `{ errors }`
- [x] `POST /api/import` — `analyzeImport()` une fois → quotas → insert `texts`
- [x] Auth obligatoire, client Supabase utilisateur (RLS)
- [x] Quotas via `validateImportLimits` + compteurs DB
- [x] Insert : `source=imported`, `collection=imported`, `imported_by`, `content_annotated`
- [x] Logging minimal (start / success / error)

### Critère d'acceptation

- Preview sans side-effect
- Import crée une ligne lisible uniquement par l'auteur (RLS)
- Erreurs 400 avec codes métier existants
- Aucun composant React

---

## Story 4.5 — UI Import ✅

**Objectif** : parcours `/import` + `/import/preview` conforme à `UX_V1.md`.

**Livrables** : `ImportPageView`, `ImportPreviewView`, composants import, `session-storage.ts`

### Tâches

- [x] Page `/import` — onglets coller/.txt, compteurs, limites, CTA
- [x] `POST /api/import/preview` — aucune logique métier client
- [x] Page `/import/preview` — données moteur, titre, niveau, stats, aperçu phrases
- [x] Actions Lire maintenant / Enregistrer → `POST /api/import`
- [x] États : vide, loading, erreurs métier, quota, non-russe, fichier invalide
- [x] Navigation Reader + Library `#mes-imports`
- [x] `max-w-[680px]`, design system existant

### Critère d'acceptation

- Parcours coller → preview → lire ou enregistrer sans quitter Rossiyani
- Aucune nouvelle décision UX

---

## Story 4.6 — Library — Mes imports ✅

**Objectif** : zone bibliothèque privée distincte des collections Rossiyani.

**Livrables** : `LibraryImportsSection`, `ImportTextCard`, `ImportEntryCard`, `PATCH/DELETE /api/import/[id]`

### Tâches

- [x] `GET /api/texts` expose `source`, `createdAt`, `sentenceCount`
- [x] Section « Mes imports » séparée (`#mes-imports`, `border-t pt-11`)
- [x] Collections / Vos textes : curated uniquement (`source !== 'imported'`)
- [x] `ImportTextCard` — badge « Import personnel », phrases, date, progression
- [x] `ImportEntryCard` remplace « Suggérer un texte » dans Mes imports
- [x] Actions : Continuer/Lire, Renommer, Supprimer
- [x] États vide / un / plusieurs imports
- [x] Recherche inclut les imports sans polluer les collections
- [x] Toast « Texte enregistré » après Enregistrer depuis preview
- [x] `COLLECTION_LABELS.imported` → « Mes imports »

### Critère d'acceptation

- Rossiyani officiel vs bibliothèque personnelle clairement distincts
- Compteur « X / 20 » dans Mes imports
- **Épic Import V1 clos**

---

## Story 4.7 — Reader — polish import

**Objectif** : même Reader, attentes calibrées pour textes sans traduction.

### Tâches

- [ ] Badge header « Importé » si `source=imported`
- [ ] Pas de carte Lessons en fin de lecture pour imports (pas de `related_texts`)
- [ ] Option : encart discret première ouverture — « Explore les mots pour comprendre »
- [ ] `DELETE /api/import/[id]` ou gestion depuis Library (optionnel V1)

### Critère d'acceptation

- Reader inchangé fonctionnellement pour Explorer / Vocabulary / progress
- Aucune régression textes curated

---

## Backlog post-V1

| ID | Titre |
|----|-------|
| 4.8 | Traduction phrase par phrase (IA à l'import) |
| 4.9 | Accents toniques automatiques |
| 4.10 | Import PDF |
| 4.11 | Import URL |
| 4.12 | Édition texte importé |
