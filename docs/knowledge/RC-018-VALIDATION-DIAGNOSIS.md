# RC-018 — Diagnostic validation Knowledge Bootstrap

> Généré le 12/07/2026  
> Échantillon diagnostiqué : 6 lemmes en échec (`окно`, `ехать`, `хлеб`, `идти`, `поезд`, `или`)  
> Données brutes : `docs/knowledge/validation-diagnostic.json`  
> Script : `scripts/diagnose-knowledge-validation.ts`

---

## Verdict

**Ce n'est pas un problème de qualité LLM.** Les réponses sont riches, structurées et pédagogiquement pertinentes.

**C'est un décalage systématique entre ce que le LLM produit naturellement et ce que le schéma Zod exige.**

| Couche en cause | Verdict |
|-----------------|---------|
| Prompt | Partiel — le template JSON est ambigu sur plusieurs champs |
| **Schéma Zod** | **Cause majoritaire** — types et enums trop stricts |
| Mapping | Absent — aucune couche de normalisation entre JSON brut et Zod |
| Persistance | Non atteinte — l'upsert n'est jamais appelé si Zod échoue |

Le bootstrap masque la cause réelle : `parseKnowledgeLlmJson()` avale toutes les erreurs Zod et ne renvoie qu'un message générique *« le JSON n'a pas pu être analysé »*.

---

## Résultat bootstrap (P0)

```
45 lemmes candidats
 6 OK   (13 %)
39 validation
 0 timeout
```

Les 6 succès (`медленно`, `громко`, `или`, `сразу`, `немного`, `пешком`) sont des **adverbes / mots grammaticaux simples** avec peu de champs morphologiques imbriqués — le schéma les laisse passer.

Les 39 échecs touchent surtout **noms** et **verbes**, précisément ceux qui activent la richesse du profil v2.

---

## Causes regroupées (par fréquence estimée sur P0)

### Cause A — `morphology.animacy` : enum anglais vs valeurs françaises LLM

**Impact estimé : ~100 % des noms**

| Attendu (Zod) | Reçu (LLM) | Exemples |
|---------------|------------|----------|
| `"animate"` \| `"inanimate"` | `"inanimé"`, `"animé"`, `"inan"` | окно, хлеб, поезд |

```
path: morphology.animacy
code: invalid_value
message: Invalid option: expected one of "animate"|"inanimate"
reçu: "inanimé"
```

**Origine** : le prompt demande du français (`animé/inanimé` dans les instructions) mais le schéma impose des valeurs anglaises.

---

### Cause B — `morphology.plural` : objet attendu, chaîne reçue

**Impact estimé : ~100 % des noms**

| Attendu (Zod) | Reçu (LLM) |
|---------------|------------|
| `{ form, irregular?, notes? }` | `"окна"` ou `"хлебы (rare/poétique)..."` |

```
path: morphology.plural
code: invalid_type
message: Invalid input: expected object, received string
```

**Origine** : le template JSON du prompt montre `"plural": null` sans préciser la structure objet. Le LLM renvoie logiquement la forme du pluriel en texte.

---

### Cause C — `government` / `syntax.government` : chaînes attendues, objets reçus

**Impact estimé : ~100 % des verbes**

| Attendu (Zod) | Reçu (LLM) |
|---------------|------------|
| `string[]` | objets riches `{ governingWord, requiredCase, construction, notes }` |

Exemple `ехать` :

```json
"government": [{
  "governingWord": "ехать",
  "requiredCase": "accusative",
  "construction": "ехать + куда? (accusatif)",
  "notes": "verbe de mouvement avec complément de lieu au cas accusatif"
}]
```

```
path: government.0
code: invalid_type
message: Invalid input: expected string, received object
```

**Origine** : le prompt demande des constructions structurées mais le schéma legacy `government: string[]` n'accepte que des chaînes plates.

---

### Cause D — Verbes : champs morphologiques mal typés

**Impact estimé : ~100 % des verbes**

| Champ | Attendu | Reçu (`ехать`) |
|-------|---------|----------------|
| `morphology.aspectPair` | `{ imperfective, perfective }` | `"поехать"` (string) |
| `morphology.conjugationClass` | `string` | `2` (number) |
| `morphology.specialForms` | `{ label, form }[]` | `string[]` |
| `morphology.governedCases` | `{ grammaticalCase, meaning }[]` | `["accusative"]` (string[]) |
| `semantics.falseFriends` | `{ wrong, correct }[]` | `["идти (aller à pied)"]` (string[]) |

---

### Cause E — `paradigms.cases` : clé `form` vs `forms`

**Impact estimé : noms avec paradigme alternatif** (ex. `хлеб`)

Reçu :

```json
"cases": [
  { "label": "nominatif", "forms": ["хлеб", "хлеба"] }
]
```

Attendu :

```json
{ "label": "...", "form": "..." }
```

```
path: paradigms.cases.0.form
code: invalid_type
message: Invalid input: expected string, received undefined
```

---

### Cause F — `syntax.constructionPatterns` : objets au lieu de chaînes

**Impact** : conjonctions / mots fonctionnels (`или`)

```
path: syntax.constructionPatterns.0
message: Invalid input: expected string, received object
```

---

## Exemple — `окно` (nom typique)

Le payload LLM est **excellent** pédagogiquement. Il échoue sur **2 champs** :

1. `"animacy": "inanimé"` → enum
2. `"plural": "окна"` → type objet

Tout le reste (paradigme 12 cas, pédagogie, erreurs fréquentes) est valide et riche.

**Une correction sur animacy + plural pourrait débloquer la majorité des noms.**

---

## Exemple — `ехать` (verbe critique)

Échecs sur 8 chemins, mais le contenu correspond à RC-016 :

- aspect + paire `поехать` (format incorrect)
- conjugaison présent OK dans `conjugationParadigm`
- verbe de mouvement unidirectionnel OK
- erreurs fréquentes, confusions, conseils OK

**Le LLM fait le travail. Le schéma rejette le format.**

---

## Correction recommandée (sans implémenter ici)

**Une couche de normalisation** entre JSON brut et Zod — pas un changement d'architecture :

1. Préprocesseur pour `animacy`, `plural`, `aspectPair`, `conjugationClass`, `government`, `falseFriends`, `paradigms.cases`
2. Logger les issues Zod dans `parseKnowledgeLlmJson` (diagnostic permanent)
3. Aligner le template JSON du prompt (optionnel si normalisation en place)

**Estimation** : **6/45 → 40–45/45** avec causes A+B (noms) + C+D (verbes).

---

## Prochaine étape suggérée

**RC-019 — Knowledge Schema Normalization**

- Critère de done : ≥ 90 % OK sur P0 après `npm run knowledge:bootstrap -- --only=P0 --force`
