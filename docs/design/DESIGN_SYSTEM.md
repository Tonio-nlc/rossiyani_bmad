# Rossiyani — Design System

> **Source de vérité unique** — Story 5.2 (Standardisation)  
> Objectif : une palette, une famille de composants, une grille de largeur.

Hors scope de ce document : repositionnement, redesign, branding (logo/favicon), responsive.

---

## Méthode Freeze

Chaque chantier est **gelé** une fois terminé. On n'y revient plus, sauf bug critique ou retour bêta.

| Freeze | Statut |
|--------|--------|
| Architecture | ✅ |
| Database | ✅ |
| Lessons | ✅ |
| Reader Loop | ✅ |
| Import V1 | ✅ |
| **Design System tokens (5.2)** | ✅ |
| **Layouts & headers (5.3)** | ✅ |
| Branding (5.4) | À venir |
| → **Design Freeze** | Après 5.4–5.5 |

---

## 1. Tokens couleur

### Palette Rossiyani (unique)

Définie dans `tailwind.config.ts` et `src/app/globals.css`.

| Token | Valeur | Usage |
|-------|--------|-------|
| `ink` | `#0E0E0E` | Texte principal |
| `ink-2` | `#5A5A5A` | Texte secondaire |
| `ink-3` | `#A8A8A8` | Méta, labels, placeholders |
| `bg` | `#F8F6F2` | Fond page |
| `surface` | `#FFFFFF` | Cartes, panels, headers |
| `border` | `#E8E4DC` | Bordures, séparateurs |
| `accent` | `#4F46E5` | CTA primaire, liens actifs |
| `accent-deep` | `#3730A3` | Hover CTA |
| `accent-light` | `#EEF0FF` | Fond icône, surbrillance |
| `accent-border` | `#C7D2FE` | Hover bordure carte |
| `green` | `#10B981` | Succès, « Sauvegardé », rating Easy |
| `amber` | `#F59E0B` | Rating Hard, alertes douces |
| `destructive` | `#DC2626` | Erreurs, rating Again (shadcn) |

### Rôles grammaticaux (Reader / Onboarding)

Couleurs pédagogiques — `role.*` dans Tailwind, source `src/lib/utils/russian.ts` :

| Rôle | Token | Hex |
|------|-------|-----|
| Sujet | `role-subject` | `#3B82F6` |
| Objet | `role-object` | `#EF7C5A` |
| Lieu/temps | `role-location` | `#22C55E` |
| Possession | `role-possession` | `#A78BFA` |
| Destinataire | `role-recipient` | `#F59E0B` |

### Interdit

- ❌ `brand-*` (supprimé)
- ❌ Hex inline dans les composants UI (`#4F46E5`, `#E8E4DC`, etc.)
- ❌ Couleurs Tailwind parasites (`red-600`, `emerald-600`, `orange-500`…) hors tokens ci-dessus
- ❌ `style={{ color: … }}` sauf couleurs dynamiques (rôles grammaticaux, collections)

### shadcn / `primary` / `muted`

Alignés sur Rossiyani dans `globals.css` (`--primary` = accent).  
Pour l'UI produit, préférer **`accent`**, **`ink`**, **`border`** — pas `primary`/`muted` sauf composants shadcn génériques.

---

## 2. Grille de largeur

Constantes : `src/lib/design/layout.ts`

| Classe Tailwind | px | Usage |
|-----------------|-----|-------|
| `max-w-reading` | 680 | Reader, Import, **détail leçon** |
| `max-w-content` | 900 | Vocabulary, Review, Practice, parcours leçons |
| `max-w-dashboard` | 1080 | Home, Library, liste leçons, `PageHeader` |

**Règle** : pas de largeurs intermédiaires (`max-w-3xl`, `max-w-[34rem]`, etc.) sur les pages produit.

Exceptions tolérées (hors grille page) : modales auth (`400px`), onboarding step (`560px`), panel Explorer (`320px`).

Exceptions tolérées (hors grille page) : modales auth (`400px`), onboarding step (`560px`), panel Explorer (`320px`).

---

## 3. Layouts & rythme vertical (Story 5.3)

Constantes : `src/lib/design/rhythm.ts`

### Structure page standard

```text
Navbar
↓
[ContextBar]     ← optionnel (retour reader, fil d'Ariane)
↓
PageHeader       ← eyebrow · titre DM Serif · sous-titre
↓ 48px (pt-12)
PageBody
  Section 1
  ↓ 64px (mt-16)
  Section 2
  ...
```

### Composants layout

| Composant | Fichier | Rôle |
|-----------|---------|------|
| `PageHeader` | `ui/PageHeader.tsx` | En-tête de page (eyebrow, titre, sous-titre, badge, leading) |
| `PageBody` | `ui/PageBody.tsx` | Corps (`pt-12`, largeur, padding horizontal) |
| `PageSection` | `ui/PageSection.tsx` | Section avec `mt-16` entre blocs |
| `ContextBar` | `ui/ContextBar.tsx` | Barre contextuelle au-dessus du header |
| `SectionHeader` | `ui/SectionHeader.tsx` | Titre de section + sous-titre + trailing |

