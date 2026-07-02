# Rossiyani — Stack technique et règles de code

---

## Stack autorisée (rien en dehors de cette liste sans validation explicite)

### Frontend
- **Next.js 14+** avec App Router (pas Pages Router)
- **TypeScript** strict — pas de `any`, pas de `as unknown`
- **Tailwind CSS** pour le styling
- **shadcn/ui** pour les composants de base
- **Zustand** pour le state management global
- **React Query (TanStack Query)** pour le fetching et le cache côté client

### Backend / API
- **Next.js API Routes** (`/app/api/`) — toute la logique serveur ici
- **Supabase JS Client** côté serveur uniquement pour les opérations sensibles
- **Anthropic SDK** (`@anthropic-ai/sdk`) — uniquement dans `/app/api/`, jamais dans les composants

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

## Conventions de code

### Structure des fichiers
```
src/
├── app/                    # Pages et API Routes (Next.js App Router)
│   ├── (auth)/             # Pages nécessitant authentification
│   ├── api/                # API Routes — toute la logique serveur
│   └── (public)/           # Pages publiques
├── components/
│   ├── reader/             # Composants du Reader
│   ├── vocabulary/         # Composants Vocabulary
│   ├── practice/           # Composants Practice
│   ├── lessons/            # Composants Lessons
│   ├── library/            # Composants Library
│   └── ui/                 # Composants shadcn/ui et génériques
├── lib/
│   ├── supabase/           # Clients Supabase (server + client)
│   ├── orchestrator/       # Logique de l'orchestrateur linguistique
│   └── utils/              # Fonctions utilitaires
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

# Anthropic
ANTHROPIC_API_KEY=               # Serveur uniquement, jamais exposé au client

# App
NEXT_PUBLIC_APP_URL=
```

---

## Interdictions absolues

- `console.log` en production (utiliser un logger structuré)
- Clés API dans le code ou côté client
- Requêtes Supabase directes depuis les composants React (passer par les hooks)
- Appels Anthropic API depuis le frontend
- Modification des fichiers dans `.cursor/rules/` ou `docs/` (lecture seule pour Cursor)
