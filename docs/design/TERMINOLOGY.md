# Terminologie — Rossiyani

> Story 5.6 — Cohérence linguistique  
> **Bêta FR** → **v1 publique EN** (planifié, pas maintenant)

---

## Stratégie

| Phase | Langue UI | Statut |
|-------|-----------|--------|
| **Bêta privée** | Français (avec exceptions documentées) | Actuelle |
| **v1 publique** | Anglais | Planifiée |

Ne pas traduire l'application entière avant la bêta. Corriger uniquement les **incohérences** (mélange FR/EN sur une même surface).

---

## Règles bêta FR

### Navigation — 100 % français

| Route | Label navbar |
|-------|--------------|
| `/` | Accueil |
| `/library` | Bibliothèque |
| `/lessons` | Leçons |
| `/vocabulary` | Vocabulaire |
| `/practice` | Pratique |

### Titres de page — français

| Page | Titre PageHeader |
|------|------------------|
| Vocabulary | **Vocabulaire** |
| Practice | Pratique |
| Lessons | Leçons |
| Review | Révision |
| Library | Bibliothèque |
| Import | Importer un texte |

### Noms produit — conservés en anglais

Termes **fonctionnels** reconnus par l'utilisateur, pas traduits en bêta :

| Terme | Usage |
|-------|-------|
| **Explorer** | Panneau d'explication mot (nom de feature) |
| **Rossiyani** | Marque |

Dans le texte UI français, préférer « l'explorateur » en prose, « Explorer » en label de panneau.

### Exceptions acceptées

- Noms propres : Rossiyani
- Labels techniques onboarding (gelés)
- Auth · Onboarding (exceptions figées Design System)

---

## Corrections 5.6

- [x] `Vocabulary` → `Vocabulaire` (PageHeader)
- [x] Messages d'erreur en français cohérents
- [x] Navigation déjà en français

---

## Migration EN (v1 publique)

À planifier après bêta — pas de story avant RC stable :

1. Inventaire chaînes UI (`grep` + extraction)
2. Fichier i18n ou namespace unique
3. Navbar · PageHeaders · CTAs · erreurs · empty states
4. Conserver noms de features si standard (Explorer optionnel)