### Espacements officiels

| Token | Valeur | Usage |
|-------|--------|-------|
| `PAGE_BODY_TOP_CLASS` | `pt-12` (48px) | Sous PageHeader |
| `PAGE_SECTION_GAP_CLASS` | `mt-16` (64px) | Entre sections |
| `SECTION_CONTENT_GAP_CLASS` | `mt-6` (24px) | Sous SectionHeader → contenu |

### Grilles sections

| Classe | Colonnes |
|--------|----------|
| `CARD_GRID_3COL_CLASS` | 1 → 2 → 3 (sm/lg) |
| `CARD_GRID_2COL_CLASS` | 1 → 2 (md) |

### Cartes — dimensions uniformes

Toutes les cartes (`CARD_BASE_CLASS`) : `min-h-56`, `p-[22px]`, `rounded-[14px]`, hover bordure + ombre identiques. CTA aligné en bas via `mt-auto`.

### Pages avec PageHeader

| Page | Largeur |
|------|---------|
| Bibliothèque, Leçons (liste) | `dashboard` |
| Vocabulary, Review, Practice, Parcours | `content` |
| Import, Import preview | `reading` |

### Exceptions documentées

| Zone | Raison |
|------|--------|
| **Home** | Hero marketing à la place de PageHeader |
| **Reader** | Layout lecture plein écran, pas de PageHeader |
| **ExplorerPanel** | Panel fixe / bottom sheet hors flux |
| **Auth** (`/login`, `/register`) | Centrage vertical, pas de navbar app |
| **Onboarding** | Parcours guidé plein écran, navbar masquée |
| **Détail leçon** | Article `max-w-reading` avec rythme éditorial propre |
| **Encart « En cours »** | Carte accentée Library/Home — composant promotionnel |

---

## 4. Composants canoniques

### CTA

| Type | Implémentation |
|------|----------------|
| Primaire | `Button` variant `rossiyani` (défaut) ou `BTN_PRIMARY_CLASS` |
| Secondaire | `BTN_SECONDARY_CLASS` |
| Lien carte | `CTA_LINK_CLASS` |

Fichier : `src/lib/design/classes.ts`

### Filtres / onglets

**`PillGroup`** (`src/components/ui/pill.tsx`) — seule implémentation.

Remplace : `FilterPills` (wrapper), `VocabularyFilterPills`, `ImportSourceTabs`.

### Badge

| Variant | Classe |
|---------|--------|
| Niveau A1–C2 | `BADGE_LEVEL_CLASS` |
| Méta bordure | `BADGE_MUTED_CLASS` |
| Méta fond | `BADGE_META_CLASS` / `BADGE_SOFT_CLASS` |
| shadcn | `Badge` variants `accent`, `muted` |

### Carte

| Type | Classe |
|------|--------|
| Base | `CARD_BASE_CLASS` |
| Texte bibliothèque | `TEXT_CARD_CLASS` |
| Exercice | `EXERCISE_CARD_CLASS` |

Fichier : `src/components/ui/card-styles.ts`

### Empty State

**`EmptyState`** (`src/components/ui/empty-state.tsx`) — seule implémentation.

`LessonsEmptyState` = wrapper avec icône.

### Skeleton

`Skeleton` shadcn + `SKELETON_CARD_CLASS` pour alignement cartes.

---

## 5. Fichiers de référence

```
src/lib/design/
  layout.ts      # WIDTH_READING | WIDTH_CONTENT | WIDTH_DASHBOARD
  rhythm.ts      # espacements, grilles, classes PageHeader
  classes.ts     # CTA, badges, boutons utilitaires

src/components/ui/
  PageHeader.tsx
  PageBody.tsx
  PageSection.tsx
  ContextBar.tsx
  SectionHeader.tsx
  button.tsx     # variant rossiyani
  badge.tsx      # variants accent, muted
  pill.tsx       # PillGroup
  empty-state.tsx
  card-styles.ts
  FilterPills.tsx  # → PillGroup
```

---

## 6. Audit initial

Inventaire pré-standardisation : [`UI_AUDIT_V1.md`](./UI_AUDIT_V1.md) (Story 5.1, lecture seule).

Stories suivantes :

| Story | Périmètre |
|-------|-----------|
| **5.4** | Branding (favicon, logo, wording FR) |
| **5.5** | Polish ciblé — retours utilisateur réels avant bêta |

---

## Critères d'acceptation

### 5.2 ✅

- [x] Une seule palette (`ink` / `accent` / tokens Rossiyani)
- [x] Une seule famille de composants (Pill, EmptyState, CTA, Card, Badge)
- [x] Une seule grille de largeur (680 / 900 / 1080)
- [x] Ce document comme référence unique

### 5.3 ✅

- [x] PageHeader sur toutes les pages principales (sauf exceptions documentées)
- [x] Rythme vertical 48px / 64px via `PageBody` + `PageSection`
- [x] `SectionHeader` + grilles cartes uniformes
- [x] Responsive padding `px-6 md:px-10`
