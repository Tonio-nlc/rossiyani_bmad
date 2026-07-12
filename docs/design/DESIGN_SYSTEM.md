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
| **Layouts hub (5.3)** | ✅ |
| **Reader layout (5.4)** | ✅ |
| **Lessons layout (5.5)** | ✅ **gelé** |
| **UI Freeze (5.6)** | ✅ |
| **Release Candidate** | **Prochaine** |

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

---

## 3. Composition & grammaire de page (Story 5.3)

> Le Design System (5.2) définit les **composants**.  
> La composition (5.3) définit comment les **assembler**.

Constantes : `src/lib/design/rhythm.ts` · Composant : `src/components/ui/Section.tsx`

### Composition canonique (pages hub)

```text
Navbar
↓
[ContextBar]          ← optionnel
↓
PageHeader            ← eyebrow · titre · sous-titre
↓ 64px
Hero / contenu initial
↓ 56px
Section (title → description → content)
↓ 40px
Section
...
```

### Échelle verticale unique

| Token | px | Usage |
|-------|-----|-------|
| `PAGE_AFTER_HEADER_CLASS` | 64 | Sous PageHeader |
| `HERO_TO_SECTION_CLASS` | 56 | Hero → première section |
| `SECTION_GAP_CLASS` | 40 | Entre sections |
| `SECTION_CONTENT_GAP_CLASS` | 24 | Titre section → contenu |
| `SUBSECTION_GAP_CLASS` | 24 | Filtres → grille |
| `CARD_GRID_*` gap | 16 | Entre cartes |

### Composants composition

| Composant | Rôle |
|-----------|------|
| `PageHeader` | En-tête page |
| `PageBody` | Corps (`PAGE_AFTER_HEADER_CLASS`) |
| `Section` | **Canonique** — title + description + children |
| `PageSection` | Bloc avec `SECTION_GAP_CLASS` ou `HERO_TO_SECTION_CLASS` |
| `ContextBar` | Retour reader / fil d'Ariane |

### Grilles hub

| Contexte | Classe | Colonnes |
|----------|--------|----------|
| Dashboard (Home, Library) | `CARD_GRID_3COL_CLASS` | 1 → 2 → 3 |
| Hub 2 colonnes (Practice) | `CARD_GRID_2COL_CLASS` | 1 → 2 |
| Reader / Lesson détail | 1 colonne | Stories 5.4 / 5.5 |

### Hauteurs officielles (hub)

| Type | Classe | min-height |
|------|--------|------------|
| Carte hub (exercice, parcours) | `CARD_HUB_CLASS` | 168px |
| Carte collection | `CARD_COLLECTION_CLASS` | 144px |
| Carte texte | `CARD_TEXT_CLASS` | 176px |
| Empty state hub | `EMPTY_STATE_SHELL_CLASS` | 160px |
| Encart promo | `CARD_PROMO_CLASS` | auto |

Coque commune : `CARD_SHELL_CLASS` — `p-5`, `rounded-[14px]`, hover uniforme.

### Pages hub migrées (5.3)

Home · Library · Lessons (liste) · Vocabulary · Practice

### Hors scope 5.3 — Stories dédiées

| Zone | Story |
|------|-------|
| Reader | **5.4** ✅ |
| Lessons détail | **5.5** ✅ |
| Branding + UI Freeze + QA | **5.6** ✅ |
| Auth · Onboarding | Exceptions figées |

---

## 4. Reader Composition (Story 5.4)

> Le Reader est une **page éditoriale** — pas un empilement de cartes.  
> Constantes : `src/lib/design/reader-composition.ts`

### Structure page

```text
Navbar
↓
ReaderHeader          ← breadcrumb léger · titre aéré · méta · liens contexte
↓
Colonne lecture       ← max-w-reading (680px), centrée
  Phrase
  ↓ traduction (rattachée)
  Phrase
  ...
  ↓ conclusion
  ReaderEncounteredLessons
```

Explorer = panneau **secondaire** (fixed, hors flux), jamais une page entière.

### Explorer Composition

| Contrainte | Valeur |
|------------|--------|
| Largeur | 320px (`EXPLORER_PANEL_WIDTH_CLASS`) |
| Hauteur max | 520px (`EXPLORER_PANEL_MAX_HEIGHT_CLASS`) |
| Dépassement | scroll interne (chrome fixe + body scroll) |
| Position desktop | fixed, hors colonne texte |

**Hiérarchie fixe** (aucun autre ordre) :

```text
Mot (lemma)
↓ 16px
Traduction
↓ 20px
Badge grammatical
↓ 24px
Explication
↓ 24px (si existe)
Terminaison
↓ 24px (si existe)
Bridge Lesson (carte secondaire)
↓ 24px
CTA Sauvegarder — w-fit, aligné à droite
```

