-- ============================================================
-- BACKUP MANUEL REJOUABLE — tables sensibles Rossiyani
-- À COLLER TEL QUEL dans le SQL Editor Supabase, à faire avant toute
-- session de travail lourde (dédup, migration de contenu, script de masse…).
--
-- Le projet est sur le plan gratuit Supabase : PAS de backup automatique/PITR.
-- Ce script est le filet de sécurité manuel qui en tient lieu.
--
-- Portée : lemmas, user_vocabulary, srs_reviews, review_history,
-- explanation_cache, linguistic_knowledge, lemma_concept_links, texts.
-- (mêmes tables que le backup dédup du 27/07/2026, généralisées à un usage
-- récurrent, indépendant d'un ticket précis.)
--
-- IDEMPOTENT / REJOUABLE :
-- - le nom de chaque table de backup inclut la date du jour (YYYYMMDD),
--   calculée automatiquement (current_date) — pas d'édition manuelle requise ;
-- - si relancé LE MÊME JOUR, les tables de backup de ce jour sont DROP puis
--   recréées (aucune erreur "already exists", aucun doublon de snapshot) ;
-- - relancé un AUTRE jour, un nouveau jeu de tables horodaté est créé à côté
--   des précédents (plusieurs jours d'historique peuvent coexister — pensez à
--   purger les plus anciens de temps en temps, voir docs/ops/manual-backup.md).
--
-- CE SCRIPT NE SUPPRIME NI NE MODIFIE RIEN dans les tables d'origine.
-- ============================================================

do $$
declare
  v_suffix text := to_char(current_date, 'YYYYMMDD');
  v_tables text[] := array[
    'lemmas',
    'user_vocabulary',
    'srs_reviews',
    'review_history',
    'explanation_cache',
    'linguistic_knowledge',
    'lemma_concept_links',
    'texts'
  ];
  v_table text;
  v_backup_table text;
  v_row_count bigint;
begin
  foreach v_table in array v_tables loop
    v_backup_table := v_table || '_backup_manual_' || v_suffix;

    -- Rejouable le même jour : on repart d'un snapshot propre.
    execute format('drop table if exists %I', v_backup_table);
    execute format('create table %I as select * from %I', v_backup_table, v_table);

    -- Sécurité : ces tables de backup ne doivent pas être exposées via
    -- l'API publique (PostgREST). RLS activé sans policy = accès refusé à
    -- anon/authenticated ; le service role (scripts d'admin) bypasse RLS.
    execute format('alter table %I enable row level security', v_backup_table);

    execute format('select count(*) from %I', v_backup_table) into v_row_count;
    raise notice 'Backup créé : % (% lignes)', v_backup_table, v_row_count;
  end loop;
end $$;

-- ============================================================
-- VÉRIFICATION — les comptes doivent être identiques ligne par ligne.
-- Résultat affiché dans l'onglet "Messages" du SQL Editor (RAISE NOTICE),
-- pas dans l'onglet "Results" (les noms de table sont calculés dynamiquement,
-- une requête SELECT classique ne peut pas les référencer sans les connaître
-- à l'avance).
-- ============================================================

do $$
declare
  v_suffix text := to_char(current_date, 'YYYYMMDD');
  v_tables text[] := array[
    'lemmas',
    'user_vocabulary',
    'srs_reviews',
    'review_history',
    'explanation_cache',
    'linguistic_knowledge',
    'lemma_concept_links',
    'texts'
  ];
  v_table text;
  v_backup_table text;
  v_live_count bigint;
  v_backup_count bigint;
begin
  foreach v_table in array v_tables loop
    v_backup_table := v_table || '_backup_manual_' || v_suffix;

    execute format('select count(*) from %I', v_table) into v_live_count;
    execute format('select count(*) from %I', v_backup_table) into v_backup_count;

    if v_live_count = v_backup_count then
      raise notice '✓ % : % lignes (live) = % lignes (backup)', v_table, v_live_count, v_backup_count;
    else
      raise warning '✗ % : % lignes (live) ≠ % lignes (backup) — vérifier !', v_table, v_live_count, v_backup_count;
    end if;
  end loop;
end $$;

-- ============================================================
-- RESTAURATION — À NE PAS EXÉCUTER SANS RELECTURE.
-- Remplacez <SUFFIX> par la date du backup à restaurer (ex. 20260728) avant
-- de dérouler, ligne par ligne, avec relecture avant chaque étape.
-- Ordre de TRUNCATE (enfants → parents, à cause des FK ON DELETE CASCADE)
-- puis ordre d'INSERT inverse (parents → enfants).
-- ============================================================

-- begin;
--
--   -- 1. Vider dans l'ordre enfants → parents
--   truncate table review_history;
--   truncate table srs_reviews;
--   truncate table user_vocabulary cascade;      -- cascade = aussi review_history/srs_reviews
--   truncate table lemma_concept_links;
--   truncate table linguistic_knowledge;
--   truncate table explanation_cache cascade;    -- cascade = aussi user_vocabulary (déjà vidée)
--   truncate table word_forms;
--   truncate table lemmas cascade;               -- cascade = toutes les tables FK ci-dessus
--   truncate table texts cascade;
--
--   -- 2. Réinsérer dans l'ordre parents → enfants (remplacer <SUFFIX>)
--   insert into lemmas select * from lemmas_backup_manual_<SUFFIX>;
--   insert into explanation_cache select * from explanation_cache_backup_manual_<SUFFIX>;
--   insert into linguistic_knowledge select * from linguistic_knowledge_backup_manual_<SUFFIX>;
--   insert into lemma_concept_links select * from lemma_concept_links_backup_manual_<SUFFIX>;
--   insert into user_vocabulary select * from user_vocabulary_backup_manual_<SUFFIX>;
--   insert into srs_reviews select * from srs_reviews_backup_manual_<SUFFIX>;
--   insert into review_history select * from review_history_backup_manual_<SUFFIX>;
--   insert into texts select * from texts_backup_manual_<SUFFIX>;
--
-- commit;

-- ============================================================
-- PURGE — à exécuter séparément, de temps en temps, pour les backups
-- devenus inutiles (le plan gratuit a un quota de stockage). Remplacez
-- <SUFFIX> par la date à purger avant de dérouler.
-- ============================================================

-- drop table if exists lemmas_backup_manual_<SUFFIX>;
-- drop table if exists user_vocabulary_backup_manual_<SUFFIX>;
-- drop table if exists srs_reviews_backup_manual_<SUFFIX>;
-- drop table if exists review_history_backup_manual_<SUFFIX>;
-- drop table if exists explanation_cache_backup_manual_<SUFFIX>;
-- drop table if exists linguistic_knowledge_backup_manual_<SUFFIX>;
-- drop table if exists lemma_concept_links_backup_manual_<SUFFIX>;
-- drop table if exists texts_backup_manual_<SUFFIX>;
