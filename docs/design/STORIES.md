# Phase C — Stories Composition UI

> Epic 5 — Grammaire de composition (pas polish global)  
> **Import V1 gelé** — ne pas toucher sauf bug critique

Le Design System (5.2) définit les composants.  
Les stories 5.3+ définissent comment les **composer**.

---

## Story 5.1 — Audit global UI ✅

[`UI_AUDIT_V1.md`](./UI_AUDIT_V1.md)

---

## Story 5.2 — Design System (tokens & composants) ✅

[`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) § Tokens

---

## Story 5.3 — Layout Foundation & Composition (hub) ✅

**Objectif** : une seule façon de construire une page hub.

**Hors scope** : Reader, Explorer, Lesson détail, couleurs, typo, branding.

### Réalisé

- Échelle verticale : 64 / 56 / 40 / 24 / 16 px (`rhythm.ts`)
- Composant `Section` (title → description → content)
- Cartes hub : `CARD_HUB` (168px) · `CARD_COLLECTION` (144px) · `CARD_TEXT` (176px)
- Home : PageHeader + hero compact + sections resserrées
- Library : sections rapprochées, Mes imports plus proche
- Lessons liste · Vocabulary · Practice : hero réduit, cartes plus denses

---

## Story 5.4 — Reader Layout (Editorial Composition) ✅ **GELÉE**

**Objectif** : transformer le Reader en page éditoriale fluide. Aucun changement fonctionnel.

### Réalisé

- `reader-composition.ts` — constantes officielles Reader / Explorer / Sentence
- Explorer : panneau secondaire 320×520px max, scroll interne, hiérarchie fixe
- CTA Sauvegarder : w-fit, aligné à droite (plus pleine largeur)
- Phrases : rythme livre, traduction rattachée (`mt-2`)
- Header : breadcrumb allégé, titre aéré
- Conclusion « Tu viens de rencontrer » : espacement conclusion
- Bridge Lesson dans Explorer : carte secondaire discrète
- Doc : `DESIGN_SYSTEM.md` § Reader Composition

**Ne pas retoucher** sauf bug critique.

---

## Story 5.5 — Lesson Layout (Editorial Composition) ✅

**Objectif** : transformer une leçon en article éditorial. Composition uniquement.

### Réalisé

- `lesson-composition.ts` — Lesson / Example / Schema / Ending
- Hero éditorial : breadcrumb léger → eyebrow → titre
- Échelle verticale 40 / 24 / 16 px (`lesson-section-rhythm.ts`)
- Paragraphes uniformisés, cartes exemple compactes
- Schémas = illustrations avec padding SVG officiel
- Section Comprendre = nouvelle étape (`step`)
- Takeaways = conclusion visuelle
- Liens Reader = appendice (pas section pédagogique)
- Largeur 680px partout
- Doc : `DESIGN_SYSTEM.md` § Lesson Composition

**Hors scope respecté** : pipeline, données JSON, contenu pédagogique, logique bridge.

---

## Roadmap composition (ordre fondateur)

| Story | Périmètre | Gravité |
|-------|-----------|---------|
| **5.2** | Design System | ✅ |
| **5.3** | Layout Foundation (hub) | ✅ |
| **5.4** | Reader Composition | ✅ **gelé** |
| **5.5** | Lesson Composition | ✅ |
| **5.6** | Branding + UI Freeze + QA visuelle | ★★★ |

Explorer polish absorbé en 5.4 + QA 5.6. Pas de story dédiée — éviter le polish infini.

**Ne pas faire** : polish UI global hors freeze, retouches Reader/Lessons gelés.

La 5.6 inclura branding (logo, favicon, cohérence FR/EN) + passe QA visuelle + **Design Freeze**.

---

## Story 4.7 — Reader polish import (gelée)

Absorbée par 5.4.