États loading · erreur · sauvegardé : même composition (skeleton / message + CTA aligné).

Bridge Lesson dans Explorer : badge → titre → parcours → CTA (`ExplorerLessonDeepLink`).

### Sentence Composition

Chaque phrase = même structure :

```text
<article> — phrase russe (SENTENCE_TEXT_CLASS)
↓ mt-2
Lien « voir la traduction » (SENTENCE_TRANSLATION_TOGGLE_CLASS)
↓ mt-1.5 (si ouvert)
Traduction (SENTENCE_TRANSLATION_TEXT_CLASS)
```

Rythme entre phrases : `SENTENCE_RHYTHM_CLASS` (mb-5).

### Header & conclusion

| Élément | Classe / règle |
|---------|----------------|
| Breadcrumb | `READER_BREADCRUMB_CLASS` — 11px, ink-3, poids réduit |
| Titre | `READER_TITLE_CLASS` — mt-4 sous breadcrumb |
| Shell header | `READER_HEADER_SHELL_CLASS` — py-4 md:py-5 |
| Fin de lecture | `READER_CONCLUSION_CLASS` — mt-20 border-t pt-12 |

### Fichiers Reader

```
src/lib/design/reader-composition.ts
src/components/reader/
  ReaderContainer.tsx
  ReaderHeader.tsx
  TextBody.tsx
  Sentence.tsx
  ExplorerPanel.tsx
  ExplorerLessonDeepLink.tsx
  ReaderEncounteredLessons.tsx
```

---

## 5. Lesson Composition (Story 5.5)

> Une leçon = un **article éditorial** — pas une suite de blocs React.  
> Constantes : `src/lib/design/lesson-composition.ts`

### Structure page

```text
Breadcrumb (léger)
↓
Hero — eyebrow · titre
↓
Sections pédagogiques (rythme 40 / 24 / 16 px)
↓
Takeaways (conclusion)
↓
Appendice Reader ↔ Lesson
↓
Marquer comme lu
```

### Échelle verticale

| Niveau | px | Classe |
|--------|-----|--------|
| Entre sections | 40 | `LESSON_SECTION_GAP_CLASS` |
| Sous-contenu (exemples, blocs) | 24 | `LESSON_SUBCONTENT_GAP_CLASS` |
| Paragraphes | 16 | `LESSON_PARAGRAPH_GAP_CLASS` |

### Lesson Composition (hero + corps)

| Élément | Classe |
|---------|--------|
| Colonne | `LESSON_COLUMN_CLASS` — max-w-reading (680px) |
| Hero shell | `LESSON_HERO_CLASS` |
| Eyebrow | `LESSON_EYEBROW_CLASS` |
| Titre | `LESSON_TITLE_CLASS` — respiration sous breadcrumb |

### Lesson Example

Carte compacte — phrase → traduction → explication :

| Élément | Classe |
|---------|--------|
| Coque | `LESSON_EXAMPLE_CARD_CLASS` — p-4, space-y-3 |
| Phrase russe | `LESSON_EXAMPLE_RUSSIAN_CLASS` — 20px |
| Traduction | `LESSON_EXAMPLE_TRANSLATION_CLASS` |
| Note | `LESSON_EXAMPLE_NOTE_CLASS` |

Toutes les cartes leçon partagent `LESSON_CARD_SHELL_CLASS` (radius 12px, border, bg).

### Lesson Schema

Schéma = **illustration** intégrée, pas bloc isolé :

| Élément | Classe |
|---------|--------|
| Coque | `LESSON_SCHEMA_SHELL_CLASS` |
| Padding SVG | `LESSON_SCHEMA_PADDING_CLASS` — p-5 md:p-6 (ne touche jamais les bords) |
| Légende | `LESSON_SCHEMA_CAPTION_CLASS` |

### Section « Comprendre »

Nouvelle étape de lecture — `headerTone: "step"` :

```text
border-t
↓ pt-10
Eyebrow accent
↓
Titre serif
```

### Lesson Ending

| Zone | Classe |
|------|--------|
| Takeaways | `LESSON_ENDING_CLASS` — border-t, mt-16, conclusion visuelle |
| Appendice Reader | `LESSON_APPENDIX_CLASS` — complément, pas section pédagogique |
| CTA complétion | `LESSON_COMPLETE_CLASS` |

### Fichiers Lesson

