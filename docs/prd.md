# Rossiyani — Product Requirements Document (PRD)
## Document BMAD — Référence features complète
### Version 1.1 — Juillet 2026

---

## État d'implémentation

> Dernière mise à jour : juillet 2026 — reflète l'état réel du code.

| Epic / Module | Statut | Notes |
|---------------|--------|-------|
| Epic 1 — Reader | ✅ Implémenté | Texte annoté, ExplorerPanel, orchestrateur + cache |
| Epic 2 — Library | ✅ Implémenté | Collections, filtres, progression |
| Epic 3 — Vocabulary | ✅ Implémenté (basique) | Liste, fiche, Knowledge Layer |
| Epic 4 — Auth | ✅ Implémenté | Login, register, middleware, RLS |
| Epic 5 — Onboarding | ⏳ Placeholder uniquement | Page présente, flux incomplet |
| Epic 6 — Practice | ⏳ Non implémenté | Composants stub |
| Epic 7 — SRS | ✅ Implémenté | Queue, session, ratings, SM-2 |
| Epic 8 — Lessons | ⏳ Non implémenté | Page placeholder |
| Knowledge Layer | ✅ Implémenté | Non prévu initialement — `linguistic_knowledge` |
| Review Queue / Session | ✅ Implémenté | Non prévu initialement — `/review`, `/review/session` |

---

## Comment utiliser ce document

Ce document décrit TOUTES les features de Rossiyani avec leurs comportements attendus
et leurs critères d'acceptation. Cursor le consulte quand il a un doute sur
ce qu'une feature doit faire. Il ne contient pas de code — seulement du comportement.

---

## Epic 1 — Reader (priorité P0)

### Feature 1.1 — Affichage du texte russe annoté

**Ce que ça fait :**
Affiche un texte russe avec les accents toniques, découpé en phrases.
Les terminaisons des mots sont colorées selon leur rôle fonctionnel dans la phrase.

**Comportement détaillé :**
- Le texte est affiché phrase par phrase (une <Sentence> par unité sémantique)
- Chaque mot est un composant <Word> cliquable
- La terminaison du mot est colorée (pas le mot entier — seulement le suffixe)
- Le radical reste en texte normal (couleur neutre)
- Les accents toniques sont toujours affichés (да́нные, не́бо...)
- La taille de police du texte russe est minimum 24px
- La police du texte russe est sérif (PT Serif ou Georgia)
- En dessous de chaque phrase : un lien "Voir la traduction →" (collapsed par défaut)

**Critères d'acceptation :**
- [ ] Un texte s'affiche correctement avec ses phrases séparées
- [ ] Les mots sont cliquables individuellement
- [ ] Les terminaisons colorées sont visibles distinctement du radical
- [ ] Les accents toniques apparaissent sur le texte
- [ ] La traduction d'une phrase se toggle au clic sans recharger la page

---

### Feature 1.2 — Clic sur un mot → ExplorerPanel

**Ce que ça fait :**
Quand l'utilisateur clique sur un mot, un panneau s'ouvre avec l'explication
contextuelle du mot dans sa phrase. C'est le cœur de la méthode Rossiyani.

**Comportement détaillé :**
- Clic sur un mot → appel POST /api/word/explain avec { surface, sentence, textId }
- Pendant le chargement : skeleton loader dans l'ExplorerPanel (pas de spinner)
- L'ExplorerPanel affiche dans cet ordre :
  1. Le mot en grand (surface) + le lemme en petit en dessous
  2. La traduction française
  3. L'explication contextuelle (réponse à "pourquoi cette forme dans cette phrase")
  4. La terminaison mise en évidence + son explication courte
  5. Bouton "Sauvegarder ce mot" (toujours visible, sans scroll)
- Desktop : ExplorerPanel est un panneau fixe à droite (340px)
- Mobile : ExplorerPanel est un drawer qui slide depuis le bas (60% hauteur écran)
- Fermer l'ExplorerPanel : clic ailleurs dans le texte ou bouton ✕

**Ce que l'ExplorerPanel NE fait PAS en v1 :**
- Pas de conjugaison complète
- Pas de tableau de déclinaison
- Pas de liens vers d'autres textes
- Pas d'audio (prévu v2)

