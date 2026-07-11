# ContentBlock — Référence technique

> Format JSON stocké dans `lessons.content_blocks` (PostgreSQL `jsonb`).

Type source : `TContentBlock` dans `src/types/lessons.ts`.

---

## Vue d'ensemble

| Type | Rôle pédagogique | Obligatoire |
|------|------------------|-------------|
| `paragraph` | Texte courant (intuition, explication) | Oui (≥1) |
| `example` | Phrase russe annotée | Oui (≥1) |
| `comparison` | Tableau de formes | Non |
| `schema` | Diagramme SVG | Non |
| `callout` | Insight ponctuel (astuce, piège) | Non |
| `takeaways` | Synthèse finale (3–5 points) | Oui (nouvelles leçons) |

---

## `paragraph`

```json
{
  "type": "paragraph",
  "text": "En russe, le rôle d'un mot est souvent porté par sa terminaison, pas par sa position dans la phrase."
}
```

| Champ | Type | Notes |
|-------|------|-------|
| `text` | `string` | Français. Cyrillique inline autorisé pour citer un mot (`« стол »`). |

**Rendu** : paragraphe 15px, cyrillique en Noto Serif si détecté.

---

## `example`

```json
{
  "type": "example",
  "russian": "Ма́ша чита́ет кни́гу.",
  "translation": "Macha lit un livre.",
  "words": [
    { "text": "Ма́ша", "role": "subject" },
    { "text": "чита́ет", "role": null },
    { "text": "кни́гу", "role": "object" }
  ],
  "note": "« кни́га » devient « кни́гу » à l'accusatif : la terminaison indique ce qui est lu."
}
```

| Champ | Type | Notes |
|-------|------|-------|
| `russian` | `string` | Phrase complète avec accents toniques NFC |
| `translation` | `string` | Traduction française naturelle |
| `words` | `TLessonExampleWord[]` | Mots à colorer |
| `note` | `string` | Explication de ce qui se passe **dans cette phrase** |
| `sourceText` | `TLessonExampleSource` *(optionnel)* | Lien vers un texte Reader (`textTitle`, `sentenceIndex`) |

### `sourceText`

```json
{
  "sourceText": {
    "textTitle": "В булочной",
    "sentenceIndex": 3
  }
}
```

Utilisé quand l'exemple est tiré d'un texte gold. Voir [TEXT_LESSON_LINKS.md](./TEXT_LESSON_LINKS.md).

---

## Liens leçon ↔ textes (`lessons.related_texts`)

Champ JSONB au niveau de la leçon (pas dans `content_blocks`) :

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

Type : `TLessonRelatedText` dans `src/types/lessons.ts`. Non affiché en UI en V1 — données pour la méthode et futures fonctionnalités.

### `words[].role`

| Valeur | Couleur Rossiyani | Cas / rôle |
|--------|-------------------|------------|
| `subject` | Bleu | Nominatif (sujet) |
| `object` | Corail | Accusatif (objet direct) |
| `place` | Vert | Lieu, direction |
| `possession` | Violet | Génitif (appartenance) |
| `recipient` | Ambre | Datif (destinataire) |
| `null` | Aucune | Mot sans rôle pédagogique ici |

**Matching** : le token est normalisé (ponctuation retirée) et comparé à `words[].text`.

**Rendu** : carte avec phrase russe colorée, traduction italique, note explicative.

---

## `comparison`

```json
{
  "type": "comparison",
  "title": "Nominatif → Accusatif (féminin en -а)",
  "columns": ["Nominatif", "Accusatif", "Sens"],
  "rows": [
    { "label": "кни́га", "values": ["кни́гу", "livre"] },
    { "label": "рабо́та", "values": ["рабо́ту", "travail"] }
  ]
}
```

| Champ | Type | Notes |
|-------|------|-------|
| `title` | `string` | Titre du tableau (peut être vide `""`) |
| `columns` | `string[]` | En-têtes de colonnes |
| `rows` | `{ label, values }[]` | `label` = 1ère colonne ; `values` = colonnes suivantes |

**Rendu** : tableau responsive avec scroll horizontal sur mobile.

---

## `schema`

```json
{
  "type": "schema",
  "svgContent": "<svg viewBox=\"0 0 400 200\" xmlns=\"http://www.w3.org/2000/svg\">...</svg>",
  "caption": "Direction (accusatif) vs position (prépositionnel)"
}
```

| Champ | Type | Notes |
|-------|------|-------|
| `svgContent` | `string` | SVG inline complet |
| `caption` | `string` | Légende sous le diagramme |

**Contraintes SVG** :

- `viewBox` explicite pour le responsive ;
- pas de scripts ni d'éléments externes ;
- couleurs : préférer les tokens Rossiyani (`#4F46E5`, `#0E0E0E`, `#5A5A5A`, `#E8E4DC`) ;
- texte en français ou russe selon le besoin.

**Rendu** : figure centrée, fond `bg`, bordure `border`.

---

## `callout`

```json
{
  "type": "callout",
  "text": "Pour les mots masculins inanimés, l'accusatif est identique au nominatif."
}
```

| Champ | Type | Notes |
|-------|------|-------|
| `text` | `string` | Insight ponctuel, une idée |

**Usage** : en cours d'explication (section 4), **pas** en synthèse finale.

**Rendu** : encadré accent avec icône ampoule.

---

## `takeaways` *(nouveau — Story 2.1)*

```json
{
  "type": "takeaways",
  "items": [
    "En russe, la terminaison indique le rôle du mot, pas sa position.",
    "L'accusatif marque ce qui reçoit directement l'action.",
    "Pour les féminins en -а, l'accusatif se termine en -у."
  ]
}
```

| Champ | Type | Notes |
|-------|------|-------|
| `items` | `string[]` | **3 à 5** idées clés, phrases courtes |

**Usage** : **dernier bloc** de la leçon (section 6 — À retenir).

**Rendu** : encadré accent avec titre « À retenir » et liste à puces.

---

## Validation du modèle (Story 2.1)

| Besoin pédagogique | Couvert ? |
|--------------------|-----------|
| Question de départ | ✅ `title` (métadonnée) |
| Intuition | ✅ `paragraph` |
| Exemple réel | ✅ `example` |
| Explication détaillée | ✅ `paragraph` + `comparison` + `callout` |
| Schéma visuel | ✅ `schema` |
| À retenir (3–5 points) | ✅ `takeaways` *(ajouté)* |

**Conclusion** : un seul type ajouté (`takeaways`). Les 5 types existants couvrent le reste sans modification.

---

## SQL : échappement des apostrophes

Dans les migrations PostgreSQL, doubler les apostrophes :

```sql
'text': "C''est l''ordre des mots qui compte."
```

## Accents toniques

Utiliser le caractère combinant accent aigu Unicode U+0301 après la voyelle :

- `о́` = `о` + U+0301
- `а́` = `а` + U+0301

Ne pas utiliser de précomposés inconsistants. Voir `006_lesson_six_cas_1.sql` pour des exemples validés.
