# Import — UX V1 (maquettes & parcours)

> **Story 4.1.5** — Design avant implémentation  
> Dernière mise à jour : juillet 2026

**Gate** : cette story doit être **validée visuellement** avant Story 4.2 (code).

**Documents liés**

| Document | Rôle |
|----------|------|
| [CONCEPTION_V1.md](./CONCEPTION_V1.md) | Règles produit, limites, données |
| [STORIES.md](./STORIES.md) | Découpage technique 4.2+ |

---

## 1. Principe directeur

> L'import est une **extension naturelle du Reader**, pas un outil séparé.

| ✅ Oui | ❌ Non |
|--------|--------|
| Même typo, tokens, cartes que Library / Reader | Wizard multi-étapes type « assistant » |
| Russe en Noto Serif dès la prévisualisation | Formulaire administratif |
| CTA « Lire maintenant » aussi visible que « Enregistrer » | Upload comme feature technique mise en avant |
| Retour Bibliothèque en un clic | Modal isolé sans contexte |

**Ton** : calme, concret, tutoiement — comme le reste de Rossiyani.

---

## 2. Carte de navigation

```mermaid
flowchart LR
    LIB[Bibliothèque /library]
    IMP[/import — Saisie]
    PRE[/import/preview — Prévisualisation]
    REA[Reader /reader/id]
    LIB -->|CTA Importer| IMP
    IMP -->|Analyser OK| PRE
    IMP -->|Erreur| IMP
    PRE -->|Lire maintenant| REA
    PRE -->|Enregistrer| LIB
    PRE -->|← Modifier| IMP
    REA -->|Terminé| LIB
```

**Routes V1**

| Route | Écran |
|-------|-------|
| `/import` | Saisie (coller / .txt) |
| `/import/preview` | Prévisualisation + confirmation *(state en query ou sessionStorage — implémentation 4.5)* |
| `/library` | Collections + Mes imports |
| `/reader/[id]` | Lecture (inchangé) |

> **Décision UX** : page dédiée `/import`, pas de modal. L'utilisateur garde le contexte « je prépare une lecture ».

---

## 3. Écran `/import` — Saisie

### 3.1 Structure

```
┌──────────────────────────────────────────────────────────────┐
│  PageHeader                                                  │
│  eyebrow: IMPORTER                                           │
│  title: Importer un texte                                    │
│  subtitle: Colle un extrait russe ou charge un fichier .txt  │
│            — puis lis-le avec la méthode Rossiyani.          │
├──────────────────────────────────────────────────────────────┤
│  max-w-[680px] mx-auto  ← même colonne que Reader            │
│                                                              │
│  [ Onglet Coller ]  [ Onglet Fichier .txt ]                  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Zone principale (textarea OU dropzone)                │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Compteur: 1 240 / 15 000 mots    ·    3 / 20 textes        │
│                                                              │
│  Encart limites (discret)                                    │
│                                                              │
│  [ Analyser le texte → ]  ← CTA principal, pleine largeur   │
│                                                              │
│  ← Retour à la bibliothèque                                    │
└──────────────────────────────────────────────────────────────┘
```

### 3.2 Composants design system

| Zone | Composant / classes |
|------|---------------------|
| Header | `PageHeader` — eyebrow `IMPORTER`, titre serif |
| Conteneur | `mx-auto max-w-[680px] px-6 py-10` (aligné Reader) |
| Onglets | Style `FilterPills` — actif : `bg-accent text-white`, inactif : `border-border` |
| Textarea | `min-h-[280px]`, `font-russian text-[18px]`, `border-border rounded-[14px]`, fond `surface` |
| Dropzone | `border-dashed border-border rounded-[14px]`, icône `Upload`, hover `border-accent-border bg-accent-light/30` |
| CTA | `bg-accent text-white rounded-[10px] py-3 font-bold` — désactivé si vide ou > limite |
| Lien retour | `BackLink` → `/library` |

### 3.3 Onglet « Coller » (défaut)

**Placeholder textarea**

> Collez votre texte russe ici…  
> Extrait de cours, article, chapitre de manuel.

**Compteur temps réel** (sous la zone)

> `1 240 / 15 000 mots` — `text-xs text-ink-3`  
> Passe en `text-amber` à > 90 %, `text-destructive` si dépassement.

**Quota utilisateur** (à droite du compteur)

> `3 / 20 textes importés` — discret, `text-xs text-ink-3`

