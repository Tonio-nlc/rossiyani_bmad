# Backup manuel — geste avant toute session de travail lourde

Le projet est sur le **plan gratuit Supabase** : pas de backup automatique, pas
de Point-in-Time Recovery. La seule protection contre une erreur en base
(dédup, migration de contenu, script de masse, correction manuelle en SQL
Editor…) est un **backup manuel**, à faire volontairement avant toute
opération risquée.

## Quand le faire

Avant :
- une dédup ou une fusion de données (lemmes, vocabulaire, textes…) ;
- une migration qui modifie ou supprime des colonnes/lignes existantes ;
- un script de masse qui écrit en base (bootstrap, réécriture de contenu) ;
- toute manipulation manuelle en SQL Editor qui n'est pas une simple lecture.

Pas besoin pour : lecture seule, ajout d'une colonne nullable, ajout de
nouvelles lignes qui n'écrasent rien d'existant.

## Comment le faire

1. Ouvrir le **SQL Editor** du projet Supabase.
2. Coller tout le contenu de [`scripts/db-backup-manual.sql`](../../scripts/db-backup-manual.sql) tel quel — rien à éditer, la date du jour est calculée automatiquement.
3. Exécuter. Deux blocs s'exécutent dans l'ordre :
   - création des tables `<table>_backup_manual_YYYYMMDD` (snapshot brut,
     sans contraintes/index/RLS-policy, juste les données) ;
   - vérification : compare le nombre de lignes live vs backup pour chaque
     table, affichée dans l'onglet **Messages** (pas **Results** — ce sont
     des `RAISE NOTICE`, pas un `SELECT`).
4. Vérifier dans les messages que chaque ligne affiche `✓` (comptes
   identiques). Un `⚠ WARNING` signale un problème — ne pas continuer la
   session de travail avant de comprendre pourquoi.

## Portée du backup

Les 8 tables sensibles de l'application :

| Table | Pourquoi |
|---|---|
| `lemmas` | table maîtresse, référencée par presque tout |
| `user_vocabulary` | vocabulaire sauvegardé par les utilisateurs |
| `srs_reviews` | historique de répétition espacée |
| `review_history` | historique détaillé des révisions |
| `explanation_cache` | explications déjà générées (coûteuses à regénérer) |
| `linguistic_knowledge` | fiches grammaticales bootstrappées |
| `lemma_concept_links` | liens lemme ↔ concept du Concept Graph |
| `texts` | textes de la bibliothèque, dont le JSONB `content_annotated` |

## Rejouabilité

Le script est **idempotent** : le nom des tables de backup inclut la date du
jour (`YYYYMMDD`), calculée par `current_date` — aucune édition manuelle.

- **Relancé le même jour** : les tables de backup de ce jour sont `DROP`
  puis recréées automatiquement — pas d'erreur "already exists", pas de
  doublon. On peut le relancer autant de fois que nécessaire dans la
  journée (ex. juste avant chaque étape d'une session longue).
- **Relancé un autre jour** : un nouveau jeu de tables apparaît à côté des
  précédents (historique multi-jours). Voir purge ci-dessous.

## Restauration

Le script contient, en commentaire, la procédure de restauration complète
(`TRUNCATE` enfants → parents, puis `INSERT` parents → enfants depuis les
tables `_backup_manual_<SUFFIX>`). À dérouler **à la main, ligne par ligne,
avec relecture avant chaque étape** — jamais en un seul bloc aveugle.
Remplacer `<SUFFIX>` par la date du backup à restaurer.

## Purge

Le plan gratuit a un quota de stockage : ne pas laisser s'accumuler les
snapshots indéfiniment. Le script contient, en commentaire, les `DROP TABLE
IF EXISTS` pour purger un jeu de backups d'une date donnée. À dérouler
manuellement une fois le backup jugé inutile (session terminée sans
incident), jamais en même temps que le backup ou la restauration.
