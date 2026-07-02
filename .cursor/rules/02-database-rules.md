# Rossiyani — Base de données et orchestrateur

---

## Architecture en deux bases distinctes

Rossiyani utilise deux catégories de tables dans Supabase :

1. **Base propriétaire linguistique** — connaissances sur le russe, partagées entre tous les utilisateurs, construite progressivement
2. **Base utilisateur** — données propres à chaque utilisateur, protégées par RLS

---

## Schéma complet — Base propriétaire linguistique

### `lemmas` — unité centrale de la base
```sql
CREATE TABLE lemmas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form TEXT NOT NULL UNIQUE,          -- forme de base : "женщина"
  pos TEXT NOT NULL,                  -- part of speech : noun, verb, adj, adv, prep...
  gender TEXT,                        -- m, f, n (pour les noms)
  animacy TEXT,                       -- animate, inanimate (pour les noms)
  aspect TEXT,                        -- imperfective, perfective (pour les verbes)
  frequency_rank INTEGER,             -- rang de fréquence dans le russe courant
  family_id UUID REFERENCES word_families(id),
  confidence_score FLOAT DEFAULT 0.5, -- monte avec l'usage et la validation
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### `word_forms` — toutes les formes fléchies d'un lemme
```sql
CREATE TABLE word_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lemma_id UUID NOT NULL REFERENCES lemmas(id),
  surface TEXT NOT NULL,              -- forme telle qu'elle apparaît : "женщину"
  grammatical_case TEXT,             -- nominative, accusative, genitive, dative, instrumental, prepositional
  number TEXT,                        -- singular, plural
  grammatical_gender TEXT,           -- m, f, n (pour les formes adjectivales)
  person TEXT,                        -- 1, 2, 3 (pour les verbes)
  tense TEXT,                         -- present, past, future, infinitive
  functional_role TEXT,              -- subject, object_direct, object_indirect, possession, location, time
  function_color TEXT,               -- blue, coral, green, violet, amber (couleur UI correspondante)
  UNIQUE(lemma_id, surface, functional_role)
);
```

### `word_families` — familles de mots par racine
```sql
CREATE TABLE word_families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  root TEXT NOT NULL,                 -- racine : "чит"
  description_fr TEXT,               -- "famille du verbe lire"
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### `grammar_patterns` — patterns grammaticaux réutilisables
```sql
CREATE TABLE grammar_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,          -- "accusative_direct_object"
  trigger_condition TEXT,             -- "transitive verb + noun after"
  function_color TEXT NOT NULL,       -- "coral"
  explanation_template_fr TEXT,       -- template d'explication avec variables
  examples JSONB,                     -- exemples canoniques
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### `explanation_cache` — cœur de la base propriétaire
```sql
CREATE TABLE explanation_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  context_hash TEXT NOT NULL UNIQUE,  -- hash(lemma_id + functional_role + sentence_structure)
  lemma_id UUID NOT NULL REFERENCES lemmas(id),
  word_form_id UUID REFERENCES word_forms(id),
  sentence_example TEXT NOT NULL,     -- phrase d'exemple complète
  word_in_sentence TEXT NOT NULL,     -- le mot tel qu'il apparaît
  explanation_fr TEXT NOT NULL,       -- explication en français
  grammar_pattern_id UUID REFERENCES grammar_patterns(id),
  source TEXT NOT NULL DEFAULT 'api', -- 'api' ou 'proprio'
  confidence_score FLOAT DEFAULT 0.5, -- monte avec usage_count et validations
  usage_count INTEGER DEFAULT 0,
  last_validated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Schéma complet — Base utilisateur (RLS activé)

### `users` — profil utilisateur
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  display_name TEXT,
  ui_language TEXT DEFAULT 'fr',
  target_level TEXT DEFAULT 'A1',     -- niveau CECR visé
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### `user_vocabulary` — mots sauvegardés par l'utilisateur
```sql
CREATE TABLE user_vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  lemma_id UUID NOT NULL REFERENCES lemmas(id),
  explanation_cache_id UUID REFERENCES explanation_cache(id), -- contexte de découverte
  text_id UUID REFERENCES texts(id),  -- texte où le mot a été rencontré
  saved_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  UNIQUE(user_id, lemma_id)
);
```

### `srs_reviews` — système de révision espacée
```sql
CREATE TABLE srs_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_vocabulary_id UUID NOT NULL REFERENCES user_vocabulary(id),
  ease_factor FLOAT DEFAULT 2.5,      -- algorithme SM-2
  interval_days INTEGER DEFAULT 1,
  repetitions INTEGER DEFAULT 0,
  next_review_at TIMESTAMPTZ DEFAULT now(),
  last_review_at TIMESTAMPTZ,
  last_quality INTEGER                -- 0-5, qualité de la dernière révision
);
```

### `user_progress` — progression par texte
```sql
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  text_id UUID NOT NULL REFERENCES texts(id),
  percent_read INTEGER DEFAULT 0,
  last_position INTEGER DEFAULT 0,    -- index de la dernière phrase lue
  words_encountered INTEGER DEFAULT 0,
  last_read_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, text_id)
);
```

### `texts` — textes de la bibliothèque
```sql
CREATE TABLE texts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,              -- texte russe complet
  content_annotated JSONB,            -- texte pré-annoté (phrases + mots + lemma_ids)
  level TEXT NOT NULL,               -- A1, A2, B1, B2, C1, C2
  collection TEXT,                   -- "everyday_russian", "stories", etc.
  word_count INTEGER,
  reading_time_minutes INTEGER,
  source TEXT DEFAULT 'curated',     -- 'curated' ou 'imported'
  user_id UUID REFERENCES users(id), -- null si texte officiel
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## L'orchestrateur linguistique — logique de décision

Fichier : `/src/lib/orchestrator/index.ts`

```
ENTRÉE : { word: string, sentence: string, textId: string }

1. Lemmatiser le mot (appel à une lib de NLP russe ou à l'API)
2. Calculer le context_hash = hash(lemma_form + sentence_structure_simplified)
3. Chercher dans explanation_cache WHERE context_hash = hash AND confidence_score >= 0.8
   → TROUVÉ + confiance OK : retourner l'explication directement (0 appel API)
   → TROUVÉ + confiance faible : retourner ET re-valider en background
   → PAS TROUVÉ : aller à l'étape 4
4. Construire le prompt Claude avec :
   - Le mot et sa phrase complète
   - Le lemme identifié
   - Les autres mots de la phrase (pour le contexte grammatical)
   - Les instructions de la méthode Rossiyani
   - Le format de réponse attendu (JSON structuré)
5. Appeler l'API Claude (claude-sonnet-4-6)
6. Parser la réponse et la stocker dans explanation_cache (source='api', confidence=0.5)
7. Incrémenter usage_count à chaque réutilisation
8. Quand usage_count >= 20 ET réponses cohérentes → confidence passe à 0.85, source='proprio'
```

---

## Règles absolues sur la base de données

- **Ne jamais modifier une migration existante** — toujours créer une nouvelle migration
- **Ne jamais supprimer de colonne** sans une migration de rollback prête
- **Toujours utiliser des UUID** comme clés primaires
- **RLS activé** sur toutes les tables `user_*`
- **Les tables de la base propriétaire** (`lemmas`, `word_forms`, `grammar_patterns`, `explanation_cache`) sont en lecture seule pour les clients — écriture uniquement via API Routes serveur