**Critères d'acceptation :**
- [ ] Clic sur un mot ouvre l'ExplorerPanel avec skeleton pendant le chargement
- [ ] L'explication répond bien à "pourquoi ce mot a cette forme dans cette phrase"
- [ ] Le bouton "Sauvegarder" est visible sans scroller dans le panel
- [ ] Sur mobile le drawer slide correctement depuis le bas
- [ ] Clic en dehors du panel le ferme

---

### Feature 1.3 — Sauvegarde d'un mot dans Vocabulary

**Ce que ça fait :**
Depuis l'ExplorerPanel, l'utilisateur sauvegarde un mot dans son Vocabulary
avec le contexte de découverte (phrase + texte source).

**Comportement détaillé :**
- Clic "Sauvegarder ce mot" → POST /api/vocabulary avec { lemmaId, explanationCacheId, textId }
- Le bouton change d'état immédiatement (optimistic update) : devient "Sauvegardé ✓"
- Si le mot est déjà sauvegardé : le bouton affiche "Sauvegardé ✓" dès l'ouverture du panel
- La sauvegarde crée aussi une entrée srs_reviews avec next_review_at = maintenant + 1 jour

**Critères d'acceptation :**
- [ ] Le mot est sauvegardé avec son explication et son contexte (phrase + texte)
- [ ] L'état du bouton change immédiatement (pas d'attente réseau visible)
- [ ] Un mot déjà sauvegardé affiche "Sauvegardé ✓" sans recliquer
- [ ] Une entrée SRS est créée automatiquement

---

### Feature 1.4 — Progression de lecture

**Ce que ça fait :**
Suit la progression de l'utilisateur dans le texte et la persiste en base.

**Comportement détaillé :**
- La progression est calculée en % de phrases lues (scroll position)
- Mise à jour toutes les 10 secondes si la page est active (pas à chaque scroll)
- POST /api/progress avec { textId, percentRead, lastSentenceIndex }
- Une barre de progression est visible en haut du Reader
- Quand percent_read atteint 100% : afficher l'écran "Lecture terminée"
  avec 4 options : Continuer la lecture / Pratiquer le vocabulaire /
  Ouvrir l'Explorer / Retourner à la bibliothèque

**Critères d'acceptation :**
- [ ] La barre de progression reflète la position dans le texte
- [ ] La progression est sauvegardée et restaurée à la reconnexion
- [ ] L'écran "Lecture terminée" apparaît à 100%
- [ ] Les 4 options de l'écran de fin fonctionnent

---

## Epic 2 — Library (priorité P0)

### Feature 2.1 — Liste des textes

**Ce que ça fait :**
Affiche tous les textes disponibles, filtrables par niveau et collection.

**Comportement détaillé :**
- Filtres : Tous / A1 / A2 / B1 / B2 (pills horizontaux)
- Recherche par titre (input texte, filtre local — pas de requête API)
- Chaque texte : titre en russe, collection, niveau, durée, nombre de mots,
  progression (barre + %) si déjà commencé
- Tri par défaut : textes en cours d'abord, puis par niveau croissant
- Une carte "Suggérer un texte" toujours présente en dernière position

**Critères d'acceptation :**
- [ ] Les filtres par niveau fonctionnent
- [ ] La recherche filtre les résultats en temps réel
- [ ] Les textes en cours affichent leur progression
- [ ] La carte "Suggérer un texte" est toujours visible

---

### Feature 2.2 — Collections

**Ce que ça fait :**
Regroupe les textes par thème avec une page de présentation par collection.

**Collections disponibles en v1 :**
- Everyday Russian (A1) — vie quotidienne
- Russian Stories (A1-A2) — contes et nouvelles
- Dialogues (A1-B1) — conversations
- Slow News (B1-B2) — actualités simplifiées
- Travel Russian (A2-B1) — voyages
- Russian Culture (tous niveaux) — culture

**Comportement détaillé :**
- Page collection : nom, description, niveau(x), liste des textes
- Depuis la Home : les 3 premières collections en cards horizontales
- Progression globale de la collection visible (X textes lus / Y total)

**Critères d'acceptation :**
- [ ] Chaque collection a sa page avec ses textes listés
- [ ] La progression de collection est calculée et affichée
- [ ] Navigation collection → texte → Reader fonctionne

---

## Epic 3 — Vocabulary (priorité P1)

### Feature 3.1 — Liste des mots sauvegardés

**Ce que ça fait :**
Affiche tous les mots sauvegardés par l'utilisateur sous forme de fiches.

