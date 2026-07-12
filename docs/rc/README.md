# Release Candidate — Rossiyani

> Phase **stabilisation produit** — plus de Stories design, uniquement des **Tickets**.

## Ordre RC (fondateur)

| Phase | Objectif | Statut |
|-------|----------|--------|
| **RC 1** | Audit UX complet — parcours nouvel utilisateur + RC 1 bis | **Gelé** (2026-07-11) |
| **RC 2** | Corrections tickets bloquants/majeurs uniquement | **À ouvrir** |
| RC 3 | Robustesse — cas limites | À faire |
| RC 4 | Performance | À faire |
| RC 5 | Déploiement Vercel | À faire |
| RC 6 | Bêta privée (10–20 personnes) | À faire |

## Méthode Tickets

Un ticket = **un bug ou une amélioration précise**.

Format ID : `RC-NNN`

Exemples :
- RC-014 — Le bouton « Voir la traduction » est trop éloigné de la phrase
- RC-021 — Le Reader perd sa position après un refresh

**Règle bêta** : toute nouvelle fonctionnalité doit répondre à « Est-ce qu'un bêta-testeur en a besoin pour valider Rossiyani ? » Sinon → backlog V2.

## Livrables RC 1

- [`UX_BUGLIST.md`](./UX_BUGLIST.md) — recensement uniquement, **pas de correction**
- Screenshots : [`screenshots/`](./screenshots/)

## Gel UI

Reader · Lessons · Import · Library · Home · Explorer = **gelés** (UI Freeze 5.6).  
Corrections RC = tickets ciblés, pas de redesign.
