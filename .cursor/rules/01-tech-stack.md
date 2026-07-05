# Rossiyani — Stack technique et règles de code

---

## Stack autorisée (rien en dehors de cette liste sans validation explicite)

### Frontend
- **Next.js 16+** avec App Router (pas Pages Router)
- **TypeScript** strict — pas de `any`, pas de `as unknown`
- **Tailwind CSS** pour le styling
- **shadcn/ui** pour les composants de base
- **Zustand** pour le state management global
- **React Query (TanStack Query)** pour le fetching et le cache côté client

### Backend / API
- **Next.js API Routes** (`/app/api/`) — toute la logique serveur ici
- **Supabase JS Client** côté serveur uniquement pour les opérations sensibles
- **OpenAI SDK** (`openai`) — uniquement dans `/src/lib/orchestrator/` et `/src/lib/knowledge/`, jamais dans les composants React

### Base de données
- **Supabase** (PostgreSQL)
- Migrations dans `/supabase/migrations/`
- Types générés automatiquement dans `/types/supabase.ts`
- Row Level Security (RLS) activé sur toutes les tables utilisateur

### Utilitaires
- **date-fns** pour les dates
- **zod** pour la validation des données
- **nanoid** pour la génération d'IDs

---

## Couche LLM — règle d'abstraction

Le projet ne doit **jamais** appeler OpenAI directement depuis un composant, un hook ou une page.

Deux points d'entrée LLM autorisés, chacun avec un rôle distinct :

| Module | Fichier | Rôle |
|--------|---------|------|
| Reader (contextuel) | `src/lib/orchestrator/llm.ts` | Explication d'une forme dans une phrase |
| Knowledge Builder | `src/lib/knowledge/generate-knowledge-llm.ts` | Fiche linguistique permanente d'un lemme |

Toute la logique applicative consomme des **données persistées** (`explanation_cache`, `linguistic_knowledge`), pas le LLM directement.

---

## Conventions de code

### Structure des fichiers
```
src/
├── app/                    # Pages et API Routes (Next.js App Router)
│   ├── (auth)/             # Login, register
│   ├── (app)/              # Pages protégées (library, reader, vocabulary, review…)
│   └── api/                # API Routes — toute la logique serveur
├── components/
│   ├── reader/             # Composants du Reader
│   ├── vocabulary/         # Composants Vocabulary
│   ├── review/             # Composants Review (queue, session)
│   ├── practice/           # Composants Practice
│   ├── library/            # Composants Library
│   ├── layout/             # Navigation principale
│   └── ui/                 # Composants shadcn/ui et génériques
├── lib/
│   ├── supabase/           # Clients Supabase (server + client + admin)
│   ├── orchestrator/       # Reader — cache + LLM contextuel
│   ├── knowledge/          # Knowledge Layer — fiches permanentes
│   ├── review/             # Review queue, session, ratings, SM-2
│   ├── vocabulary/         # Logique Vocabulary
│   └── utils/              # Fonctions utilitaires (srs, russian…)
├── hooks/                  # Custom React hooks
├── stores/                 # Zustand stores
└── types/                  # Types TypeScript
```

### Nommage
- Composants : PascalCase (`WordExplorer.tsx`)
- Fonctions et variables : camelCase (`getWordContext`)
- Fichiers non-composants : kebab-case (`word-context.ts`)
- Types et interfaces : PascalCase avec préfixe T ou I (`TWordForm`, `IExplanation`)
- Constantes : SCREAMING_SNAKE_CASE (`MAX_EXPLANATION_LENGTH`)

### Règles TypeScript
- Toujours typer les props des composants avec une interface
- Toujours typer les retours des fonctions API
- Utiliser les types générés par Supabase pour les objets de base de données
- Zod pour valider toutes les entrées des API Routes

### Règles de composants
- Un composant = un fichier
- Les composants ne fetch pas directement — ils reçoivent les données via props ou hooks
- Les hooks custom préfixés `use` (`useWordExplanation`, `useTextProgress`)
- Pas de logique métier dans les composants — dans les hooks ou lib/

---

## Variables d'environnement requises

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # Serveur uniquement, jamais exposé au client

# OpenAI
OPENAI_API_KEY=                  # Serveur uniquement, jamais exposé au client
OPENAI_MODEL=                    # ex. gpt-4.1-mini (voir .env.example)

# App
NEXT_PUBLIC_APP_URL=
```

---

## Interdictions absolues

- `console.log` en production (utiliser un logger structuré)
- Clés API dans le code ou côté client
- Requêtes Supabase directes depuis les composants React (passer par les hooks)
- Appels OpenAI API depuis le frontend
- Appels LLM depuis Vocabulary, Review ou Library (données persistées uniquement)
- Modification des fichiers dans `.cursor/rules/` ou `docs/` (lecture seule pour Cursor, sauf demande explicite)
