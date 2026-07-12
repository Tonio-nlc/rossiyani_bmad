# RC-011 — Fiche vocabulaire impossible à ouvrir

> **P0** — Investigation uniquement (aucune correction appliquée)  
> Date : 2026-07-12

## Symptôme

- Sauvegarde depuis l'Explorer : ✅
- Mot visible dans `/vocabulary` : ✅
- Clic sur la carte → `/vocabulary/[lemmaId]` : ❌  
  Message : *« Impossible de charger cette fiche vocabulaire. Veuillez réessayer. »*

---

## Chaîne d'investigation (ordre demandé)

### 1. Lien généré — `VocabularyGrid` / `WordCard`

```16:16:src/components/vocabulary/WordCard.tsx
      href={`/vocabulary/${word.id}${returnQuery}`}
```

`word.id` provient de `getUserVocabulary` :

```58:59:src/lib/vocabulary/get-user-vocabulary.ts
  return {
    id: row.lemma_id,
```

**Verdict : ✅ Conforme** — le lien utilise bien `lemma_id` (UUID du lemme), cohérent avec le segment dynamique `[lemmaId]`.

---

### 2. Paramètre dynamique `[lemmaId]`

```20:21:src/app/(app)/vocabulary/[lemmaId]/page.tsx
  const { lemmaId } = await params;
```

**Verdict : ✅ Conforme** — paramètre correctement extrait et transmis à `getVocabularyEntry(user.id, lemmaId)`.

---

### 3. Route `/vocabulary/[lemmaId]`

```36:58:src/app/(app)/vocabulary/[lemmaId]/page.tsx
  try {
    const entry = await getVocabularyEntry(user.id, lemmaId);
    if (!entry) {
      notFound();
    }
    return <VocabularyEntry ... />;
  } catch {
    return (
      ...
      Impossible de charger cette fiche vocabulaire. Veuillez réessayer.
```

**Verdict : ⚠️ Masque la cause** — tout `throw` (y compris `TypeError` runtime) affiche le même message générique. `notFound()` n'est atteint que si `getVocabularyEntry` retourne `null` sans throw.

---

### 4. `getVocabularyEntry`

Requête principale :

```87:103:src/lib/vocabulary/get-vocabulary-entry.ts
  const { data, error } = await supabase
    .from("user_vocabulary")
    .select(`... lemmas ( form ), explanation_cache ( explanation_fr ), srs_reviews (...)`)
    .eq("user_id", userId)
    .eq("lemma_id", lemmaId)
    .maybeSingle();
```

Puis **uniquement sur la fiche détail** (pas sur la liste) :

```127:130:src/lib/vocabulary/get-vocabulary-entry.ts
  const [translation, examples] = await Promise.all([
    resolveTranslation(supabase, lemmaId, explanationFr),
    collectVocabularyExamples(supabase, lemmaId, lemma.form),
  ]);
```

Et avant cela : `buildKnowledge(lemmaId)` (Knowledge Layer LLM).

**Verdict : ⚠️** — la liste (`getUserVocabulary`) s'arrête avant `collectVocabularyExamples` et `buildKnowledge`. La fiche détail exécute du code supplémentaire susceptible de throw.

---

### 5. Requête Supabase principale

Même shape que la liste (jointures `lemmas`, `explanation_cache`, `srs_reviews`), filtre `.eq("lemma_id", lemmaId)`.

La liste charge avec succès → **la requête principale et les jointures fonctionnent** pour l'utilisateur connecté.

**Verdict : ✅** — pas la cause du symptôme.

---

### 6. RLS

| Table | Politique | Impact fiche détail |
|-------|-----------|---------------------|
| `user_vocabulary` | `auth.uid() = user_id` | ✅ même filtre que liste |
| `lemmas` | `authenticated` SELECT | ✅ |
| `explanation_cache` | `authenticated` SELECT | ✅ |
| `srs_reviews` | via `user_vocabulary` | ✅ |
| `texts` | `authenticated` SELECT | ✅ (utilisé par `collectVocabularyExamples`) |
| `linguistic_knowledge` | `authenticated` SELECT | ✅ lecture ; écriture via service role |

