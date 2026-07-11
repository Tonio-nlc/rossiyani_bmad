# Reader — Charte éditoriale Rossiyani

> **Document de référence officiel** — Story 3.1  
> Dernière mise à jour : juillet 2026

Ce document définit ce qu'est un **texte Rossiyani** : thèmes, niveaux, structure, règles et collections V1.

Tout nouveau texte du Reader doit respecter cette charte.  
Alignement méthode : [METHODE_ROSSIYANI.md](../METHODE_ROSSIYANI.md) — le texte sert l'étape **Lire**.

**Documents liés**

| Document | Rôle |
|----------|------|
| [templates/text.template.json](./templates/text.template.json) | Template rédaction |
| [CHECKLIST.md](./CHECKLIST.md) | Validation avant publication |
| [lessons/PIPELINE.md](../lessons/PIPELINE.md) | Pipeline leçons (phénomènes rencontrés en lecture) |

---

## 1. Identité éditoriale

Un texte Rossiyani n'est **pas** :

- un exercice de grammaire déguisé ;
- un dialogue de manuel ;
- une liste de vocabulaire en phrases ;
- un extrait littéraire non adapté.

Un texte Rossiyani **est** :

- une micro-scène de la vie réelle (ou crédible) ;
- racontée en russe authentique mais contrôlé ;
- calibrée pour qu'un mot inconnu puisse être **exploré** dans son contexte ;
- écrite pour donner envie de **relire** le suivant.

**Test d'identité** : l'utilisateur doit avoir l'impression d'assister à un moment de vie, pas de remplir une fiche.

---

## 2. Thèmes autorisés (V1)

Les textes V1 se situent dans le **quotidien accessible** d'un apprenant francophone qui découvre le russe. Situations concrètes, personnages récurrents possibles, monde reconnaissable.

### 2.1 Thèmes prioritaires

| Thème | Exemples de situations | Collection(s) |
|-------|------------------------|---------------|
| **Transports** | métro, bus, taxi, gare, billet | Everyday Russian, Around the City |
| **Café & repas** | café, cantine, cuisine, restaurant simple | Everyday Russian |
| **Université & études** | cours, bibliothèque, coloc, examens | Student Life |
| **Travail** | bureau, pause, collègues, trajet domicile-travail | Everyday Russian |
| **Courses** | supermarché, marché, liste, caisse | Everyday Russian |
| **Famille** | parents, enfants, appel, week-end | Everyday Russian, Daily Conversations |
| **Maison** | appartement, voisinage, soirée, rangement | Everyday Russian |
| **Météo & saisons** | pluie, neige, chaleur, vêtements | Everyday Russian |
| **Démarches simples** | banque basique, rendez-vous, formulaire | Around the City |
| **Voyages** | hôtel, aéroport, demander son chemin | Around the City |
| **Ville** | parc, rue, magasins, orientation | Around the City |
| **Conversations courantes** | salutations, petites talk, SMS oraux | Daily Conversations |
| **Culture douce** | fêtes, habitudes, politesse, repas festif | Russian Culture |

### 2.2 Thèmes autorisés avec prudence

Acceptables **si** traités avec simplicité et sans controverse :

- sport grand public (foot, patinoire) ;
- animaux domestiques ;
- technologie du quotidien (téléphone, application) ;
- nostalgie / souvenir personnel (narration A2+) ;
- opinion simple (B1 : « мне нравится… »).

### 2.3 Thèmes interdits (V1)

| Catégorie | Exemples | Raison |
|-----------|----------|--------|
| **Politique & conflits** | élections, guerre, propagande, manifeste | Hors méthode — détourne la lecture |
| **Actualité brûlante** | news du jour, polémiques | Obsolescence + charge émotionnelle |
| **Religion & idéologie** | débats doctrinaux, prosélytisme | Hors scope pédagogique V1 |
| **Contenu adulte** | violence graphique, sexualité explicite | Public apprenant large |
| **Humour opaque** | blagues culturelles incompréhensibles sans note | Bloque la compréhension |
| **Littérature classique brute** | extraits Tolstoï, Dostoïevski non adaptés | Niveau + longueur inadaptés V1 |
| **Argot & vulgarité** | mat, jargon criminel | V1 — registre neutre/courant |
| **Textes « leçon »** | phrases fabriquées pour une règle | Viole l'identité Rossiyani |
| **Stéréotypes** | caricatures nationales | Crédibilité & respect |
| **Fantasy / SF** | univers fictifs | Éloigne du russe vécu |

---

## 3. Progression par niveau

Chaque texte introduit **une seule difficulté linguistique nouvelle** (i+1). Le reste doit être déjà rencontré ou transparent grâce à la traduction phrase par phrase.

### A1 — Premiers pas en lecture

