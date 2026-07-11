# Bibliothèque V1 — Les 10 textes gold standard

> Story 3.2 — Référence de production  
> Dernière mise à jour : juillet 2026

Ces 10 textes définissent la **voix Rossiyani**. Les 40 suivants s'aligneront sur eux.

### Fil conducteur (Anna & Louis)

Bibliothèque V1 = **continuité narrative légère**, pas un roman.

| Personnage | Profil |
|------------|--------|
| **Анна** | Étudiante russe, Moscou — déjà présente dans `В метро` |
| **Луи** | Étudiant français — introduit dans `Знакомство` (#5) |

### Chaque texte prépare le suivant

> **Continuité de vie**, pas cliffhanger artificiel. L'utilisateur accompagne Anna et Louis dans leur quotidien.

**Fil narratif principal (Anna & Louis)** :

```
Знакомство (#5)
    ↓
Первый день в университете (#1)
    ↓
В булочной (#2)
    ↓
Как найти дорогу? (#9)
    ↓
У врача (#8) ✅
    ↓
Обычный день студента (#10) ✅
```

Les textes 3, 4, 6, 7 (008) coexistent comme **moments parallèles** du même univers — pas dans la chronologie stricte du fil.

### Textes → Leçons (principe V1)

Chaque nouveau texte **introduit naturellement** des phénomènes que les leçons expliqueront ensuite — sans les nommer. La lecture précède toujours l'explication ([METHODE_ROSSIYANI.md](../../METHODE_ROSSIYANI.md)).

### Un texte = un phénomène principal

> **Un seul « déclic » pédagogique par texte.** D'autres structures peuvent apparaître, mais un phénomène domine — celui que la future leçon expliquera.

| Texte | Phénomène principal | Leçon semée |
|-------|---------------------|-------------|
| `Знакомство` (#5) | *звать* / présentations | être implicite, nationalités |
| `Первый день в университете` (#1) | *в + accusatif* (mouvement) | *в аудитории* (position) |
| `В булочной` (#2) | **accusatif objet direct** (*купить хлеб*) | pourquoi l'objet change de forme |
| `Как найти дорогу?` (#9) | **mouvement + directions** | où ? / прямо / направо / слева |
| `У врача` (#8) | **exprimer un état** (*болит горло*, *чувствовать себя*) | У меня болит… / expressions d'état |
| `Обычный день студента` (#10) | **consolidation** (aucune notion nouvelle) | — sensation de progression |

**Workflow** : tu rédiges le contenu → Cursor intègre JSON/SQL → validation Reader.  
Voir [WORKFLOW_PRODUCTION.md](./WORKFLOW_PRODUCTION.md).

---

## Vue d'ensemble

| # | Situation | Titre russe (cible) | Collection *(slug DB)* | Statut |
|---|-----------|---------------------|------------------------|--------|
| 1 | Premier jour à l'université | `Первый день в университете` | `everyday_russian` * | ✅ intégré (011) |
| 2 | Acheter du pain à la boulangerie | `В булочной` | `everyday_russian` | ✅ intégré (012) |
| 3 | Prendre le métro | `В метро` | `everyday_russian` | ✅ intégré (008) |
| 4 | Commander un café | `Первый кофе` | `everyday_russian` | ✅ intégré (008) |
| 5 | Se présenter | `Знакомство` | `dialogues` * | ✅ intégré (010) |
| 6 | Faire les courses | `В магазине` | `everyday_russian` | ✅ intégré (008) |
| 7 | À la maison le soir | `Дома вечером` | `everyday_russian` | ✅ intégré (008) |
| 8 | Aller chez le médecin | `У врача` | `everyday_russian` | ✅ intégré (014) |
| 9 | Demander son chemin | `Как найти дорогу?` | `travel` * | ✅ intégré (013) |
| 10 | Une journée d'étudiant | `Обычный день студента` | `everyday_russian` * | ✅ intégré (015) |

\* Slug technique existant en base. Les slugs charte (`student_life`, `around_the_city`, `daily_conversations`) seront mappés lors d'une micro-mise à jour Library — hors scope Story 3.2.

**Hors gold 10** : `По дороге` (008) reste en bibliothèque comme texte complémentaire A1.

---

## Fiche par texte

### 1 — Premier jour à l'université ✅

| Champ | Valeur |
|-------|--------|
| **Phénomène cible** | Mouvement *в + accusatif* ; salutations ; vocabulaire université |
| **Leçons semées** | *в университет* vs *в университете* ; *в аудитории* ; *идти/приходить/входить* |
| **Personnages** | Анна + Луи (lendemain de `Знакомство`) |
| **Vocabulaire nouveau** | университет, урок, русский язык, аудитория, преподаватель, садиться, тетрадь, писать, трудный, интересный |
| **Fichier** | `texts/01-pervyy-den-universitet.json` |
| **Migration** | `011_library_gold_01_pervyy-den.sql` |

---

### 2 — Acheter du pain à la boulangerie ✅

| Champ | Valeur |
|-------|--------|
| **Phénomène principal** | Accusatif objet direct — *купить хлеб* |
| **Personnages** | Анна + Луи (après cours) |
| **Vocabulaire nouveau** | булочная, хлеб, молоко, купить, продавец, платить, карта, спасибо, пожалуйста, до свидания |
| **Fichier** | `texts/02-v-bulochnoy.json` |
| **Migration** | `012_library_gold_02_bulochnoy.sql` |
| **Relecture** | Phrase 12 corrigée : *Они выходят… и идут домой* |

---

### 3 — Prendre le métro ✅

| Champ | Valeur |
|-------|--------|
| **Phénomène cible** | Direction *в + accusatif* ; comportement social (céder sa place) |
| **Vocabulaire** | метро, вагон, станция, место |
| **Migration** | `008_seed_library_texts.sql` |

---

### 4 — Commander un café ✅

| Champ | Valeur |
|-------|--------|
| **Phénomène cible** | Routine présent 3e personne ; *каждое утро* ; lieu *на кухне* |
| **Vocabulaire** | кофе, кухня, чашка |
| **Migration** | `008_seed_library_texts.sql` |

---

### 5 — Se présenter ✅

| Champ | Valeur |
|-------|--------|
| **Phénomène cible** | *звать*, présentations simples, verbe *être* implicite |
| **Personnages** | Анна + Луи (première rencontre) |
| **Vocabulaire nouveau** | звать, приятно, тоже, француз, русская, Москва, говорить, изучать, тогда, удача |
| **Fichier** | `texts/05-znakomstvo.json` |
| **Migration** | `010_library_gold_05_znakomstvo.sql` |

---

### 6 — Faire les courses ✅

| Champ | Valeur |
|-------|--------|
| **Phénomène cible** | *нужен + nom* ; lieu *в магазине* |
| **Migration** | `008_seed_library_texts.sql` |

---

### 7 — À la maison le soir ✅

| Champ | Valeur |
|-------|--------|
| **Phénomène cible** | Séquence soirée ; *приходит домой* ; *ложится спать* |
| **Migration** | `008_seed_library_texts.sql` |

---

### 8 — Aller chez le médecin ✅

| Champ | Valeur |
|-------|--------|
| **Phénomène principal** | Exprimer un état (*болит горло*, *чувствовать себя*) |
| **Personnages** | Анна + Луи (lendemain de `Как найти дорогу?`) |
| **Prépare** | `Обычный день студента` (#10) |
| **Vocabulaire nouveau** | врач, горло, голова, болеть, чувствовать себя, случиться, отдыхать, вода, серьёзный, осматривать |
| **Fichier** | `texts/08-u-vracha.json` |
| **Migration** | `014_library_gold_08_u-vracha.sql` |
| **Relecture** | Phrase 10 corrigée : *пить больше воды* (pas *большой воды*) |

---

### 9 — Demander son chemin ✅

| Champ | Valeur |
|-------|--------|
| **Phénomène principal** | Mouvement + indications de direction |
| **Personnages** | Луи + Анна (après `В булочной`) |
| **Prépare** | `У врача` (#8) |
| **Vocabulaire nouveau** | библиотека, прохожий, прямо, направо, слева, найти, дорога, ждать, внутри, не за что |
| **Fichier** | `texts/09-kak-nayti-dorogu.json` |
| **Migration** | `013_library_gold_09_kak-nayti-dorogu.sql` |

---

### 10 — Une journée d'étudiant ✅

| Champ | Valeur |
|-------|--------|
| **Phénomène principal** | **Consolidation** — aucune nouvelle notion majeure |
| **Personnages** | Анна + Луи (quelques semaines après le fil) |
| **Vocabulaire nouveau** | каждое утро, иногда, прогресс, начало — tout le reste recyclé |
| **Réutilise** | кофе, хлеб, университет, кафе, дорога, русский язык, Anna, verbes du fil |
| **Rôle** | Conclusion de la première séquence — donner confiance, pas enseigner |
| **Fichier** | `texts/10-obychnyy-den-studenta.json` |
| **Migration** | `015_library_gold_10_obychnyy-den-studenta.sql` |

---

## Cohérence éditoriale (gold 10)

| Règle | Application |
|-------|-------------|
| **Un seul auteur** | Même registre, mêmes prénoms récurrents, même ton calme et concret |
| **Progression i+1** | 1 phénomène nouveau par texte A1 |
| **Réutilisation** | #10 recycle volontairement кофе, хлеб, университет, кафе, дорога… |
| **Consolidation** | #10 ne doit pas enseigner — il doit donner confiance |
| **Pas d'exercice** | Chaque texte = micro-scène |
| **Continuité** | Chaque texte du fil prépare naturellement le suivant |
| **Question finale** | Optionnelle, max 1 phrase (*А ты…?*) — comme #3 |

---

## Ordre de production recommandé

```
✅ #5 → #1 → #2 → #9 → #8 → #10 (fil Anna & Louis — complet)
```

**Gold 10 terminé.** Prochaine phase : production des 40 textes suivants alignés sur cette voix.