```
src/lib/design/lesson-composition.ts
src/lib/lessons/lesson-section-rhythm.ts
src/app/(app)/lessons/[parcoursSlug]/[lessonSlug]/page.tsx
src/components/lessons/
  LessonSection.tsx
  LessonBlockRenderer.tsx
  LessonExampleSentence.tsx
  SchemaDiagram.tsx
  LessonEncounteredTexts.tsx
```

---

## 6. Composants canoniques

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

## 7. Fichiers de référence

```
src/lib/design/
  layout.ts      # WIDTH_READING | WIDTH_CONTENT | WIDTH_DASHBOARD
  rhythm.ts      # espacements, grilles, classes PageHeader
  reader-composition.ts  # Reader / Explorer / Sentence (5.4)
  lesson-composition.ts  # Lesson / Example / Schema / Ending (5.5)
  classes.ts     # CTA, badges, boutons utilitaires

src/components/ui/
  PageHeader.tsx
  PageBody.tsx
  PageSection.tsx
  ContextBar.tsx
  Section.tsx        # composition canonique
  SectionHeader.tsx
  button.tsx     # variant rossiyani
  badge.tsx      # variants accent, muted
  pill.tsx       # PillGroup
  empty-state.tsx
  card-styles.ts
  FilterPills.tsx  # → PillGroup
```

---

## 8. Audit initial

Inventaire pré-standardisation : [`UI_AUDIT_V1.md`](./UI_AUDIT_V1.md) (Story 5.1, lecture seule).

Stories composition (ordre fondateur) :

| Story | Périmètre | Priorité |
|-------|-----------|----------|
| **5.4** | Reader layout | ★★★★★ ✅ |
| **5.5** | Lessons layout (détail) | ★★★★★ ✅ |
| **5.6** | Branding + UI Freeze + QA visuelle | ★★★ |

Pas de polish global. Chaque story = une famille de problèmes.

---

## Critères d'acceptation

### 5.2 ✅

- [x] Une seule palette (`ink` / `accent` / tokens Rossiyani)
- [x] Une seule famille de composants (Pill, EmptyState, CTA, Card, Badge)
- [x] Une seule grille de largeur (680 / 900 / 1080)
- [x] Ce document comme référence unique

### 5.3 ✅ Layout Foundation (hub)

- [x] Composition canonique `PageHeader → Hero → Section`
- [x] Échelle verticale unique (64 / 56 / 40 / 24 / 16 px)
- [x] Composant `Section` (title → description → content)
- [x] Hauteurs hub documentées (`CARD_HUB`, `CARD_COLLECTION`, `CARD_TEXT`)
- [x] Home · Library · Lessons liste · Vocabulary · Practice migrés
- [x] Reader · Explorer · Lesson détail **non touchés** (5.3)
- [x] `npm run build` ✅

### 5.4 ✅ Reader Layout (composition éditoriale)

- [x] Explorer panneau secondaire — max 520px, scroll interne
- [x] Hiérarchie Explorer fixe (mot → traduction → badge → explication → terminaison → bridge → CTA)
- [x] CTA Sauvegarder w-fit, aligné à droite
- [x] Phrases : structure unique, traduction rattachée
- [x] Largeur 680px (`max-w-reading`) partout dans la colonne
- [x] Bridge Lesson carte discrète dans Explorer
- [x] Conclusion « Tu viens de rencontrer » distinguée
- [x] Breadcrumb allégé, header aéré
- [x] Doc § Reader / Explorer / Sentence Composition
- [x] `npm run build` ✅

### 5.5 ✅ Lesson Layout (composition éditoriale)

- [x] Hero éditorial — eyebrow · titre · respiration
- [x] Échelle verticale unique 40 / 24 / 16 px
- [x] Paragraphes uniformisés (`LESSON_PROSE_CLASS`)
- [x] Cartes exemple compactes (p-4, hauteur contenu)
- [x] Schémas illustration avec padding SVG officiel
- [x] Section Comprendre = nouvelle étape (`step`)
- [x] Takeaways = conclusion (`LESSON_ENDING_CLASS`)
- [x] Liens Reader = appendice (`LESSON_APPENDIX_CLASS`)
- [x] Largeur 680px partout (`LESSON_COLUMN_CLASS`)
- [x] Doc § Lesson Composition
- [x] `npm run build` ✅

### 5.6 ✅ Branding, Cohérence & UI Freeze

- [x] Branding complet (favicon, manifest, OG, logo unique)
- [x] Navbar = Auth (même marque)
- [x] Terminologie documentée (FR bêta → EN v1)
- [x] États Error/Empty canoniques
- [x] Inputs et boutons uniformisés
- [x] Cartes vocabulaire alignées `CARD_SHELL_CLASS`
- [x] [`UI_FREEZE.md`](./UI_FREEZE.md) — gel actif
- [x] `npm run build` ✅