### 3.4 Onglet « Fichier .txt »

- Dropzone + bouton « Choisir un fichier »
- Accepte uniquement `.txt`, UTF-8
- Après sélection : nom du fichier + taille + contenu chargé dans le pipeline (même compteur)
- Erreur encodage : voir état §6

### 3.5 Encart limites (sous le compteur)

Carte secondaire — même logique que `LessonBridgeCard` :

```
ℹ️ Formats acceptés : copier-coller et .txt (UTF-8).
   Maximum 15 000 mots par texte. PDF et EPUB : bientôt.
```

Classes : `rounded-[12px] border border-border/70 bg-bg/40 p-4 text-[13px] text-ink-2`

### 3.6 CTA principal

| Label | État |
|-------|------|
| `Analyser le texte →` | Default |
| `Analyse en cours…` | Loading (spinner inline) |
| `Analyser le texte →` | Disabled si vide, < 30 mots, ou > 15 000 mots |

---

## 4. Écran `/import/preview` — Prévisualisation

### 4.1 Structure

```
┌──────────────────────────────────────────────────────────────┐
│  PageHeader                                                  │
│  eyebrow: PRÉVISUALISATION                                   │
│  title: Votre texte est prêt                                 │
│  subtitle: Vérifiez le découpage avant de lire.              │
├──────────────────────────────────────────────────────────────┤
│  max-w-[680px]                                               │
│                                                              │
│  ┌─ Métadonnées ─────────────────────────────────────────┐   │
│  │ Titre: [________________________]  (input)            │   │
│  │ Niveau: (A1) A2  B1  B2   ← FilterPills + badge      │   │
│  │           « Suggestion » si pré-rempli profil           │   │
│  │ Stats: 42 phrases · 890 mots · ~45 min                │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─ Aperçu phrases ──────────────────────────────────────┐   │
│  │  — Первое предложение.        (font-russian)           │   │
│  │  — Второе предложение.                                 │   │
│  │  — Третье предложение.                                 │   │
│  │    … et 39 autres phrases                              │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                              │
│  Encart méthode (discret)                                    │
│                                                              │
│  [ Enregistrer ]     [ Lire maintenant → ]  ← primaire       │
│                                                              │
│  ← Modifier le texte                                         │
└──────────────────────────────────────────────────────────────┘
```

### 4.2 Titre détecté

