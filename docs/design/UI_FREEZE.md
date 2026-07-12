# UI Freeze — Rossiyani

> Story 5.6 — **Cohérence & gel définitif**  
> À partir de ce document : aucune modification du Design System sans justification (bug, régression, incohérence).

---

## Statut

| Zone | Freeze |
|------|--------|
| Design System tokens (5.2) | ✅ |
| Hub composition (5.3) | ✅ |
| Reader composition (5.4) | ✅ **gelé** |
| Lesson composition (5.5) | ✅ **gelé** |
| Branding & cohérence (5.6) | ✅ |
| **UI Freeze global** | ✅ **ACTIF** |

---

## Règle d'or

> Plus de redesign. Plus de nouvelle règle graphique.  
> Uniquement : bug · régression · incohérence.

### Hors scope post-freeze (sauf bug)

- Reader · Lessons · Import · Library · Home · Explorer
- Refonte composition
- Polish esthétique opportuniste

---

## Checklist cohérence (5.6)

### Branding

- [x] `favicon.svg` + `apple-touch-icon.svg`
- [x] `manifest.webmanifest`
- [x] Metadata OpenGraph + icons (`layout.tsx`)
- [x] Logo unique : `RossiyaniBrandMark` + `RossiyaniLogo`
- [x] Navbar = Auth (même marque Р)

### Terminologie

- [x] Document [`TERMINOLOGY.md`](./TERMINOLOGY.md) — FR bêta → EN v1
- [x] Incohérences critiques corrigées (Vocabulaire)

### Composants canoniques

| Élément | Source |
|---------|--------|
| CTA primaire | `BTN_PRIMARY_CLASS` / `Button` variant `rossiyani` |
| CTA secondaire | `BTN_SECONDARY_CLASS` / `Button` variant `secondary` |
| Lien CTA carte | `CTA_LINK_CLASS` |
| Input | `Input` shadcn + `INPUT_SHELL_CLASS` |
| Carte | `CARD_SHELL_CLASS` (radius 14px, border, hover) |
| Empty | `EmptyState` |
| Error | `ErrorState` |
| Skeleton | `Skeleton` + `SKELETON_CARD_CLASS` |
| Icône carte | `CARD_ICON_BOX_CLASS` |

### Cartes — coque officielle

```
rounded-[14px]
border border-border
bg-surface
p-5
hover:border-accent-border
hover:shadow-[0_4px_20px_rgba(79,70,229,0.08)]
```

Variantes autorisées : `CARD_HUB` · `CARD_COLLECTION` · `CARD_TEXT` · `LESSON_CARD_SHELL` (lecture) · `EMPTY_STATE_SHELL`.

### Navigation — structure page

```text
Navbar (AppNav)
↓
[ContextBar] optionnel
↓
PageHeader (hub) / Hero éditorial (Reader · Lesson)
↓
PageBody / contenu
↓
Sections
```

### Scroll — zones sensibles

| Zone | Règle |
|------|-------|
| Reader | Colonne texte scroll ; Explorer fixed + scroll interne |
| Lessons | Scroll page unique |
| Import | Scroll page unique |
| Library | Scroll page unique |

Pas de double scroll documenté post-freeze.

### Desktop — largeurs testées

1280 · 1440 · 1680 · 1920 — grilles 680 / 900 / 1080 inchangées.

---

## Après UI Freeze : Release Candidate (RC)

Pas de nouvelle série d'Epics design. Phase **stabilisation** :

1. Audit fonctionnel (API, Supabase, Auth, RLS, migrations)
2. Audit UX (parcours bout en bout)
3. Audit performance (requêtes, cache, rendu)
4. Audit robustesse (cas limites)
5. Correction bugs trouvés
6. Gel définitif
7. Déploiement Vercel
8. Bêta privée

---

## Modifier le Design System

Toute modification post-freeze requiert :

1. Justification (bug / régression / incohérence)
2. Mise à jour de ce document
3. Pas de « polish opportuniste »
