# Pipeline de création des leçons

> Story 2.1 — Système éditorial Rossiyani  
> Dernière mise à jour : juillet 2026

---

## Principe fondateur

Une leçon Rossiyani **n'est pas un cours de grammaire**. Elle répond à une question que l'utilisateur se pose en lisant du russe réel :

> « Pourquoi cette forme apparaît-elle ici ? »

Chaque leçon part d'un **exemple concret**, explique le **pourquoi**, puis laisse l'utilisateur reprendre sa lecture avec une intuition plus solide.

---

## Modèle pédagogique officiel (6 sections)

Toute leçon suit **obligatoirement** cette structure, dans cet ordre.

| # | Section | Objectif | Bloc(s) |
|---|---------|----------|---------|
| 1 | **Question de départ** | Accrocher une curiosité réelle | Champ `title` de la leçon |
| 2 | **Intuition** | Donner une première explication simple, sans jargon | `paragraph` |
| 3 | **Exemple réel** | Montrer le phénomène dans une phrase authentique | `example` (1 à 3 blocs) |
| 4 | **Explication détaillée** | Expliquer pourquoi cette forme apparaît dans ce contexte | `paragraph` + optionnel `comparison` ou `callout` |
| 5 | **Schéma visuel** | Illustrer une relation difficile à saisir par le texte seul | `schema` *(optionnel)* |
| 6 | **À retenir** | Synthétiser 3 à 5 idées clés | `takeaways` |

### 1. Question de départ

Le **titre de la leçon** est la question. Il apparaît en h1 sur la page leçon.

**Format** : une vraie question, formulée comme l'utilisateur la poserait.

| ✅ Bon | ❌ Mauvais |
|--------|-----------|
| Pourquoi *в школу* mais *в школе* ? | Le prépositionnel |
| Comment reconnaître le genre au premier coup d'œil ? | Le genre des mots russes |

### 2. Intuition

Un ou deux paragraphes courts. Langage simple. Pas de termes grammaticaux non expliqués.

**Test** : un débutant peut-il comprendre l'idée générale sans connaître le jargon ?

### 3. Exemple réel

Au moins **une phrase russe** avec :

- accents toniques (NFC, U+0301) ;
- traduction française ;
- coloration fonctionnelle (`words[].role`) quand pertinent ;
- une `note` qui explique **ce qui se passe dans cette phrase précise**.

**Priorité** : réutiliser une phrase du Reader Rossiyani quand le phénomène y apparaît. Sinon, inventer une phrase représentative du russe courant.

### 4. Explication détaillée

Approfondir l'intuition. Introduire le vocabulaire grammatical **après** le pourquoi, jamais avant.

Outils disponibles :

- `paragraph` — développement narratif ;
- `comparison` — tableaux de formes (nominatif → accusatif, etc.) ;
- `callout` — insight ponctuel en cours de route (astuce, piège fréquent).

Un `callout` **n'est pas** la synthèse finale. Réserver `takeaways` pour la fin.

### 5. Schéma visuel *(optionnel)*

Uniquement si le schéma **ajoute** une compréhension que le texte ne donne pas seul.

Exemples pertinents : relations entre cas, direction vs position, arbre de déclinaison simplifié.

**Ne pas** ajouter un schéma pour « faire joli ».

Format : SVG inline dans `schema.svgContent`, légende dans `schema.caption`.

### 6. À retenir

Bloc `takeaways` final avec **3 à 5 items** :

- phrases courtes et actionnables ;
- pas de jargon non expliqué dans la leçon ;
- une idée par puce.

---

## Règles éditoriales

### Structure

1. **Toujours partir d'un exemple concret** — jamais d'une règle abstraite en ouverture.
2. **Expliquer le pourquoi avant la règle** — l'intuition précède le terme grammatical.
3. **Une idée principale par leçon** — si deux sujets, c'est deux leçons.
4. **Le titre est la question** — pas un nom de chapitre de grammaire.