| Critère | Règle |
|---------|-------|
| **Phrases** | 8–12 phrases, majoritairement courtes (5–12 mots) |
| **Temps** | Présent de l'indicatif dominant ; passé composé/imparfait simple occasionnel (1–2 phrases max) |
| **Vocabulaire** | Top 500–800 mots ; noms concrets, verbes de mouvement et d'action |
| **Syntaxe** | SVO simple ; une proposition par phrase |
| **Phénomène cible** | 1 seul (ex. : direction avec *в + accusatif*, présent 3e personne, négation) |
| **Personnages** | 1–2 personnages max, prénoms russes courants (Анна, Саша, Маша, Иван, Олег) |
| **Durée lecture** | 2–4 minutes |
| **Traduction** | Obligatoire phrase par phrase (`content_annotated.sentences`) |

**Référence** : les 5 textes seed (`008_seed_library_texts.sql`) — métro, trajet, café, magasin, soirée.

### A2 — Récits du quotidien enrichi

| Critère | Règle |
|---------|-------|
| **Phrases** | 10–15 phrases ; longueur mixte |
| **Temps** | Passé (imparfait, parfait) + présent ; futur simple occasionnel |
| **Vocabulaire** | Réutilisation volontaire des textes A1 (30 % minimum) |
| **Syntaxe** | Coordination (*и*, *но*, *потом*) ; subordonnée simple (*когда*, *потому что*) |
| **Phénomène cible** | 1–2 (ex. : accord adjectif, datif recipient, aspect perfectif simple) |
| **Narration** | Petite arc : situation → événement → conclusion |
| **Durée lecture** | 4–6 minutes |

### B1 — Opinions et narration fluide

| Critère | Règle |
|---------|-------|
| **Phrases** | 12–18 phrases ; dialogues intégrés possibles |
| **Temps** | Concordance des temps ; conditionnel simple |
| **Vocabulaire** | Abstractions modérées (мнение, план, проблема) |
| **Syntaxe** | Propositions relatives ; connecteurs (*однако*, *поэтому*) |
| **Phénomène cible** | 2 max (ex. : génitif partitif, comparaison, concessif) |
| **Registre** | Courant à soutenu léger — pas littéraire |
| **Durée lecture** | 6–10 minutes |

### B2+ — Hors production V1

Pas de textes B2/C1 en V1. La collection *Slow News* et la littérature longue sont **reportées**.

---

## 4. Structure d'un texte

### 4.1 Champs obligatoires (base de données)

| Champ | Règle |
|-------|-------|
| `title` | Titre en **russe**, court (2–4 mots), évocateur — pas descriptif scolaire |
| `content` | Texte russe complet, une phrase = un segment logique |
| `content_annotated` | JSON : `sentences[]` avec `text` + `translationFr` |
| `level` | `A1` \| `A2` \| `B1` |
| `collection` | Slug collection V1 (voir §6) |
| `word_count` | Nombre de mots russes |
| `reading_time_minutes` | Estimation (≈ 20 mots/minute A1) |

### 4.2 Structure narrative (contenu)

Chaque texte suit cette progression logique :

```
1. TITRE          — accroche russe (ex. « В метро », « Первый кофе »)
2. CONTEXTE       — 1–2 phrases : qui, où, quand
3. DÉVELOPPEMENT  — 5–10 phrases : action, détail, petit événement
4. TOURNANT       — 1 phrase optionnelle : surprise, échange, détail humain
5. FIN            — 1–2 phrases : conclusion naturelle (pas moralisatrice)
6. OUVERTURE      — option A1 : question au lecteur (« А ты…? ») — 1 phrase max
```

**Longueur cible** : 8–15 phrases selon niveau (voir §3).

### 4.3 Accents toniques

- Format **NFC** avec U+0301 (`о́`, `а́`, `е́`…) dans `content` et chaque `sentences[].text`.
- Cohérent avec les leçons et le Reader (`LessonExampleSentence`, affichage texte).

### 4.4 Traductions

- Français naturel, registre courant.
- Une traduction par phrase — pas mot à mot.
- Apostrophes SQL doublées dans les migrations (`''`).

---

## 5. Règles Rossiyani (non négociables)

Chaque texte **doit** :

1. **Raconter quelque chose** — action ou scène, pas énumération.
2. **Être crédible** — comportements et lieux réalistes pour la Russie contemporaine.
3. **Introduire volontairement 1 phénomène linguistique** — repérable par l'Explorer ; documenté en interne (fiche rédaction, pas en DB V1).
4. **Réutiliser du vocabulaire déjà rencontré** — surtout à partir d'A2 ; créer une toile de mots familiers (метро, работа, кофе, магазин…).
5. **Ne jamais ressembler à un exercice** — pas de phrases isolées sans lien ; pas de « Мужчина читает газету » répété trois fois pour trois cas.

Chaque texte **ne doit pas** :

