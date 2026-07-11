# Import — Vérification RLS (utilisateurs A et B)

> Story 4.2 — Test manuel d'isolation  
> Prérequis : migration `017_import_schema_security.sql` appliquée

## Objectif

Confirmer que l'utilisateur **B** ne peut **jamais** lire, modifier ou supprimer un import de l'utilisateur **A**.

---

## Préparation

1. Deux comptes de test : `user-a@test.local`, `user-b@test.local`
2. Supabase Dashboard → SQL ou client avec JWT de chaque utilisateur
3. Noter les UUID : `USER_A_ID`, `USER_B_ID`

---

## Test 1 — Insertion (user A)

Connecté en tant que **A** (client Supabase avec session A) :

```sql
INSERT INTO texts (
  title, content, level, collection, source, imported_by,
  word_count, reading_time_minutes, content_annotated
) VALUES (
  'Тест A',
  'Это приватный текст пользователя A для проверки безопасности импорта.',
  'A1',
  'imported',
  'imported',
  auth.uid(),
  50,
  3,
  '{"sentences":[{"text":"Это приватный текст пользователя A."}]}'::jsonb
)
RETURNING id;
```

→ Noter `TEXT_A_ID`. **Succès attendu.**

---

## Test 2 — Lecture (user A)

Connecté en tant que **A** :

```sql
SELECT id, title FROM texts WHERE id = 'TEXT_A_ID';
```

→ **1 ligne** visible.

---

## Test 3 — Lecture (user B) — isolation

Connecté en tant que **B** :

```sql
SELECT id, title FROM texts WHERE id = 'TEXT_A_ID';
```

→ **0 ligne** (RLS masque l'import).

```sql
SELECT id, title FROM texts WHERE source = 'imported';
```

→ Uniquement les imports de B (0 si B n'a rien importé).

---

## Test 4 — Curated toujours visible

Connecté en tant que **B** :

```sql
SELECT COUNT(*) FROM texts WHERE source = 'curated';
```

→ **≥ 11** (bibliothèque Rossiyani complète).

---

## Test 5 — Update / Delete (user B sur texte A)

Connecté en tant que **B** :

```sql
UPDATE texts SET title = 'Hack' WHERE id = 'TEXT_A_ID';
```

→ **0 rows** (policy USING bloque).

```sql
DELETE FROM texts WHERE id = 'TEXT_A_ID';
```

→ **0 rows**.

---

## Test 6 — Cleanup (user A)

Connecté en tant que **A** :

```sql
DELETE FROM texts WHERE id = 'TEXT_A_ID';
```

→ **1 row** supprimée.

---

## Critère Story 4.2

| Test | Résultat |
|------|----------|
| A insère son import | ✅ |
| A lit son import | ✅ |
| B ne lit pas l'import de A | ✅ |
| B ne modifie/supprime pas l'import de A | ✅ |
| Curated visible pour A et B | ✅ |

Signature : ___ / date ___
