-- ============================================================
-- DDL — tables morphology_* (M1 préparation)
-- NE PAS EXÉCUTER automatiquement. Coller à la main dans le SQL Editor
-- Supabase APRÈS backup (scripts/db-backup-manual.sql).
--
-- Décisions actées (2026-08-20) :
--   • Clé morphology_forms : MODÈLE B —
--       UNIQUE (morphology_lemma_id, slot, variant)
--       variant ∈ {'plain','with_n','alt'}
--   • Classe fermée (régence, invariables, numéraux, figés) RESTE en TS
--     — pas de tables ici (frontière §2.11 MORPHOLOGY_ENGINE.md).
--   • Pas de FK vers public.lemmas pour l'instant : coexistence M1/M2.
--
-- Réversibilité import :
--   DELETE FROM morphology_forms WHERE source = 'openrussian';
--   (idem lemmas / sense_overrides)
-- ============================================================


-- ------------------------------------------------------------
-- 0. Extension (si pas déjà là — utilisée ailleurs sur le projet)
-- ------------------------------------------------------------
-- create extension if not exists btree_gist;  -- NON requis pour ce DDL


-- ------------------------------------------------------------
-- 1. morphology_lemmas
-- ------------------------------------------------------------
-- Pas de REFERENCES lemmas(id) : les deux systèmes coexistent pendant
-- M1/M2 ; lemma_id applicatif éventuel = UUID libre, sans FK.

