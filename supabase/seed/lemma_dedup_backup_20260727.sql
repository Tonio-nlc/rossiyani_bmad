-- ============================================================
-- BACKUP MANUEL — avant dédup des lemmes (PROMPT CURSOR 27/07/2026)
-- À exécuter tel quel dans le SQL Editor Supabase, AVANT toute exécution
-- réelle du plan de dédup (voir docs/knowledge/lemma-dedup-remap-report.md).
--
-- Le projet est sur le plan gratuit Supabase : PAS de backup automatique/PITR.
-- Ce script copie, dans la même base, un instantané des tables touchées par la
-- dédup dans des tables `_backup_20260727` (simples snapshots de données —
-- sans contraintes/index/RLS — uniquement destinés à une restauration manuelle
-- en cas de problème).
--
-- Portée : `lemmas` + TOUTE table qui référence `lemma_id` (directement via
-- FK, ou indirectement via `user_vocabulary_id` pour srs_reviews/review_history),
-- + `texts` qui embarque des `lemma_id` dans sa colonne JSONB `content_annotated`
-- (PAS une table séparée "content_annotated" : elle n'existe pas dans ce schéma —
-- corrigé ici pour coller à la réalité du schéma, cf. supabase/migrations/001,
-- 002, 003, 019).
--
-- CE SCRIPT NE SUPPRIME NI NE MODIFIE RIEN dans les tables d'origine.
-- ============================================================

begin;

-- 1. Table maîtresse
create table lemmas_backup_20260727 as
select * from lemmas;

-- 2. Tables avec FK directe sur lemmas.id
create table word_forms_backup_20260727 as
select * from word_forms;

create table explanation_cache_backup_20260727 as
select * from explanation_cache;

create table linguistic_knowledge_backup_20260727 as
select * from linguistic_knowledge;

create table lemma_concept_links_backup_20260727 as
select * from lemma_concept_links;

create table user_vocabulary_backup_20260727 as
select * from user_vocabulary;

-- 3. Tables sans lemma_id direct, mais dépendantes de user_vocabulary_id
--    (données personnelles/historique SRS — sauvegardées par prudence,
--    car une fusion de user_vocabulary en doublon peut les impacter).
create table srs_reviews_backup_20260727 as
select * from srs_reviews;

create table review_history_backup_20260727 as
select * from review_history;

-- 4. `texts` entière (contient la colonne JSONB `content_annotated` qui
--    embarque des `lemma_id` par mot annoté — pas de FK, donc pas de
--    contrainte SQL, mais une dédup doit remapper ces valeurs aussi).
create table texts_backup_20260727 as
select * from texts;

-- Sécurité : ces tables de backup ne doivent pas être exposées via l'API
-- publique (PostgREST). RLS activé sans policy = accès refusé à anon/
-- authenticated ; le service role (utilisé par les scripts d'admin) bypasse
-- RLS par défaut et peut toujours y accéder pour une restauration.
alter table lemmas_backup_20260727 enable row level security;
alter table word_forms_backup_20260727 enable row level security;
alter table explanation_cache_backup_20260727 enable row level security;
alter table linguistic_knowledge_backup_20260727 enable row level security;
alter table lemma_concept_links_backup_20260727 enable row level security;
alter table user_vocabulary_backup_20260727 enable row level security;
alter table srs_reviews_backup_20260727 enable row level security;
alter table review_history_backup_20260727 enable row level security;
alter table texts_backup_20260727 enable row level security;

commit;

-- ============================================================
-- VÉRIFICATION — les comptes doivent être identiques ligne par ligne
-- ============================================================
select 'lemmas' as table_name, count(*) as live, (select count(*) from lemmas_backup_20260727) as backup from lemmas
union all
select 'word_forms', count(*), (select count(*) from word_forms_backup_20260727) from word_forms
union all
select 'explanation_cache', count(*), (select count(*) from explanation_cache_backup_20260727) from explanation_cache
union all
select 'linguistic_knowledge', count(*), (select count(*) from linguistic_knowledge_backup_20260727) from linguistic_knowledge
union all
select 'lemma_concept_links', count(*), (select count(*) from lemma_concept_links_backup_20260727) from lemma_concept_links
union all
select 'user_vocabulary', count(*), (select count(*) from user_vocabulary_backup_20260727) from user_vocabulary
union all
select 'srs_reviews', count(*), (select count(*) from srs_reviews_backup_20260727) from srs_reviews
union all
select 'review_history', count(*), (select count(*) from review_history_backup_20260727) from review_history
union all
select 'texts', count(*), (select count(*) from texts_backup_20260727) from texts;

-- ============================================================
-- SCRIPT DE RESTAURATION — À NE PAS EXÉCUTER MAINTENANT
-- Conservé en commentaire "au cas où" (rollback si la dédup réelle, dans un
-- ticket ultérieur, tourne mal). Restaure l'état exact capturé ci-dessus dans
-- les tables d'origine.
--
-- Ordre de TRUNCATE (enfants → parents, à cause des FK ON DELETE CASCADE) puis
-- ordre d'INSERT inverse (parents → enfants) pour respecter les contraintes.
-- `texts` est indépendante des autres (pas de FK vers lemmas) : restaurée à
-- part, seulement si la dédup a modifié `content_annotated`.
--
-- À dérouler à la main, ligne par ligne, avec relecture avant chaque étape.
-- ============================================================

-- begin;
--
--   -- 1. Vider dans l'ordre enfants → parents
--   truncate table review_history;
--   truncate table srs_reviews;
--   truncate table user_vocabulary cascade;      -- cascade = aussi review_history/srs_reviews
--                                                  -- déjà vidées ci-dessus, cascade est une sécurité
--   truncate table lemma_concept_links;
--   truncate table linguistic_knowledge;
--   truncate table explanation_cache cascade;     -- cascade = aussi user_vocabulary (déjà vidée)
--   truncate table word_forms;
--   truncate table lemmas cascade;                -- cascade = toutes les tables FK ci-dessus
--
--   -- 2. Réinsérer dans l'ordre parents → enfants
--   insert into lemmas select * from lemmas_backup_20260727;
--   insert into word_forms select * from word_forms_backup_20260727;
--   insert into explanation_cache select * from explanation_cache_backup_20260727;
--   insert into linguistic_knowledge select * from linguistic_knowledge_backup_20260727;
--   insert into lemma_concept_links select * from lemma_concept_links_backup_20260727;
--   insert into user_vocabulary select * from user_vocabulary_backup_20260727;
--   insert into srs_reviews select * from srs_reviews_backup_20260727;
--   insert into review_history select * from review_history_backup_20260727;
--
--   -- 3. Restaurer `texts` seulement si `content_annotated` a été modifiée
--   -- truncate table texts cascade;
--   -- insert into texts select * from texts_backup_20260727;
--
-- commit;

-- ============================================================
-- NETTOYAGE — une fois la dédup validée en production et le backup jugé
-- inutile (à exécuter séparément, plus tard, jamais en même temps que le
-- backup ou la restauration).
-- ============================================================

-- drop table if exists lemmas_backup_20260727;
-- drop table if exists word_forms_backup_20260727;
-- drop table if exists explanation_cache_backup_20260727;
-- drop table if exists linguistic_knowledge_backup_20260727;
-- drop table if exists lemma_concept_links_backup_20260727;
-- drop table if exists user_vocabulary_backup_20260727;
-- drop table if exists srs_reviews_backup_20260727;
-- drop table if exists review_history_backup_20260727;
-- drop table if exists texts_backup_20260727;
