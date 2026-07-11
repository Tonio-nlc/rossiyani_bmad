# Liens Textes ↔ Leçons — Parcours « Les six cas »

> Story 3.3 — Référence éditoriale  
> Dernière mise à jour : juillet 2026

Ces liens sont stockés en base dans `lessons.related_texts` (JSONB).  
Les exemples du Reader portent en plus `sourceText` dans les blocs `example` quand la phrase est tirée d'un texte gold.

**Principe méthode** : la leçon vient **après** la lecture — elle explique ce que l'utilisateur a déjà rencontré ([METHODE_ROSSIYANI.md](../METHODE_ROSSIYANI.md) §4.4).

---

## Vue d'ensemble

| Leçon | Slug | Textes liés (gold) |
|-------|------|-------------------|
| Les cas changent le rôle | `les-cas-changent-le-role` | #1, #2, #9 |
| Pourquoi les cas existent ? | `pourquoi-les-cas` | #1, #2, #9 |
| Le nominatif | `nominatif` | #1, #5, #10 |
| L'accusatif | `accusatif` | #2 |
| Le génitif | `genitif` | #8, #10 |
| Le datif | `datif` | #5, #8 |
| L'instrumental | `instrumental` | #2, #10 |
| Le prépositionnel | `prepositionnel` | #1, #9 |

---

## Détail par leçon

### `les-cas-changent-le-role` (ordre 0)

| Texte | Phénomène | Phrases clés |
|-------|-----------|--------------|
| `Первый день в университете` (#1) | в университет / в аудитории | 4, 6, 7 |
| `В булочной` (#2) | terminaisons en contexte | 3, 4 |
| `Как найти дорогу?` (#9) | directions | 4, 5, 6 |

### `pourquoi-les-cas` (ordre 1)

| Texte | Phénomène | Phrases clés |
|-------|-----------|--------------|
| `Первый день в университете` (#1) | mouvement et position | 4, 6, 7 |
| `В булочной` (#2) | objet direct | 3, 4, 5 |
| `Как найти дорогу?` (#9) | directions | 0, 4, 5, 6 |

### `nominatif` (ordre 2)

| Texte | Phénomène | Phrases clés |
|-------|-----------|--------------|
| `Первый день в университете` (#1) | sujets | 6, 8, 9 |
| `Знакомство` (#5) | présentations | 1, 5, 6 |
| `Обычный день студента` (#10) | routine | 0, 2, 4 |

### `accusatif` (ordre 3)

| Texte | Phénomène | Phrases clés |
|-------|-----------|--------------|
| `В булочной` (#2) | купить хлеб, молоко | 3, 4, 5, 7 |

### `genitif` (ordre 4)

| Texte | Phénomène | Phrases clés |
|-------|-----------|--------------|
| `У врача` (#8) | у меня (semis) | 1, 6 |
| `Обычный день студента` (#10) | русского языка | 4, 8 |

### `datif` (ordre 5)

| Texte | Phénomène | Phrases clés |
|-------|-----------|--------------|
| `Знакомство` (#5) | мне | 4 |
| `У врача` (#8) | вам | 9 |

### `instrumental` (ordre 6)

| Texte | Phénomène | Phrases clés |
|-------|-----------|--------------|
| `В булочной` (#2) | платит картой | 8 |
| `Обычный день студента` (#10) | вместе | 4, 5 |

### `prepositionnel` (ordre 7)

| Texte | Phénomène | Phrases clés |
|-------|-----------|--------------|
| `Первый день в университете` (#1) | direction vs position | 4, 6, 7 |
| `Как найти дорогу?` (#9) | внутри, position | 6, 10 |

---

## Format données

### `lessons.related_texts`

```json
[
  {
    "textTitle": "В булочной",
    "goldNumber": 2,
    "phenomenon": "accusatif objet direct",
    "sentenceIndices": [3, 4, 5]
  }
]
```

`textTitle` correspond à `texts.title` en base (clé stable des migrations Reader).

### `example.sourceText` (optionnel)

```json
{
  "type": "example",
  "sourceText": {
    "textTitle": "В булочной",
    "sentenceIndex": 3
  }
}
```

---

## Hors scope Story 3.3

- Affichage UI des liens dans le Reader ou les Lessons
- Résolution `textTitle` → `textId` côté client
- Autres parcours (`fondations-du-russe`, etc.)