create table if not exists morphology_lemmas (
  id uuid primary key default gen_random_uuid(),

  -- UUID de public.lemmas si connu — SANS foreign key (coexistence M1/M2).
  app_lemma_id uuid null,

  lemma_bare text not null,
  lemma_stressed text null,
  -- present = accent connu ; missing = afficher la forme nue (décision Mario) ;
  -- unknown = pas encore tranché.
  stress_status text not null default 'unknown'
    check (stress_status in ('present', 'missing', 'unknown')),

  pos text not null,
  gender text null,
  animacy text null,
  aspect text null,                 -- imperfective | perfective | null
  conjugation_class smallint null
    check (conjugation_class is null or conjugation_class in (1, 2)),

  source text not null
    check (source in ('curated', 'openrussian', 'pymorphy3')),
  source_version text null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- NFC (même esprit que lemmas_form_is_nfc)
  constraint morphology_lemmas_bare_is_nfc
    check (lemma_bare is nfc normalized),
  constraint morphology_lemmas_stressed_is_nfc
    check (lemma_stressed is null or lemma_stressed is nfc normalized),

  -- Charset (même esprit que assertLemmaFormCharset côté app) :
  -- cyrillique U+0400–U+04FF (Ѐ–ӿ) + tiret ; U+0301 interdit sur bare.
  constraint morphology_lemmas_bare_charset
    check (
      strpos(lemma_bare, chr(769)) = 0
      and length(regexp_replace(lemma_bare, '[Ѐ-ӿ\-]', '', 'g')) = 0
      and length(lemma_bare) > 0
    ),
  constraint morphology_lemmas_stressed_charset
    check (
      lemma_stressed is null
      or (
        length(regexp_replace(lemma_stressed, '[Ѐ-ӿ' || chr(769) || '\-]', '', 'g')) = 0
        and length(lemma_stressed) > 0
      )
    ),

  -- Cohérence accent / statut (forme nue affichée si missing — jamais d'accent inventé)
  constraint morphology_lemmas_stress_coherent
    check (
      (stress_status = 'missing' and lemma_stressed is null)
      or (stress_status = 'present'
          and lemma_stressed is not null
          and strpos(lemma_stressed, chr(769)) > 0
          and replace(lemma_stressed, chr(769), '') = lemma_bare)
      or (stress_status = 'unknown')
    )
);

-- Unicité métier : même bare + POS + aspect (= '' si null)
create unique index if not exists morphology_lemmas_bare_pos_aspect_uidx
  on morphology_lemmas (lemma_bare, pos, (coalesce(aspect, '')));

create index if not exists morphology_lemmas_lemma_bare_idx
  on morphology_lemmas (lemma_bare);

create index if not exists morphology_lemmas_app_lemma_id_idx
  on morphology_lemmas (app_lemma_id)
  where app_lemma_id is not null;

create index if not exists morphology_lemmas_source_idx
  on morphology_lemmas (source);


-- ------------------------------------------------------------
-- 2. morphology_forms  — MODÈLE B (variant)
-- ------------------------------------------------------------
-- Grille = CAS / cellules pédagogiques (slot).
-- plain | with_n | alt = variante contextuelle / orthographique, PAS un cas.
-- OpenRussian → variant = 'plain' ; with_n / alt restent source curated.

create table if not exists morphology_forms (
  id uuid primary key default gen_random_uuid(),

  morphology_lemma_id uuid not null
    references morphology_lemmas (id) on delete cascade,

  -- Ex. case.gen | case.acc | present.sg3 | past.m | …
  slot text not null,
  variant text not null default 'plain'
    check (variant in ('plain', 'with_n', 'alt')),

  form_bare text not null,
  form_stressed text null,
  stress_status text not null default 'unknown'
    check (stress_status in ('present', 'missing', 'unknown')),

  ending text null,
  tags jsonb not null default '{}'::jsonb,

  source text not null
    check (source in ('curated', 'openrussian', 'pymorphy3')),
  source_version text null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint morphology_forms_bare_is_nfc
    check (form_bare is nfc normalized),
  constraint morphology_forms_stressed_is_nfc
    check (form_stressed is null or form_stressed is nfc normalized),

  constraint morphology_forms_bare_charset
    check (
      strpos(form_bare, chr(769)) = 0
      and length(regexp_replace(form_bare, '[Ѐ-ӿ\-]', '', 'g')) = 0
      and length(form_bare) > 0
    ),
  constraint morphology_forms_stressed_charset
    check (
      form_stressed is null
      or (
        length(regexp_replace(form_stressed, '[Ѐ-ӿ' || chr(769) || '\-]', '', 'g')) = 0
        and length(form_stressed) > 0
      )
    ),

  constraint morphology_forms_stress_coherent
    check (
      (stress_status = 'missing' and form_stressed is null)
      or (stress_status = 'present'
          and form_stressed is not null
          and strpos(form_stressed, chr(769)) > 0
          and replace(form_stressed, chr(769), '') = form_bare)
      or (stress_status = 'unknown')
    ),

  -- Clé métier MODÈLE B
  constraint morphology_forms_lemma_slot_variant_key
    unique (morphology_lemma_id, slot, variant)
);

create index if not exists morphology_forms_lemma_slot_idx
  on morphology_forms (morphology_lemma_id, slot);

create index if not exists morphology_forms_form_bare_idx
  on morphology_forms (form_bare);

create index if not exists morphology_forms_source_idx
  on morphology_forms (source);


-- ------------------------------------------------------------
-- 3. morphology_sense_overrides
-- ------------------------------------------------------------

create table if not exists morphology_sense_overrides (
  id uuid primary key default gen_random_uuid(),

  morphology_lemma_id uuid not null
    references morphology_lemmas (id) on delete cascade,

  sense_key text not null,          -- ex. boleть.hurt
  label_fr text null,
  allowed_slots text[] null,        -- null = tous les slots du lemme
  notes_fr text null,
  validated boolean not null default false,

  source text not null
    check (source in ('curated', 'openrussian', 'pymorphy3')),
  source_version text null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint morphology_sense_overrides_lemma_sense_key
    unique (morphology_lemma_id, sense_key)
);

create index if not exists morphology_sense_overrides_lemma_idx
  on morphology_sense_overrides (morphology_lemma_id);

create index if not exists morphology_sense_overrides_source_idx
  on morphology_sense_overrides (source);


-- ------------------------------------------------------------
-- 4. morphology_pending — file batch (pas une table d'import OR)
-- ------------------------------------------------------------
-- Pas de source/source_version d'import : ce sont des demandes applicatives
-- (Reader / vocabulaire). Remplies ensuite par le batch → morphology_*.

create table if not exists morphology_pending (
  id uuid primary key default gen_random_uuid(),

  lemma_bare text not null,
  pos text null,
  surface text null,                -- forme rencontrée ayant déclenché l'enqueue
  -- UUID public.lemmas si connu — SANS foreign key (coexistence M1/M2).
  app_lemma_id uuid null,

  enqueued_from text not null default 'unknown',
  -- ex. reader | user_vocabulary | batch_scan
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'done', 'skipped')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint morphology_pending_bare_is_nfc
    check (lemma_bare is nfc normalized),
  constraint morphology_pending_bare_charset
    check (
      strpos(lemma_bare, chr(769)) = 0
      and length(regexp_replace(lemma_bare, '[Ѐ-ӿ\-]', '', 'g')) = 0
      and length(lemma_bare) > 0
    )
);

create unique index if not exists morphology_pending_bare_pos_pending_uidx
  on morphology_pending (lemma_bare, (coalesce(pos, '')))
  where status = 'pending';

create index if not exists morphology_pending_status_idx
  on morphology_pending (status);


-- ============================================================
-- POURQUOI PAS lemmas_no_bare_vs_accented_dup ICI
-- ============================================================
-- Sur public.lemmas, UNE seule colonne `form` peut être nue OU accentuée :
-- l'EXCLUDE empêche deux LIGNES (nue + accentuée) pour la même base.
--
-- Sur morphology_lemmas, bare et stressed sont DEUX COLONNES de la MÊME
-- ligne. Le doublon « вагон vs ваго́н » ne se pose pas de la même façon :
--   • unicité (lemma_bare, pos, aspect) empêche deux têtes pour la même clé ;
--   • stress_status + contrainte stress_coherent lient bare ↔ stressed.
-- Recréer l'EXCLUDE gist sur lemma_stressed comme s'il était `form` serait
-- soit redondant, soit dangereux (deux senses / aspects légitimes).
-- Donc : NON reproduit. Garde-fous = UNIQUE bare+pos+aspect + CHECKs ci-dessus.
-- ============================================================


-- ============================================================
-- VÉRIFICATION POST-CRÉATION (lecture seule)
-- ============================================================

-- Tables présentes
select c.relname as table_name
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
  and c.relname in (
    'morphology_lemmas',
    'morphology_forms',
    'morphology_sense_overrides',
    'morphology_pending'
  )
order by 1;

-- Contraintes clés
select conrelid::regclass as table_name, conname, pg_get_constraintdef(oid) as def
from pg_constraint
where conrelid in (
  'morphology_lemmas'::regclass,
  'morphology_forms'::regclass,
  'morphology_sense_overrides'::regclass,
  'morphology_pending'::regclass
)
order by 1, 2;

-- Index
select tablename, indexname
from pg_indexes
where schemaname = 'public'
  and tablename like 'morphology_%'
order by 1, 2;

-- Pas de FK vers lemmas (doit retourner 0 ligne)
select
  tc.table_name,
  kcu.column_name,
  ccu.table_name as foreign_table
from information_schema.table_constraints tc
join information_schema.key_column_usage kcu
  on tc.constraint_name = kcu.constraint_name
join information_schema.constraint_column_usage ccu
  on ccu.constraint_name = tc.constraint_name
where tc.constraint_type = 'FOREIGN KEY'
  and tc.table_name like 'morphology_%'
  and ccu.table_name = 'lemmas';
