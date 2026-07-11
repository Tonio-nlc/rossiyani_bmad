# Phase C — Stories Design System

> Epic 5 — Standardisation UI (pas polish)  
> **Import V1 gelé** — ne pas toucher sauf bug critique

---

## Story 5.1 — Audit global UI ✅

**Objectif** : inventaire complet des incohérences — **aucune correction**.

**Livrable** : [`UI_AUDIT_V1.md`](./UI_AUDIT_V1.md)

---

## Story 5.2 — Standardisation du Design System ✅

**Objectif** : un seul Design System — tokens, largeurs, composants canoniques.

**Livrable** : [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md)

### Réalisé

- Tokens unifiés (`brand-*` supprimé, palette `ink` / `accent`)
- Grille 680 / 900 / 1080 (`max-w-reading` | `content` | `dashboard`)
- Composants canoniques : `PillGroup`, `EmptyState`, `CTA_LINK_CLASS`, `card-styles`
- Migration bulk hex / styles inline → tokens
- `src/lib/design/layout.ts`, `src/lib/design/classes.ts`

### Hors scope (respecté)

- Repositionnement, redesign, branding, responsive

---

## Stories suivantes

| Story | Périmètre |
|-------|-----------|
| **5.3** | Layout & headers (structure, PageHeader responsive) |
| **5.4** | Branding (favicon, logo, wording FR) |
| **5.5** | Polish ciblé résiduel (Explorer, Lessons, badge import) |

→ **Design Freeze** après 5.3–5.5

---

## Story 4.7 — Reader polish import (gelée avec Épic Import)

Badge « Importé », encart première ouverture — **reportée** ou absorbée par 5.5 si nécessaire.
