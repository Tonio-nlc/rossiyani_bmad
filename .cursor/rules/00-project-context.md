# Rossiyani — Contexte projet permanent

## Ce fichier est lu à chaque session. Ne jamais l'ignorer.

---

## Ce qu'est Rossiyani

Rossiyani est un environnement de lecture intelligent pour apprendre le russe.
La philosophie centrale : **comprendre le russe, pas l'enseigner**.

Phrase fondatrice :
> Rossiyani explique pourquoi le russe fonctionne comme il fonctionne — toujours dans le contexte de ce que l'utilisateur lit, jamais pour donner une information pour elle-même.

---

## La méthode pédagogique (non-négociable)

### Principe 1 — Le contexte avant l'information
Quand un utilisateur clique sur un mot dans le Reader, la réponse doit TOUJOURS répondre à :
"Pourquoi ce mot a-t-il cette forme dans CETTE phrase ?"
Jamais : "ce mot est accusatif singulier féminin" seul, sans explication du rôle.

### Principe 2 — Le mot dans sa phrase, jamais seul
L'unité d'analyse minimale est le mot + sa phrase complète.
Un mot ne s'explique jamais hors contexte.

### Principe 3 — Les couleurs par fonction (pas par cas grammatical)
Le système de couleurs dans le Reader encode le RÔLE du mot, pas son cas :
- Bleu → sujet (fait l'action)
- Coral/rouge → objet direct (subit l'action)
- Vert → lieu / temps
- Violet → possession / relation
- Ambre → destinataire (à qui, pour qui)

### Principe 4 — Comprendre d'abord, mémoriser ensuite
Ordre : Lire → Comprendre → Revoir en contexte → Mémoriser naturellement
Jamais l'inverse.

---

## Les outils du produit et leur rôle

| Outil | Rôle unique |
|-------|-------------|
| Reader | Lire un texte russe annoté — cœur du produit |
| Vocabulary | Stocker les mots EN CONTEXTE (pas comme un dictionnaire) |
| Practice | Sentence Builder + Traduction contextualisée |
| Lessons | Expliquer la logique du russe avec schémas |
| Library | Naviguer et choisir les textes |

---

## Ce que Rossiyani n'est PAS

- Pas une app de gamification (pas de streaks obligatoires, pas de points)
- Pas un générateur d'exercices (les exercices servent la lecture, pas l'inverse)
- Pas un chatbot (l'IA est un orchestrateur, pas un assistant conversationnel)
- Pas Duolingo, pas LingQ

---

## Audience cible

Apprenants autodidactes du russe, niveau A1 à B1, sérieux.
Interface en français (langue principale de l'UI).
Contenu en russe avec annotations.

---

## Règles de développement absolues

1. **Ne jamais inventer une feature** non spécifiée dans les docs/stories/
2. **Ne jamais modifier le schéma Supabase** sans qu'une migration soit explicitement demandée dans la story
3. **Ne jamais appeler l'API Claude directement depuis le frontend** — toujours passer par /api/ (Next.js API Routes)
4. **Toujours vérifier d'abord dans la base propriétaire** avant d'appeler l'API Claude
5. **Chaque composant Reader** doit recevoir la phrase complète en contexte, pas juste le mot isolé
6. **Le langage de l'UI est le français** — tous les labels, messages d'erreur, et textes d'interface sont en français
7. **Ne jamais utiliser de localStorage** — toutes les données persistantes passent par Supabase
