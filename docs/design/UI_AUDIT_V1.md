# UI Audit V1 — Story 5.1

> **Epic 5 — Design System Audit**  
> Dernière mise à jour : juillet 2026  
> **Statut** : recensement uniquement — **aucune correction appliquée**

---

## Méthode

Audit réalisé par **revue systématique du code** (composants, pages, tokens `globals.css`, `tailwind.config.ts`) sur l'ensemble des écrans listés ci-dessous.

| Page / zone | Fichiers principaux |
|-------------|---------------------|
| Home | `HomePage.tsx` |
| Library | `library/page.tsx`, `TextCard`, `ImportTextCard` |
| Reader | `ReaderContainer`, `ReaderHeader`, `ExplorerPanel` |
| Lessons | `lessons/page.tsx`, parcours, détail leçon |
| Practice | `practice/page.tsx`, `ContextTranslation`, `SentenceBuilder` |
| Vocabulary | `VocabularyView`, `VocabularyEntry` |
| Review | `ReviewView`, `ReviewSession` |
| Import | `ImportPageView`, `ImportPreviewView` |
| Login / Register | `(auth)/login`, `(auth)/register` |
| Onboarding | `OnboardingFlow` |
| Navigation | `AppNav` |

**Non couvert par cet audit** : tests visuels navigateur systématiques (recommandé avant corrections — Story 5.2+).

---

## Synthèse

| Gravité | Nombre d'items |
|---------|----------------|
| **Haute** | 8 |
| **Moyenne** | 18 |
| **Faible** | 14 |
| **Info** | 6 |

### Constats majeurs (sans correction)

1. **Deux systèmes de tokens coexistent** : Rossiyani (`ink`, `accent`, `bg`, `surface`) et shadcn/brand (`brand-*`, `primary`, `muted`, `popover`).
2. **Quatre largeurs de contenu** sans règle documentée : 680px, 768px (`max-w-3xl`), 900px, 1080px (+ 34rem leçons).
3. **Headers hétérogènes** : `PageHeader` sur la majorité des hubs, mais Home / Review / Reader / détail leçon ont des patterns propres.
4. **Branding fragmenté** : 3 traitements du logo, pas de favicon dédié, titres FR/EN mélangés.
5. **Composants dupliqués** : pills de filtre (3 implémentations), empty states (4+ variantes), CTA primaires (5+ styles).

---

## Inventaire tokens (référence)

### Rossiyani (cible produit)

| Token | Valeur | Usage attendu |
|-------|--------|---------------|
| `ink` / `ink-2` / `ink-3` | #0E0E0E / #5A5A5A / #A8A8A8 | Texte |
| `accent` | #4F46E5 | CTA, liens actifs |
| `bg` | #F8F6F2 | Fond app |
| `surface` | #FFFFFF | Cartes, headers |
| `border` | #E8E4DC | Bordures |
| `font-serif` | DM Serif Display | Titres |
| `font-sans` | DM Sans | UI |
| `font-russian` | Noto Serif | Cyrillique |

### Parasites / parallèles (à rationaliser)

| Token / pattern | Où | Problème |
|-----------------|-----|----------|
| `brand-*` | Auth, Onboarding, Practice, Review, Vocabulary cards | Duplique accent/ink |
| `primary` / `muted` shadcn | `Button`, `Input` defaults | Conflit sémantique avec `--accent` shadcn ≠ Rossiyani |
| Hex hardcodés `#4F46E5`, `#E8E4DC`… | `FilterPills`, `card-styles` inline | Contourne tokens |
| `red-600`, `orange-500`, `emerald-600` | `ReviewSession` ratings | Palette hors charte |
| `text-amber` / `bg-amber/10` | Import errors | `amber` absent de `tailwind.config.ts` — rendu incertain |
| Styles inline Explorer | `#FFFFFF`, `borderRadius: 16` | Hors design system |

---

## Tableau principal — Élément · Gravité · Action