**Comportement détaillé :**
- 3 onglets : Mots / Expressions / Phrases (Expressions et Phrases = v2, désactivés en v1)
- Chaque fiche affiche :
  - Le mot en russe (surface avec accent tonique) + icône audio (désactivée v1)
  - La traduction française
  - Lemme, catégorie grammaticale, niveau CECR estimé
  - L'explication contextuelle de découverte
  - La phrase d'exemple (celle du texte où le mot a été rencontré)
  - Lien "Voir dans le texte →" qui rouvre le Reader à la bonne position
  - Tags : catégorie / niveau / cas fonctionnels rencontrés
- Tri par défaut : date de sauvegarde (plus récent en premier)

**Critères d'acceptation :**
- [ ] Tous les mots sauvegardés apparaissent avec leur fiche complète
- [ ] La phrase d'exemple est toujours celle du contexte de découverte
- [ ] "Voir dans le texte" rouvre le Reader au bon endroit
- [ ] Les onglets Expressions et Phrases sont visibles mais désactivés

---

## Epic 4 — Authentification (priorité P0)

### Feature 4.1 — Inscription / Connexion

**Ce que ça fait :**
Permet à un utilisateur de créer un compte et de se connecter.

**Comportement détaillé :**
- Inscription : email + mot de passe + nom d'affichage
- Connexion : email + mot de passe
- Magic link optionnel (Supabase natif)
- Après inscription : redirection vers l'onboarding
- Après connexion : redirection vers la Home
- Session persistante (pas de déconnexion au refresh)

**Critères d'acceptation :**
- [ ] Inscription crée un compte Supabase Auth + un user_profile
- [ ] Connexion restaure la session et redirige vers Home
- [ ] Les pages (app) sont protégées — redirect vers /login si non connecté
- [ ] La session persiste après refresh de page

---

## Epic 5 — Onboarding (priorité P1)

### Feature 5.1 — Flux d'onboarding 5 écrans

**Ce que ça fait :**
Introduit la méthode Rossiyani en 5 écrans simples à la première connexion.

**Comportement détaillé :**
- Déclenché uniquement si user_profile.onboarding_completed = false
- 5 écrans séquentiels, pas de retour en arrière obligatoire
- Navigation : bouton "Suivant →" sur chaque écran
- Dernier écran : bouton "Choisir mon premier texte" → Library

**Contenu des 5 écrans :**
1. "Le russe change les mots selon leur rôle dans la phrase"
   → Illustration : même mot, deux rôles, deux formes différentes
2. "Les couleurs signalent la fonction du mot — pas son nom de cas"
   → Démo visuelle des 5 couleurs avec leur signification simple
3. "Cliquez sur un mot pour comprendre son rôle dans la phrase"
   → Mot cliquable simulé → mini ExplorerPanel en démo
4. "Sauvegardez les mots qui vous intéressent"
   → Démo du bouton Sauvegarder
5. "On commence par lire — pas par mémoriser"
   → Bouton "Choisir mon premier texte →"

**Ce que l'onboarding NE fait PAS :**
- Pas de test de niveau
- Pas de formulaire de préférences
- Pas de tutorial interactif complexe

**Critères d'acceptation :**
- [ ] L'onboarding se déclenche uniquement à la première connexion
- [ ] Les 5 écrans s'affichent dans l'ordre
- [ ] L'écran 3 a un mot cliquable qui montre une démo de l'ExplorerPanel
- [ ] Le dernier écran redirige vers la Library
- [ ] onboarding_completed passe à true après completion
- [ ] L'onboarding ne se redéclenche jamais après completion

---

## Epic 6 — Practice (priorité P1)

### Feature 6.1 — Sentence Builder

**Ce que ça fait :**
L'utilisateur compose une phrase en russe depuis une idée en français.
L'IA évalue et explique les erreurs grammaticales dans le contexte de la méthode.

**Comportement détaillé :**
- Champ 1 : "Votre idée" (en français ou en russe)
- Champ 2 : "Votre phrase en russe" (textarea cyrillique)
- Bouton "Valider →"
- Après validation : l'IA retourne une évaluation structurée :
  - Ce qui est correct (avec explication du pourquoi)
  - Ce qui est incorrect (avec explication du pourquoi et correction)
  - Une version corrigée si nécessaire
