# Phase C — Stories Design System

> Epic 5 — Standardisation UI (pas polish)  
> **Import V1 gelé** — ne pas toucher sauf bug critique

---

## Story 5.1 — Audit global UI ✅

**Livrable** : [`UI_AUDIT_V1.md`](./UI_AUDIT_V1.md)

---

## Story 5.2 — Standardisation du Design System ✅

**Livrable** : [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) § Tokens, couleurs, composants

---

## Story 5.3 — Standardisation layouts & headers ✅

**Objectif** : chaque page donne l'impression d'appartenir au même produit.

**Livrable** : [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) § Layouts

### Réalisé

- `PageHeader`, `PageBody`, `PageSection`, `ContextBar` — primitives layout
- `src/lib/design/rhythm.ts` — rythme 48px / 64px, grilles
- Migration : Home, Library, Lessons, Vocabulary, Review, Practice, Import
- `SectionHeader` + cartes `min-h-56` uniformisées
- Exceptions documentées : Reader, Explorer, Auth, Onboarding, Home hero, détail leçon

### Hors scope (respecté)

- Branding, icônes, couleurs, polish pixel-perfect, fonctionnalités

---

## Stories suivantes (courtes)

| Story | Périmètre |
|-------|-----------|
| **5.4** | Branding (logos, favicon, wording, FR/EN, identité visuelle) |
| **5.5** | Polish ciblé — **retours fondateur** après utilisation réelle |

→ **Design Freeze** après 5.4–5.5

La 5.5 sera pilotée par toi en tant qu'utilisateur, pas par un polish théorique.

---

## Story 4.7 — Reader polish import (gelée avec Épic Import)

Badge « Importé », encart première ouverture — absorbée par 5.5 si nécessaire.
