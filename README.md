# Rossiyani — Guide d'installation BMAD

## Ce que contient ce dossier

```
rossiyani-bmad/
├── .cursor/
│   └── rules/
│       ├── 00-project-context.md   ← Méthode + vision + règles absolues
│       ├── 01-tech-stack.md        ← Stack technique + conventions de code
│       ├── 02-database-rules.md    ← Schéma BD + logique orchestrateur
│       └── 03-ux-rules.md          ← Couleurs fonctionnelles + composants
└── docs/
    └── project-brief.md            ← Vision complète du projet
```

---

## Comment installer dans ton projet Rossiyani

### Étape 1 — Copier les fichiers

Copie le dossier `.cursor/` et le dossier `docs/` à la **racine de ton projet Rossiyani** (là où se trouvent `package.json`, `next.config.js`, etc.).

Si le dossier `.cursor/` existe déjà, ajoute juste le sous-dossier `rules/` à l'intérieur.

### Étape 2 — Vérifier dans Cursor

Ouvre Cursor et vérifie que les règles sont bien reconnues :
- Menu Cursor → Settings → Rules
- Tu devrais voir les 4 fichiers listés

Si Cursor ne les détecte pas automatiquement, tu peux les référencer manuellement dans les paramètres du projet.

### Étape 3 — Tester que le contexte est actif

Ouvre une nouvelle conversation dans Cursor et tape :
> "Résume ce qu'est Rossiyani et sa méthode pédagogique"

Cursor doit répondre avec la vision correcte de la méthode. Si ce n'est pas le cas, les règles ne sont pas correctement chargées.

---

## Comment utiliser avec Claude (moi) + Cursor

**Ton workflow quotidien :**

1. **Tu me demandes une story** ici dans Claude
   → Je te produis un fichier `story-X.X-nom.md` avec tout le contexte

2. **Tu crées le fichier dans `docs/stories/epic-X/`**
   → Et tu colles dans Cursor le prompt de handoff que je t'aurai fourni

3. **Cursor implémente la story**
   → Il lit les règles `.cursor/rules/` automatiquement + la story

4. **Tu testes dans le navigateur**
   → Et tu me rapportes ce qui ne va pas

5. **Je debug ou je valide, on passe à la suivante**

---

## Prochaines étapes

Ces fichiers sont le socle. La prochaine session avec Claude produira :
- `docs/architecture.md` — schéma DB détaillé + code de l'orchestrateur
- `docs/front-end-spec.md` — tous les composants Reader en détail
- `docs/prd.md` — toutes les features spécifiées
- `docs/stories/epic-1/` — les premières stories prêtes à donner à Cursor

---

## Si quelque chose ne va pas

Reviens dans Claude avec une description précise du problème.
Claude a la vision complète du projet et peut produire un fix prompt pour Cursor.

Ne laisse pas Cursor "inventer" une solution architecturale — toujours valider avec Claude d'abord.