| Élément | Gravité | Action |
|---------|---------|--------|
| **Tokens — double système `brand-*` vs `ink/accent`** | Haute | Unifier sur tokens Rossiyani ; déprécier `brand-*` |
| **Tokens — conflit shadcn `--accent` / Rossiyani `--color-accent`** | Haute | Documenter source de vérité ; aligner `Button` default variant |
| **Largeurs — 4 colonnes sans grille documentée** | Haute | Définir 3 tiers : narrow 680 (lecture), medium 768 (outil), wide 1080 (hub) |
| **Headers — Review sans `PageHeader`** | Haute | Aligner eyebrow + serif + sous-titre ou documenter exception « focus mode » |
| **Headers — Home sans `PageHeader`** | Moyenne | Harmoniser hero (eyebrow/titre) avec échelle PageHeader |
| **Headers — Import : PageHeader 1080px / contenu 680px** | Moyenne | Aligner largeur header et corps (680 ou wrapper commun) |
| **Branding — pas de favicon Rossiyani** | Haute | Créer favicon + `metadata.icons` |
| **Branding — 3 logos (AppNav Р, Auth BookOpen, Onboarding BookOpen)** | Haute | Unifier sur marque Р + wordmark |
| **Wording — titre « Vocabulary » (FR UI)** | Moyenne | Renommer « Vocabulaire » |
| **Wording — « Ouvrir Vocabulary → » (Home)** | Moyenne | FR cohérent |
| **Wording — collections EN (« Everyday Russian »)** | Faible | Traduire labels UI ou assumer bilingue et documenter |
| **FilterPills — hex hardcodés** | Moyenne | Remplacer par `border-accent bg-accent text-white` |
| **VocabularyFilterPills — duplication de FilterPills** | Moyenne | Fusionner en un composant |
| **ImportSourceTabs — 3e variante de pills** | Faible | Étendre `FilterPills` ou `SegmentedControl` unique |
| **CTA primaires — 5+ styles** | Haute | Token `btn-primary` : `rounded-[10px] bg-accent py-3 font-bold` |
| **CTA — `Button` shadcn vs classes ad hoc** | Moyenne | Variante `primary` Rossiyani dans `button.tsx` |
| **Cards — `CARD_BASE_CLASS` vs `rounded-xl` ad hoc** | Moyenne | Standardiser sur `card-styles` |
| **Cards — Review liste ≠ TextCard** | Faible | Variante `ListCard` ou réutiliser tokens carte |
| **Empty states — 4+ patterns** | Moyenne | Composant `EmptyState` unique (dashed + CTA) |
| **Badges niveau — `bg-accent` vs `border` (Reader)** | Faible | Unifier badge niveau A1–C2 |
| **Badges — path color inline (`style={{ backgroundColor }}`)** | Info | Acceptable si documenté (leçons) |
| **Rayons — `rounded-lg` / `rounded-[10px]` / `rounded-[14px]` / `rounded-2xl`** | Moyenne | Mapper sur `--radius-sm/md/lg` existants |
| **Ombres — 3 valeurs rgba indigo proches** | Faible | Constante unique `shadow-card-hover` |
| **Padding horizontal — `px-4` / `px-6` / `px-10` / `px-12`** | Moyenne | Règle : mobile `px-4`, tablet `px-6`, desktop `px-10` |
| **Padding vertical sections — `pt-11` vs `py-8` vs `py-10`** | Moyenne | Rythme vertical unique `space-y-11` + `pt-11` |
| **PageHeader — `px-10` sans breakpoint mobile** | Moyenne | `px-4 md:px-10` comme AppNav |
| **Home — hero `text-[52px]` sans clamp** | Moyenne | `text-4xl md:text-[52px]` ou clamp |
| **Home — compteurs collections incluent imports** | Moyenne | Filtrer `source !== 'imported'` (cohérence Library) |
| **Library — Continue card vs Home CurrentReading** | Faible | Extraire `ReadingHeroCard` partagé |
| **Reader — Explorer inline styles** | Haute | Migrer vers classes Tailwind / tokens |
| **Reader — titre `font-russian` vs curated `font-serif` titres** | Info | Intentionnel — documenter |
| **Reader — pas de badge « Importé » (Story 4.7)** | Info | Hors audit polish — backlog 4.7 |
| **Lessons détail — header dense (`mb-16`, `pb-12`)** | Haute | Réduire espacement ; aligner sur rythme 11 |
| **Lessons détail — `max-w-3xl` article + `max-w-[34rem]` blocs** | Moyenne | Clarifier narrow reading column |
| **Lessons — double barre (ContextBack + Breadcrumb)** | Moyenne | Fusionner ou espacer uniformément |
| **Practice hub — `max-w-[900px]` (3e largeur)** | Moyenne | Aligner 1080 ou 768 selon grille |
| **Practice exercices — 100% `brand-*`** | Haute | Migrer vers tokens Rossiyani |
| **Vocabulary — titre EN + pills dupliquées** | Moyenne | FR + composant filtre unifié |
| **Vocabulary entry — padding `px-8` vs hub `px-10`** | Faible | Harmoniser |
| **Review — header custom `font-bold` vs `font-serif`** | Moyenne | Aligner typographie titres |
| **Review session — boutons Anki colors (`red-600`…)** | Moyenne | Palette sémantique Rossiyani ou documenter exception SRS |
| **Import — cohérent avec spec UX** | Faible | Ajustements mineurs post-audit |
| **Import — `text-amber` non configuré** | Moyenne | Ajouter `amber` token ou utiliser `accent`/`destructive` |
| **Auth — shadcn `Card` + `brand-*`** | Moyenne | Aligner login/register sur tokens Rossiyani |
| **Onboarding — `rounded-2xl` + `#F0F4FF` quote** | Moyenne | Tokens surface/accent-light |
| **Onboarding — fond `bg-brand-surface` vs app `bg-bg`** | Faible | Même teinte, classes différentes |
| **Nav — Import absent du menu** | Info | Volontaire V1 — lien Library suffisant |
| **Nav — logo ≠ Auth logo** | Moyenne | Unifier |
| **Skeletons — `rounded-lg` vs `rounded-[14px]`** | Faible | Aligner sur radius cartes |
| **Focus — `Button` ring shadcn vs cartes `ring-accent/30`** | Faible | Harmoniser focus visible |
| **Dark mode CSS — `.dark` défini, jamais activé** | Info | Supprimer ou reporter post-V1 |
| **Responsive — PageHeader mobile padding** | Moyenne | Tester iPhone SE ; réduire padding |
| **Responsive — Explorer desktop fixed, sheet mobile** | Faible | Vérifier chevauchement tablette 768–1024px |
| **Responsive — Review ratings `grid-cols-2` mobile** | Faible | OK — noter en validation QA |
| **Responsive — Library grille 1 col** | Info | Conforme |
| **Responsive — Import preview boutons empilés** | Info | Conforme UX_V1 |
| **Public — `vercel.svg` / pas d'assets marque** | Haute | Nettoyer `public/` ; ajouter assets Rossiyani |
| **Metadata — title seul, pas d'OG** | Faible | Préparer Phase C branding |
| **Composants shadcn peu utilisés vs custom** | Info | `card.tsx` vs `CARD_BASE_CLASS` — choisir canon |

