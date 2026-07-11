# Checklist — Publication d'une leçon

Cocher chaque point avant de créer la migration SQL.

---

## Métadonnées

- [ ] `pathSlug` correspond à un parcours existant dans `lesson_paths`
- [ ] `slug` unique dans le parcours (kebab-case)
- [ ] `title` est une **question** (section 1 du pipeline)
- [ ] `order_index` correct (pas de doublon dans le parcours)

---

## Structure pédagogique

- [ ] Section 1 — Question de départ → `title`
- [ ] Section 2 — Intuition → premier `paragraph`
- [ ] Section 3 — Exemple réel → au moins un `example`
- [ ] Section 4 — Explication détaillée → `paragraph` (+ `comparison` / `callout` si utile)
- [ ] Section 5 — Schéma → `schema` seulement si indispensable
- [ ] Section 6 — À retenir → `takeaways` en **dernier bloc**

---

## Contenu

- [ ] **Une seule idée principale** par leçon
- [ ] Le pourquoi précède la règle grammaticale
- [ ] Pas de jargon non expliqué
- [ ] Tutoiement cohérent
- [ ] Phrase(s) russe(s) avec accents toniques NFC
- [ ] `words[].role` corrects et alignés avec le Reader
- [ ] `takeaways.items` : entre 3 et 5 éléments
- [ ] Pas de `callout` utilisé comme synthèse finale

---

## Technique

- [ ] JSON valide (tester avec `jq` ou validateur)
- [ ] Apostrophes SQL doublées (`''`)
- [ ] Migration idempotente (`ON CONFLICT`)
- [ ] Rendu vérifié sur `/lessons/[path]/[lesson]` en local
- [ ] `npm run build` passe

---

## Cohérence Rossiyani

- [ ] Couleurs fonctionnelles = conventions Reader
- [ ] Pas de contradiction avec les leçons existantes du même parcours
- [ ] Exemple tiré du Reader si le phénomène y apparaît (sinon, phrase naturelle documentée)
