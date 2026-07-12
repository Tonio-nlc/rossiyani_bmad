# Phase C — Stories Composition UI

> Epic 5 — Grammaire de composition (pas polish global)  
> **Import V1 gelé** — ne pas toucher sauf bug critique  
> **UI Freeze actif** — voir [`UI_FREEZE.md`](./UI_FREEZE.md)

---

## Story 5.1 — Audit global UI ✅

[`UI_AUDIT_V1.md`](./UI_AUDIT_V1.md)

---

## Story 5.2 — Design System (tokens & composants) ✅

[`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) § Tokens

---

## Story 5.3 — Layout Foundation & Composition (hub) ✅

**Objectif** : une seule façon de construire une page hub.

---

## Story 5.4 — Reader Layout ✅ **GELÉE**

[`reader-composition.ts`](../../src/lib/design/reader-composition.ts) — ne pas retoucher sauf bug.

---

## Story 5.5 — Lesson Layout ✅ **GELÉE**

[`lesson-composition.ts`](../../src/lib/design/lesson-composition.ts) — ne pas retoucher sauf bug.

---

## Story 5.6 — Branding, Cohérence & UI Freeze ✅

**Objectif** : figer définitivement toute la couche UI. Le mot clé : **cohérence**.

### Réalisé

- Branding : favicon · apple-touch · manifest · OpenGraph · logo unique (`RossiyaniBrandMark`)
- Navbar = Auth (même marque Р)
- Terminologie : [`TERMINOLOGY.md`](./TERMINOLOGY.md) — FR bêta → EN v1 planifié
- Incohérence corrigée : Vocabulary → Vocabulaire
- États canoniques : `ErrorState` + `EmptyState`
- Inputs : `INPUT_SHELL_CLASS` (h-10, radius 10px, focus accent)
- Boutons : variant par défaut `rossiyani`
- Cartes vocabulaire alignées sur `CARD_SHELL_CLASS`
- Gel documenté : [`UI_FREEZE.md`](./UI_FREEZE.md)

**Hors scope respecté** : pas de redesign Reader · Lessons · Import · Library · Home.

---

## Après Epic 5 : Release Candidate (RC)

Pas de nouvelle série d'Epics design. Phase **stabilisation** :

1. Audit fonctionnel (API, Supabase, Auth, RLS, migrations)
2. Audit UX (parcours bout en bout)
3. Audit performance
4. Audit robustesse
5. Correction bugs
6. Gel définitif
7. Déploiement Vercel
8. Bêta privée

Séquence fondateur : Vercel → Import → Reader → Branding → Audit → publication — **quasi terminée**.