---

## Détail par page

### Home (`/`)

| Aspect | Constat |
|--------|---------|
| Layout | `max-w-[1080px]`, pas de PageHeader |
| Typo | Hero `font-serif` 52px — plus grand que PageHeader (44px) |
| Couleurs | Tokens Rossiyani cohérents sur hero et pills |
| Composants | `CurrentReadingCard` ≈ Library « Continuer » (duplication) |
| Responsive | Grille 2 col `md:` — hero titre peut déborder petit mobile |

### Library (`/library`)

| Aspect | Constat |
|--------|---------|
| Layout | `max-w-[1080px]` + sections `border-t pt-11` — **référence forte** |
| Typo | PageHeader standard |
| Couleurs | Cohérent |
| Composants | TextCard / ImportTextCard / ImportEntryCard — bonne séparation |
| Responsive | Grille responsive OK |

### Reader (`/reader/[id]`)

| Aspect | Constat |
|--------|---------|
| Layout | Colonne `max-w-[680px]` — **référence lecture** |
| Typo | Titre russe `font-russian` 22px |
| Couleurs | Explorer : styles inline, pas tokens |
| Composants | Header sticky sous AppNav (`top-14`) — bon |
| Responsive | Padding texte dynamique Explorer ; sheet mobile |

### Lessons

| Aspect | Constat |
|--------|---------|
| Liste | PageHeader + grille 1080px — aligné Library |
| Parcours | PageHeader + `max-w-3xl` — changement largeur |
| Détail | Article long, header très espacé, pas de PageHeader |
| Composants | `LessonBridgeCard`, `LessonCard` — cohérents |

### Practice

| Aspect | Constat |
|--------|---------|
| Hub | PageHeader OK ; corps `max-w-[900px]` isolé |
| Exercices | Forte dépendance `brand-*`, breadcrumbs custom |
| CTA | `bg-brand-primary` ≠ `bg-accent` ailleurs |

### Vocabulary

| Aspect | Constat |
|--------|---------|
| Layout | `max-w-3xl` — aligné Review |
| Typo | **Titre « Vocabulary » en anglais** |
| Filtres | Pills dupliquées, hex hardcodés |
| Empty | `CARD_BASE_CLASS` — OK |