**Verdict : ✅** — RLS non bloquante (liste prouve l'accès).

---

### 7. Jointures `user_vocabulary` / `lemmas` / `explanation_cache`

| Relation | Liste | Détail | Statut |
|----------|-------|--------|--------|
| `lemmas (form)` | ✅ | ✅ | OK |
| `explanation_cache (explanation_fr)` via FK | ✅ | ✅ | OK |
| `srs_reviews (...)` | ✅ | ✅ | OK |

**Verdict : ✅**

---

### 8. Cas `explanation_cache` NULL

`explanation_cache_id` nullable en schéma. Gestion explicite :

```37:48:src/lib/vocabulary/get-vocabulary-entry.ts
function getExplanationFr(cacheRelation) {
  if (!cacheRelation) return undefined;
  ...
}
```

Fallback `resolveTranslation` → requête `explanation_cache` par `lemma_id`.

**Verdict : ✅** — NULL géré ; ne provoque ni `null` retourné ni throw.

---

### 9. Cas `lemma_id` existe mais relations manquantes

- `lemmas` absent → `return null` → `notFound()` (pas le message d'erreur observé).
- `srs_reviews` absent → `review: null` (acceptable).

**Verdict : ✅** — ne correspond pas au symptôme.

---

## Cause racine

**`collectVocabularyExamples` → `mapAnnotatedExamples` appelle `sentence.words.some()` sans vérifier que `words` existe.**

Les textes V1 en base n'ont **pas** de tableau `words` dans `content_annotated` — uniquement `text` + `translationFr` :

```24:36:supabase/migrations/012_library_gold_02_bulochnoy.sql
    "sentences": [
      {"text": "...", "translationFr": "..."},
      ...
    ]
```

Le schéma documente `words[]` comme structure cible (`001_initial_schema.sql` L96–103), mais les migrations gold ne le peuplent pas (confirmé RC-3).

```43:46:src/lib/vocabulary/collect-vocabulary-examples.ts
    for (const sentence of annotated.sentences) {
      const containsLemma = sentence.words.some(
        (word) => word.lemmaId === lemmaId,
      );
```

→ `sentence.words === undefined` → **`TypeError: Cannot read properties of undefined (reading 'some')`**

L'exception remonte jusqu'au `catch` de `page.tsx` → message générique.

**Reproduction logique confirmée :**

```
TypeError: Cannot read properties of undefined (reading 'some')
```

**Pourquoi la liste fonctionne et pas la fiche :**

| Étape | `/vocabulary` (liste) | `/vocabulary/[lemmaId]` (fiche) |
|-------|----------------------|--------------------------------|
| `getUserVocabulary` | ✅ | — |
| `getVocabularyEntry` requête UV | — | ✅ |
| `buildKnowledge` | — | appelé (risque secondaire LLM) |
| `collectVocabularyExamples` | — | ❌ **throw ici** |

---

## Correction proposée

**Fichier :** `src/lib/vocabulary/collect-vocabulary-examples.ts`

```typescript
// mapAnnotatedExamples — garder si words[] présent et peuplé
for (const sentence of annotated.sentences) {
  if (!sentence.words?.length) {
    continue;
  }
  const containsLemma = sentence.words.some(
    (word) => word.lemmaId === lemmaId,
  );
  ...
}
```

`mapContentExamples` (scan `text.content` par forme du lemme) et les exemples `explanation_cache` prennent déjà le relais — ils ne sont jamais atteints aujourd'hui à cause du throw en amont.

**Option complémentaire (hors scope minimal) :** rendre `buildKnowledge` non bloquant sur la fiche (afficher la fiche avec champs linguistiques vides si LLM indisponible) — risque secondaire distinct du bug actuel.

---

## Pourquoi cela ne cassera pas autre chose

- Comportement actuel **déjà cassé** à 100 % sur fiche détail ; la correction réactive le flux prévu.
- `mapContentExamples` existait comme fallback pour les textes sans annotation mot-à-mot — c'est le chemin prévu pour le corpus V1 actuel.
- La liste n'appelle pas cette fonction — inchangée.
- Quand `words[]` sera peuplé (future annotation), le `continue` ne s'appliquera pas et les exemples annotés seront utilisés en priorité.
- Pas de changement RLS, route, ni lien `WordCard`.

---

## Build OK

`npm run build` ✓ (2026-07-12)

---

## Ticket fermé ✅

**Correction appliquée** — `src/lib/vocabulary/collect-vocabulary-examples.ts` : garde `if (!sentence.words?.length) continue` dans `mapAnnotatedExamples`.