- L'évaluation utilise TOUJOURS la logique de la méthode :
  "tu as bien choisi l'aspect, mais l'objet devrait être à l'accusatif
  parce que c'est ce qui subit l'action du verbe видеть"
- Bouton "Options →" : choisir le thème ou la structure cible (v2)

**Critères d'acceptation :**
- [ ] L'utilisateur peut écrire une phrase et la faire évaluer
- [ ] L'évaluation explique toujours le POURQUOI des erreurs
- [ ] La correction est affichée clairement
- [ ] L'évaluation ne dit jamais juste "faux" sans explication

---

### Feature 6.2 — Traduction contextualisée

**Ce que ça fait :**
L'utilisateur traduit le sens d'une phrase ou expression,
pas les mots un par un.

**Comportement détaillé :**
- Champ : "Phrase à traduire" (en français)
- Bouton "Valider →"
- L'IA génère la traduction russe naturelle et explique
  les différences de construction avec le français
- Section "Traductions récentes" : historique des 10 dernières
- Exemple d'explication attendue :
  "Мне холодно — en russe on n'utilise pas 'je' comme sujet
  pour exprimer une sensation physique, le ressenti s'exprime
  avec le datif (мне = à moi)"

**Critères d'acceptation :**
- [ ] La traduction produite est naturelle (pas mot à mot)
- [ ] L'explication montre la différence de logique français/russe
- [ ] L'historique des traductions récentes s'affiche

---

## Epic 7 — SRS — Révision espacée (priorité P1)

### Feature 7.1 — Vocabulary Review

**Ce que ça fait :**
Présente les mots à réviser selon l'algorithme SM-2.
La révision se fait toujours en contexte — jamais un mot seul.

**Comportement détaillé :**
- Accessible depuis Home ("X mots en attente") et depuis Vocabulary
- Chaque révision présente :
  - La phrase d'exemple du mot (contexte de découverte)
  - Le mot est masqué dans la phrase (remplacé par ___)
  - L'utilisateur doit identifier/rappeler le mot
  - Puis révèle la réponse et évalue sa mémoire : Difficile / Correct / Facile
- "Difficile" → revoir dans 1 jour
- "Correct" → algorithme SM-2 standard
- "Facile" → intervalle multiplié
- Session de révision : maximum 20 mots par session

**Critères d'acceptation :**
- [ ] Les mots dont next_review_at est dépassé apparaissent en révision
- [ ] La phrase d'exemple est toujours présente (jamais le mot seul)
- [ ] Les 3 boutons d'évaluation mettent à jour srs_reviews correctement
- [ ] L'intervalle suit l'algorithme SM-2
- [ ] Maximum 20 mots par session

---

## Home — Feature transversale

### Feature H.1 — Page d'accueil

**Ce que ça fait :**
Point d'entrée quotidien — l'utilisateur voit immédiatement quoi faire.

**Sections dans l'ordre :**
1. Header : streak + mots explorés aujourd'hui + mots explorés total
2. "Continuer votre lecture" : le dernier texte en cours (si existant)
3. "Aujourd'hui" : 3 exercices courts suggérés (Sentence Builder / Traduction / Vocabulary Review)
   avec le nombre restant pour chacun
4. "Collections" : les collections disponibles en cards
5. "Activité récente" : les 3 derniers textes consultés
6. "Vocabulary" : card résumé avec lien vers Vocabulary

**Critères d'acceptation :**
- [ ] La section "Continuer" pointe vers le bon texte à la bonne position
- [ ] Les compteurs d'exercices "aujourd'hui" sont exacts
- [ ] La page est vide mais cohérente pour un nouvel utilisateur (sans texte en cours)

---

## Règles transversales à toutes les features

1. **Toutes les pages (app) nécessitent une authentification**
   → Redirect automatique vers /login si non connecté

2. **Les erreurs API ne cassent jamais l'interface**
   → Toujours un état d'erreur gracieux avec possibilité de réessayer

3. **Aucun texte russe sans accents toniques dans l'interface**
   → Les accents sont stockés dans la base et toujours affichés

4. **L'UI est entièrement en français**
   → Aucun label ou message en anglais visible par l'utilisateur final

5. **Le Reader est utilisable sans JavaScript avancé**
   → La lecture du texte fonctionne, les annotations sont progressives

6. **Responsive obligatoire**
   → Tester chaque feature sur 375px (mobile) ET 1280px (desktop)