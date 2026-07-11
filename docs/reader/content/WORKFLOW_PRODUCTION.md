# Workflow de production — Textes Reader

> Story 3.2+ — Phase production  
> **Fin de la documentation** — ce fichier est le mode opératoire, pas une charte.

---

## Rôles

| Rôle | Qui | Fait quoi |
|------|-----|-----------|
| **Auteur** | Toi | Rédige le russe, les traductions, choisit le phénomène cible |
| **Intégrateur** | Cursor | JSON, migration SQL, accents NFC, checklist, test build |
| **Validateur** | Ensemble | Voix, niveau, rendu Reader |

Cursor **ne rédige pas** le contenu pédagogique. Il intègre ce que tu fournis.

---

## Format de livraison (par texte)

Envoie le contenu dans le chat ou dans un fichier, avec cette structure :

```
# Texte N — [Titre FR]
Titre russe : ...
Collection : ...
Niveau : A1

Phénomène cible : ...
Vocabulaire nouveau : mot1, mot2, ...

---

Phrase 1 russe (avec accents si tu les as)
Traduction FR

Phrase 2 russe
Traduction FR

...
```

Cursor ajoute les accents NFC si absents, génère le JSON et la migration.

---

## Pipeline d'intégration (Cursor)

```
1. Recevoir le contenu auteur (sans modifier le sens)
        ↓
2. Créer docs/reader/content/texts/NN-slug.json
        ↓
3. Vérifier CHECKLIST.md
        ↓
4. Générer supabase/migrations/0NN_library_gold_XX.sql
        ↓
5. db push (ou instruction pour toi)
        ↓
6. Vérifier /reader/[textId] si session disponible
```

---

## Règles d'intégration

- **Ne pas réécrire** le texte russe ni les traductions.
- **Ne pas enrichir** la pédagogie (pas de phrases ajoutées).
- **Relecture humaine** avant envoi — corrections grammaticales (ex. accord sujet-verbe) sont bienvenues ; Cursor intègre la version validée.
- **Un texte = un phénomène principal** — un seul déclic pédagogique par texte (voir plan gold 10).
- **Chaque texte prépare le suivant** — continuité de vie dans le fil Anna & Louis (pas de cliffhanger).
- **Adaptations techniques autorisées** : accents U+0301, apostrophes SQL `''`, `word_count`, `reading_time_minutes`.
- **Un texte = une migration** (ou batch de 2–3 si tu préfères, jamais 10 d'un coup sans validation intermédiaire).

---

## Références

- Plan gold 10 : [BIBLIOTHEQUE_V1_GOLD_10.md](./BIBLIOTHEQUE_V1_GOLD_10.md)
- Charte : [CHARTE_EDITORIALE.md](../CHARTE_EDITORIALE.md)
- Checklist : [CHECKLIST.md](../CHECKLIST.md)
- Template : [templates/text.template.json](../templates/text.template.json)
- Exemple intégré : `supabase/migrations/008_seed_library_texts.sql`