| Cas | Valeur pré-remplie |
|-----|-------------------|
| Première ligne < 80 car., peu de ponctuation | Première ligne trim |
| Sinon | `Mon texte` (localisé FR UI, titre stocké tel quel par l'utilisateur) |

Input : label `Titre`, obligatoire, max 120 caractères.

### 4.3 Niveau estimé

**V1 sans IA** — suggestion = `user_profiles.target_level` (défaut onboarding).

| UI | Détail |
|----|--------|
| Pills | `A1` `A2` `B1` `B2` — composant `FilterPills` |
| Badge | `Suggestion` en `text-[10px] text-ink-3` à côté du label « Niveau » |
| Copy aide | « Tu pourras le modifier plus tard. » |

> Si évolution future : heuristique longueur phrase — hors scope 4.1.5.

### 4.4 Stats (lecture seule)

Une ligne, séparateurs `·` :

> **42 phrases** · **890 mots** · **~45 min**

`text-sm text-ink-2`, chiffres en `font-semibold text-ink`.

### 4.5 Aperçu phrases

- Afficher **3 à 5** premières phrases
- Style identique au Reader : `font-russian text-[20px] leading-[1.65] text-ink`
- Pas de traduction (absente en V1)
- Ligne finale si plus de phrases : `… et 39 autres phrases` — `text-sm italic text-ink-3`

Carte : `CARD_BASE_CLASS` sans hover lift — conteneur neutre.

### 4.6 Encart méthode

```
Les traductions phrase par phrase ne sont pas générées à l'import.
Explore chaque mot pendant la lecture — comme dans tes textes Rossiyani.
```

Même style encart limites §3.5.

### 4.7 Actions

| Bouton | Style | Action |
|--------|-------|--------|
| **Lire maintenant →** | Primaire `bg-accent` | Save + redirect `/reader/[id]` |
| **Enregistrer** | Secondaire `border border-border bg-surface` | Save + redirect `/library#mes-imports` + toast |
| **← Modifier le texte** | `BackLink` | Retour `/import` avec contenu préservé |

Les deux actions principales ont **égale importance visuelle** — primaire à droite (convention Rossiyani), secondaire à gauche.

### 4.8 Toast succès (Enregistrer)

> **Texte enregistré** — Retrouvez-le dans Mes imports.

`text-green` ou toast système — 3 s, pas bloquant.

---

## 5. Bibliothèque — Mes imports

### 5.1 Structure cible `/library`

```
┌──────────────────────────────────────────────────────────────┐
│  PageHeader — Bibliothèque (inchangé)                        │
├──────────────────────────────────────────────────────────────┤
│  [ Continuer ]  ← inchangé, curated ou import en cours       │
│                                                              │
│  ── Collections Rossiyani ──────────────────────────────     │
│  SectionHeader + grille CollectionCard                       │
│                                                              │
│  ── Vos textes (curated) ───────────────────────────────     │
│  Filtres niveau + recherche + TextCard curated only          │
│                                                              │
│  ═══════════════════════════════════════════════════════     │
│  séparateur visuel fort — border-t pt-11                     │
│                                                              │
│  ── Mes imports ────────────────────────────────────────     │
│  SectionHeader: "Mes imports"                                │
│  subtitle: "Vos textes personnels — visibles par vous seul." │
│  badge: "2 / 20"                                             │
│                                                              │
│  [ ImportCard ] [ ImportTextCard ] [ ImportCard + ]        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 5.2 Règles de séparation

| Règle | Application |
|-------|-------------|
| Imports **jamais** dans la grille « Vos textes » filtrée par collection | Filtre `source !== 'imported'` |
| Imports **jamais** dans les compteurs `CollectionCard` | Compteur curated only |
| Section « Mes imports » **toujours visible** (même vide) | Ancre `#mes-imports` |
| « Continuer » peut pointer vers un import en cours | Même logique `user_progress` |

### 5.3 Carte texte importé (`ImportTextCard`)

Variante de `TextCard` :

| Élément | Curated | Importé |
|---------|---------|---------|
| Badge niveau | `bg-accent` | Identique |
| Sous-titre | Nom collection | **`Importé`** — `text-ink-3` |
| Bordure gauche | Aucune | Optionnel : `border-l-2 border-ink-3/40` |
| CTA | `Lire →` / `Continuer →` | Identique |

### 5.4 Carte « Importer » (`ImportEntryCard`)

Remplace la carte fantôme « Suggérer un texte » **dans la section Mes imports uniquement** — plus dans la grille curated.

```
┌ - - - - - - - - - - - - - - - - - ┐
│  [+]  Importer un texte            │
│       Coller ou .txt               │
└ - - - - - - - - - - - - - - - - - ┘
```

- `border-dashed`, `CARD_BASE_CLASS`
- Clic → `/import`
- Toujours **dernière** carte de la grille Mes imports

### 5.5 Entrée secondaire

Lien discret sous le header Bibliothèque (optionnel) :

> `+ Importer un texte` — `text-sm font-semibold text-accent`

---

## 6. États — catalogue complet

### 6.1 `/import` — Vide (initial)

| Élément | Comportement |
|---------|--------------|
| Textarea | Vide, placeholder visible |
| Compteur | `0 / 15 000 mots` |
| CTA | Disabled, opacité 50 % |

### 6.2 `/import` — Saisie en cours

| Élément | Comportement |
|---------|--------------|
| Compteur | Temps réel |
| CTA | Enabled si ≥ 30 mots et ≤ 15 000 |

### 6.3 `/import` — Analyse (loading)

| Élément | Comportement |
|---------|--------------|
| CTA | `Analyse en cours…` + spinner |
| Textarea | `readOnly` ou disabled |
| Durée attendue | < 2 s (client ou API) |

Pas de page intermédiaire — transition directe vers preview ou erreur inline.

### 6.4 `/import` — Erreur : texte non russe

**Emplacement** : bandeau sous la zone de saisie (pas toast).

```
⚠ Ce texte ne semble pas être en russe.
  Rossiyani importe uniquement des textes en cyrillique.
  [ Réessayer ]
```

- Fond `bg-amber/10`, bordure `border-amber/30`
- CTA reste disabled jusqu'à modification du contenu

### 6.5 `/import` — Erreur : texte trop court

```
⚠ Texte trop court — minimum 30 mots pour importer.
```

Même pattern bandeau, `text-ink-2`.

### 6.6 `/import` — Erreur : texte trop long

```
⚠ Texte trop long — maximum 15 000 mots.
  Votre texte en contient 18 420. Scindez-le en plusieurs imports.
```

Compteur en rouge. CTA disabled.

### 6.7 `/import` — Erreur : quota atteint

```
⚠ Vous avez atteint la limite de 20 textes importés.
  Supprimez un texte existant pour en ajouter un nouveau.
```

Lien → `#mes-imports`. CTA disabled.

### 6.8 `/import` — Erreur : fichier .txt invalide

```
⚠ Impossible de lire ce fichier. Utilisez un fichier .txt en UTF-8.
```

### 6.9 `/import/preview` — Succès (implicite)

Pas d'écran dédié — redirection immédiate vers Library ou Reader.

### 6.10 `/library` — Mes imports vide

```
┌ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ┐
│                                                             │
│     Aucun texte importé pour l'instant.                      │
│     Collez un extrait de cours, d'article ou de manuel.     │
│                                                             │
│     [ Importer mon premier texte → ]                        │
│                                                             │
└ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ┘
```

- Zone centrée, `text-ink-2`, pas de grille vide bizarre
- CTA primaire vers `/import`

### 6.11 Reader — Premier mot sur import (info optionnelle 4.7)

Bandeau **une seule fois** (localStorage) en tête du texte :

```
💡 Pas de traduction ? Cliquez sur un mot pour l'explorer.
```

Dismissible. Hors scope maquette détaillée — noté pour 4.7.

---

## 7. Responsive

| Breakpoint | Adaptation |
|------------|------------|
| Mobile | Onglets pleine largeur ; CTA pleine largeur ; preview : boutons empilés (Lire au-dessus) |
| Desktop | `max-w-[680px]` centré ; boutons côte à côte |

Explorer / Reader : aucun changement import.

---

## 8. Accessibilité

| Point | Règle |
|-------|-------|
| Onglets | `role="tablist"`, `aria-selected` |
| Dropzone | `aria-label="Importer un fichier texte"` |
| Erreurs | `role="alert"`, associées au champ via `aria-describedby` |
| CTA disabled | `aria-disabled` + raison dans texte proche |
| Contraste | Tokens Rossiyani existants (ink sur surface) |

---

## 9. Checklist de validation (Story 4.1.5)

Cocher **visuellement** (maquettes Figma, sketch, ou prototype) avant Story 4.2 :

- [ ] Écran `/import` — hero, onglets, textarea, dropzone, limites, CTA
- [ ] Écran `/import/preview` — titre, niveau, stats, aperçu, deux CTAs
- [ ] Bibliothèque — séparation Collections / Vos textes / Mes imports
- [ ] Carte `ImportTextCard` + `ImportEntryCard`
- [ ] État vide Mes imports
- [ ] État analyse (loading)
- [ ] Erreur non-russe
- [ ] Erreur trop long / trop court
- [ ] Erreur quota
- [ ] Parcours complet skippé : Library → Import → Preview → Reader → Library
- [ ] Ressenti « extension du Reader » validé par le fondateur

**Signature** : ___ / date ___ → débloque Story 4.2

---

## 10. Mapping implémentation (référence 4.5 / 4.6)

| Maquette UX | Composant futur |
|-------------|-----------------|
| Page import saisie | `src/app/(app)/import/page.tsx` |
| Page preview | `src/app/(app)/import/preview/page.tsx` |
| Onglets coller/fichier | `ImportSourceTabs.tsx` |
| Bandeaux erreur | `ImportErrorBanner.tsx` |
| Section Mes imports | `LibraryImportsSection.tsx` |
| Carte import | `ImportTextCard.tsx` |
| Carte + importer | `ImportEntryCard.tsx` |

---

## 11. Roadmap après import (rappel fondateur)

Une fois Stories **4.2 → 4.7** terminées :

➡️ **Phase C** — branding unifié + polish UI  
➡️ Audit final + préparation bêta

L'import précède le polish global : les écrans import seront **refinés en Phase C**, pas avant.

---

## Références design existantes

| Référence | Fichier |
|-----------|---------|
| Header pages | `src/components/ui/PageHeader.tsx` |
| Cartes bibliothèque | `src/components/library/TextCard.tsx` |
| Filtres | `src/components/ui/FilterPills.tsx` |
| Cartes secondaires | `src/components/lessons/LessonBridgeCard.tsx` |
| Colonne Reader | `max-w-[680px]` dans `ReaderContainer.tsx` |
| Tokens | `src/app/globals.css` |