### Review

| Aspect | Constat |
|--------|---------|
| Liste | Header custom, pas PageHeader |
| Session | `brand-*` + couleurs SRS Anki |
| Empty | `rounded-xl border-dashed` — différent Library |

### Import

| Aspect | Constat |
|--------|---------|
| Layout | `max-w-[680px]` — aligné Reader |
| Typo | PageHeader + russe 18–20px — conforme UX_V1 |
| États | Banners amber — token manquant |
| Responsive | Conforme spec |

### Login / Register

| Aspect | Constat |
|--------|---------|
| Layout | Centré `max-w-[400px]` |
| Branding | `RossiyaniLogo` BookOpen ≠ AppNav |
| Tokens | 100% `brand-*` + shadcn Card |

### Onboarding

| Aspect | Constat |
|--------|---------|
| Layout | Plein écran, carte `max-w-[560px]` |
| Tokens | `brand-*`, accent hardcodé `#F0F4FF` |
| CTA | `Button` + override `bg-brand-primary` |

---

## Responsive — pages à valider en QA manuelle

| Page | Risque | Breakpoint |
|------|--------|------------|
| PageHeader | Padding 40px latéral sur mobile | < 390px |
| Home hero | Titre 52px | < 390px |
| Reader + Explorer | Panneau fixed chevauche texte | 768–1100px |
| Lessons détail | `px-12` + colonne étroite | 768px |
| Review session | 4 boutons ratings | < 360px |
| Import textarea | 280px min-height + clavier mobile | iOS Safari |
| Library | Section Mes imports longue | scroll anchor OK |

**Aucune correction appliquée** — liste pour Story 5.2+.

---

## Branding — état des lieux

| Asset | État | Action recommandée |
|-------|------|-------------------|
| Favicon | Absent (defaults Next/Vercel dans `public/`) | Créer |
| Logo AppNav | Р noir + « Rossiyani » | Conserver comme référence |
| Logo Auth | BookOpen + texte `brand-primary` | Remplacer par référence AppNav |
| Logo Onboarding | BookOpen petit | Idem |
| Nom produit | « Rossiyani » cohérent | OK |
| Wording FR | Mélange EN (Vocabulary, collections) | Harmoniser |
| Icônes | Lucide partout — cohérent | OK |

---

## Variantes de composants à fusionner (futur)

```
FilterPills ─┬─ VocabularyFilterPills
             └─ ImportSourceTabs (style proche)

Empty state ─┬─ LessonsEmptyState
             ├─ LibraryImportsSection empty
             ├─ ReviewView empty
             └─ VocabularyView empty

Primary CTA ─┬─ Import analyze button
             ├─ Review « Commencer »
             ├─ Auth submit
             └─ Home/Library hero CTA
```

---

## Priorisation suggérée pour Stories 5.2–5.5

> **Ne pas implémenter ici** — proposition de lots post-audit.

| Lot | Stories estimées | Périmètre |
|-----|------------------|-----------|
| **5.2 Tokens & fondations** | 1 | Unifier tokens, `Button`, pills, supprimer hex hardcodés |
| **5.3 Layout & headers** | 1 | Grille largeurs, PageHeader responsive, Review/Vocabulary headers |
| **5.4 Branding** | 1 | Favicon, logo unique, wording FR, `public/` |
| **5.5 Polish ciblé** | 1 | Explorer, Lessons spacing, empty states, ombres/rayons |

Après ces lots → **Design Freeze** (sauf bug bloquant).

---

## Critères Design Freeze (rappel)

- [ ] Une seule source de tokens documentée
- [ ] 3 largeurs de contenu maximum, nommées
- [ ] `PageHeader` ou exceptions documentées sur 100% des hubs
- [ ] Favicon + logo unifiés
- [ ] Wording FR cohérent (hors noms de collections si décision produit)
- [ ] Composants filtre / empty / CTA canoniques
- [ ] QA responsive validée sur 3 breakpoints

---

## Règle Story 5.1

**Aucune correction de code dans cette Story.**  
Prochaine étape : priorisation fondateur → Stories 5.2+.

---

## Références

| Document | Lien |
|----------|------|
| Tokens | `src/app/globals.css`, `tailwind.config.ts` |
| Cartes | `src/components/ui/card-styles.ts` |
| Import UX (référence récente) | `docs/import/UX_V1.md` |
| Charte Reader | `docs/reader/CHARTE_EDITORIALE.md` |