### Langage

5. **Limiter le jargon** — chaque terme technique est expliqué à sa première occurrence.
6. **Écrire en français** — le russe n'apparaît que dans les blocs `example` et les citations courtes dans les paragraphes.
7. **Tutoiement** — cohérent avec le reste de Rossiyani.

### Exemples russes

8. **Accents toniques obligatoires** — format NFC (`о́`, `а́`, `ы́`). Voir les leçons existantes (migrations 005–007).
9. **Coloration fonctionnelle** — utiliser les rôles Rossiyani (`subject`, `object`, `place`, `possession`, `recipient`) dans `words[].role`. `null` pour les mots sans rôle pédagogique dans cet exemple.
10. **Phrase authentique** — privilégier le Reader ; sinon russe naturel, pas de phrase artificielle de manuel.

### Schémas et tableaux

11. **Les schémas servent à expliquer, pas à décorer** — section 5 optionnelle.
12. **Les tableaux comparent des formes** — pas des listes de vocabulaire.

### Cohérence Rossiyani

13. **Alignement Reader** — les couleurs fonctionnelles des exemples correspondent à celles du Reader.
14. **Pas de contradiction** — une leçon ne doit pas contredire une explication déjà donnée dans un autre parcours.
15. **Lien implicite avec la lecture** — la leçon doit rendre la prochaine session de lecture plus intelligible.

---

## Workflow de production

```
1. Choisir le parcours (path) et le sujet
        ↓
2. Formuler la question de départ (= title)
        ↓
3. Rédiger dans lesson.template.json
        ↓
4. Valider avec CHECKLIST.md
        ↓
5. Transposer en migration SQL (lesson.template.sql)
        ↓
6. Tester localement (npm run db:reset:local ou migration ciblée)
        ↓
7. Vérifier le rendu sur /lessons/[path]/[lesson]
        ↓
8. Commit + db push
```

### Nommage

| Champ | Convention | Exemple |
|-------|------------|---------|
| `slug` | kebab-case, français, descriptif | `pourquoi-les-cas` |
| `title` | Question complète | `Pourquoi le russe a des cas ?` |
| `order_index` | Position dans le parcours (1-based) | `4` |

### Fichiers de livraison

- **Contenu** : `supabase/migrations/NNN_lesson_[parcours]_[slug].sql`
- **Idempotence** : `ON CONFLICT (path_id, slug) DO NOTHING` ou `DO UPDATE` si réécriture intentionnelle

---

## Mapping sections → blocs (résumé)

```
title                          → Question de départ (métadonnée DB)
content_blocks[0]              → paragraph (Intuition)
content_blocks[1..n]           → example (Exemple réel)
content_blocks[...]            → paragraph, comparison, callout (Explication)
content_blocks[...]            → schema (optionnel)
content_blocks[last]           → takeaways (À retenir)
```

Les blocs intermédiaires peuvent alterner `example` et `paragraph` pour approfondir progressivement — la structure rigide est **pédagogique**, pas mécanique. L'ordre des 6 sections doit rester respecté ; leur granularité peut varier.

---

## Leçons existantes vs nouveau modèle

Les 10 leçons actuelles (Fondations + Six cas) ont été rédigées **avant** ce pipeline. Elles ne suivent pas encore toutes la section 6 (`takeaways`) ni le format question-systématique du titre.

**Règle** : toute **nouvelle** leçon suit ce pipeline intégralement. Les leçons existantes peuvent être réécrites lors d'une story contenu dédiée — pas de refactor massif dans cette story.

---

## Références

- Types TypeScript : `src/types/lessons.ts`
- Renderer : `src/components/lessons/LessonBlockRenderer.tsx`
- Référence blocs : [CONTENT_BLOCKS.md](./CONTENT_BLOCKS.md)
- Template : [templates/lesson.template.json](./templates/lesson.template.json)