- nommer explicitement un cas grammatical (« ici c'est l'accusatif ») ;
- lister du vocabulaire sans situation ;
- utiliser des noms propres obscurs sans contexte ;
- finir par une leçon de morale explicite ;
- dépendre d'une leçon lue au préalable (principe méthode : lecture d'abord).

### Lien avec les Lessons

Le phénomène linguistique ciblé **peut** avoir une leçon associée — mais le texte reste compréhensible sans elle grâce à la traduction. La leçon approfondit après la rencontre, jamais avant.

### Personnages récurrents et fil narratif (recommandé)

**Анна** et **Луи** forment le fil principal V1 : l'utilisateur les accompagne dans leur quotidien étudiant. Les autres prénoms des textes seed (**Саша**, **Маша**, **Иван**, **Олег**) coexistent comme moments parallèles du même univers.

> **Chaque texte prépare le suivant** — continuité de vie, pas cliffhanger artificiel. Exemple du fil : `Знакомство` → `Первый день в университете` → `В булочной` → `Как найти дорогу?` → …

Voir le plan détaillé : [BIBLIOTHEQUE_V1_GOLD_10.md](./content/BIBLIOTHEQUE_V1_GOLD_10.md).

---

## 6. Collections V1 officielles

Cinq collections pour la phase de production. Chacune a une identité éditoriale distincte.

| # | Collection (nom public) | Slug `collection` | Niveau | Identité | Statut juillet 2026 |
|---|-------------------------|-------------------|--------|----------|---------------------|
| 1 | **Everyday Russian** | `everyday_russian` | A1–A2 | Vie quotidienne : maison, travail, repas, transports | **Active** — 5 textes |
| 2 | **Student Life** | `student_life` | A1–A2 | Études, campus, coloc, examens, vie de jeune adulte | À créer *(slug nouveau)* |
| 3 | **Around the City** | `around_the_city` | A1–B1 | Ville, orientation, magasins, démarches, voyage urbain | À créer *(remplace `travel` éditorialement)* |
| 4 | **Daily Conversations** | `daily_conversations` | A1–B1 | Échanges courts, dialogues naturels, registre parlé | À créer *(évolution de `dialogues`)* |
| 5 | **Russian Culture** | `culture` | A1–B1 | Coutumes, fêtes, habitudes, contexte culturel doux | **Active** — 0 texte |

### Collections reportées (pas de production V1)

| Collection | Slug actuel | Reportée car |
|------------|-------------|--------------|
| Russian Stories | `stories` | Narration longue — batch A2/B1 phase 2 |
| Slow News | `slow_news` | Actualité — interdit thématique V1 |
| Travel Russian | `travel` | Fusionnée éditorialement dans *Around the City* |
| Dialogues | `dialogues` | Fusionnée éditorialement dans *Daily Conversations* |

> **Note technique** : les slugs `student_life`, `around_the_city`, `daily_conversations` seront ajoutés à `collections.ts` lors de la première story de production contenu. Jusqu'alors, la charte fait foi pour la rédaction.

### Objectifs quantitatifs V1 (indicatif)

| Collection | Cible V1 |
|------------|----------|
| Everyday Russian | 15–20 textes (A1 majoritaire) |
| Student Life | 10–12 textes |
| Around the City | 10–12 textes |
| Daily Conversations | 8–10 textes |
| Russian Culture | 6–8 textes |

**Total visé** : 50–60 textes pour une bêta convaincante.

---

## 7. Workflow de production

```
1. Choisir collection + niveau + thème autorisé
        ↓
2. Définir le phénomène linguistique cible (1 par texte A1)
        ↓
3. Rédiger dans text.template.json
        ↓
4. Valider avec CHECKLIST.md
        ↓
5. Transposer en migration SQL (format 008_seed_library_texts.sql)
        ↓
6. Vérifier rendu Reader + Explorer sur phénomène cible
        ↓
7. Commit + db push
```

---

## 8. Test d'acceptation (nouveau texte)

Un texte est validé si :

- [ ] Thème autorisé V1, pas de thème interdit
- [ ] Niveau conforme (§3)
- [ ] Structure narrative (§4.2)
- [ ] 8–15 phrases selon niveau
- [ ] Accents toniques NFC
- [ ] Traductions phrase par phrase
- [ ] 1 phénomène linguistique identifié (documenté en interne)
- [ ] Réutilisation vocabulaire si A2+
- [ ] Ne ressemble pas à un exercice scolaire
- [ ] Collection V1 officielle (§6)

---

## Maintenance

Mettre à jour cette charte quand :

- une collection V1 est activée ou retirée ;
- les critères de niveau évoluent ;
- un thème est réévalué (autorisé ↔ interdit).

Ne pas dupliquer dans le PRD — renvoi depuis [docs/README.md](../README.md).
