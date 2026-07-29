-- ============================================================
-- GARDE-FOU DB — canonicalisation des lemmes (PROMPT CURSOR 28/07/2026)
-- À COLLER À LA MAIN dans le SQL Editor Supabase, ÉTAPE PAR ÉTAPE (pas de
-- CLI / migration automatique sur ce projet). Lire ce fichier en entier
-- avant de lancer quoi que ce soit : l'ÉTAPE 2 peut échouer si l'ÉTAPE 1
-- révèle des doublons résiduels — voir l'explication sous chaque bloc.
--
-- Objectif : empêcher STRUCTURELLEMENT qu'une forme SANS accent et sa
-- variante ACCENTUÉE (même mot) coexistent comme deux lignes distinctes
-- dans `lemmas` (cause racine de la dédup du 27/07/2026 : вагон/ваго́н,
-- человек/челове́к, читать/чита́ть, дорога/дорога́, Анна/А́нна).
--
-- ⚠️ POINT LINGUISTIQUE CRITIQUE — à ne jamais casser :
-- Certains mots russes ne diffèrent QUE par la POSITION de l'accent et sont
-- des mots DIFFÉRENTS : му́ка "tourment" / мука́ "farine", за́мок "château" /
-- замо́к "serrure". Un index qui fusionnerait ou rejetterait deux lignes
-- dès qu'elles partagent les mêmes lettres une fois l'accent retiré (sans
-- regarder SI un accent existe déjà de chaque côté) casserait ces paires.
-- Le garde-fou ci-dessous a été conçu spécifiquement pour l'éviter — voir
-- l'explication de l'ÉTAPE 2.
-- ============================================================


-- ============================================================
-- ÉTAPE 0 (optionnel) — BACKUP MANUEL avant toute modification de schéma.
-- Voir scripts/db-backup-manual.sql / docs/ops/manual-backup.md.
-- ============================================================


-- ============================================================
-- ÉTAPE 1 — DIAGNOSTIC (lecture seule). À exécuter et RELIRE avant l'étape 2.
-- ============================================================

-- 1.a Formes qui ne sont pas en NFC (devrait retourner 0 ligne — sinon,
--     l'étape 2b échouera : ces lignes doivent être renormalisées d'abord,
--     par ex. `update lemmas set form = normalize(form, nfc) where id = …`,
--     ligne par ligne après vérification qu'aucune collision n'en résulte).
select id, form
from lemmas
where not (form is nfc normalized);

-- 1.b Doublons résiduels "forme nue" vs "forme accentuée" du MÊME mot —
--     à corriger via l'outil de dédup existant (scripts/lemma-dedup-plan.ts
--     puis scripts/lemma-dedup-generate-execute-sql.ts) AVANT l'étape 2c,
--     sinon la contrainte EXCLUDE de l'étape 2c refusera d'être créée
--     (elle validerait les lignes existantes et trouverait ces conflits).
with base as (
  select
    id,
    form,
    replace(form, chr(769), '') as form_unaccented,
    (strpos(form, chr(769)) > 0) as has_accent
  from lemmas
)
select
  form_unaccented,
  array_agg(form order by has_accent, form) as forms,
  count(*) filter (where not has_accent) as bare_rows,
  count(distinct form) filter (where has_accent) as distinct_accented_forms
from base
group by form_unaccented
having count(*) > 1
   and count(*) filter (where not has_accent) > 0
   and count(distinct form) filter (where has_accent) > 0
order by form_unaccented;

-- 1.c Paires accentuées à positions DIFFÉRENTES partageant la même base —
--     PEUVENT être des mots légitimement distincts (style му́ка/мука́) OU des
--     erreurs d'accent de curation. NE JAMAIS fusionner automatiquement :
--     à vérifier mot par mot, manuellement, dans un dictionnaire russe,
--     avant toute action. Ce garde-fou ne touchera JAMAIS ces lignes (voir
--     étape 2c : la contrainte laisse sciemment passer ce cas).
with base as (
  select
    id,
    form,
    replace(form, chr(769), '') as form_unaccented,
    (strpos(form, chr(769)) > 0) as has_accent
  from lemmas
)
select
  form_unaccented,
  array_agg(distinct form) as distinct_accented_forms
from base
where has_accent
group by form_unaccented
having count(distinct form) > 1
order by form_unaccented;

-- État constaté le 28/07/2026 (260 lemmes) :
--   1.a → 0 ligne (toutes les formes sont déjà en NFC).
--   1.b → 12 groupes résiduels (день/де́нь, язык/язы́к, они/они́, каждый/ка́ждый,
--         кофе/ко́фе, суп/су́п, Олег/Оле́г, Луи/Луи́, уже/уже́, после/по́сле,
--         я/я́, пить/пи́ть) — À FUSIONNER via l'outil de dédup existant avant
--         de créer la contrainte de l'étape 2c (sinon elle échouera).
--   1.c → 4 paires accentuées à vérifier manuellement AVANT toute fusion
--         (болеть : бо́леть/боле́ть ; думать : ду́мать/дума́ть ; урок : у́рок/уро́к ;
--         домой : до́мой/домо́й) — ne pas toucher tant que le sens exact de
--         chaque forme n'est pas confirmé dans un dictionnaire russe fiable ;
--         si l'une s'avère être une simple erreur d'accent (et non un mot
--         distinct), la corriger comme une "corrupt-spelling fix" dans
--         scripts/lemma-dedup/compute-groups.ts, pas comme une dédup automatique.


-- ============================================================
-- ÉTAPE 2 — GARDE-FOU STRUCTUREL (à coller une fois l'étape 1 propre pour
-- 1.a et 1.b — 1.c peut rester non vide indéfiniment, ce n'est PAS bloquant :
-- ce sont des mots potentiellement distincts, pas des doublons).
-- ============================================================

-- 2.a Renforce l'UNIQUE(form) déjà existant (contrainte `lemmas_form_key`) :
--     garantit qu'aucune forme ne peut être stockée dans une normalisation
--     Unicode autre que NFC. Sans ce filet, deux représentations octet-à-octet
--     différentes de la MÊME chaîne visuelle (NFC vs NFD) pourraient
--     contourner l'UNIQUE(form) et créer un doublon invisible à l'œil nu.
alter table lemmas
  add constraint lemmas_form_is_nfc
  check (form is nfc normalized);

-- 2.b Colonnes générées, utilisées par 2c et par l'application (lecture
--     seule, recalculées automatiquement à chaque écriture — rien à maintenir).
alter table lemmas
  add column if not exists form_unaccented text
  generated always as (replace(form, chr(769), '')) stored;

alter table lemmas
  add column if not exists has_stress_mark boolean
  generated always as (strpos(form, chr(769)) > 0) stored;

-- 2.c LE garde-fou : empêche qu'une ligne SANS accent et une ligne AVEC
--     accent partagent la même base de lettres.
--
--     Pourquoi c'est sûr pour му́ка/мука́ : une contrainte EXCLUDE rejette
--     l'insertion d'une ligne SEULEMENT si TOUTES les conditions listées sont
--     vraies SIMULTANÉMENT pour une paire de lignes. Ici : (1) même
--     `form_unaccented`, ET (2) `has_stress_mark` DIFFÉRENT entre les deux
--     lignes (l'une true, l'autre false — via l'opérateur `<>`).
--     - му́ка (has_stress_mark = true) vs мука́ (has_stress_mark = true) :
--       condition (2) est FAUSSE (les deux sont true, pas "différents") →
--       AUCUN conflit, les deux peuvent coexister. ✔️
--     - вагон (has_stress_mark = false) vs ваго́н (has_stress_mark = true) :
--       (1) même base ET (2) true ≠ false → conflit détecté, la ligne en
--       double est refusée à l'insertion. ✔️ C'est exactement le bug corrigé.
--
--     Nécessite l'extension btree_gist (fournit le support GiST pour `=` sur
--     text et `<>` sur boolean, requis par une contrainte EXCLUDE).
create extension if not exists btree_gist;

alter table lemmas
  add constraint lemmas_no_bare_vs_accented_dup
  exclude using gist (form_unaccented with =, has_stress_mark with <>);


-- ============================================================
-- VÉRIFICATION — après l'étape 2, ces requêtes doivent NE RIEN retourner.
-- ============================================================

select conname, pg_get_constraintdef(oid)
from pg_constraint
where conrelid = 'lemmas'::regclass
  and conname in ('lemmas_form_is_nfc', 'lemmas_no_bare_vs_accented_dup');

-- Test manuel optionnel (dans une transaction qu'on annule tout de suite) :
-- à coller pour confirmer que le garde-fou fonctionne SANS toucher aux
-- données réelles.
--
-- begin;
--   insert into lemmas (form, pos) values ('вагон', 'unknown');   -- doit ÉCHOUER (ваго́н existe déjà)
--   insert into lemmas (form, pos) values ('тест', 'unknown');    -- doit RÉUSSIR (mot inédit, forme nue)
--   insert into lemmas (form, pos) values ('те́ст', 'unknown');   -- doit ÉCHOUER (accent vs la ligne nue "тест" créée juste au-dessus)
-- rollback;


-- ============================================================
-- ANNULATION — si le garde-fou doit être retiré (ex. faux positif imprévu
-- sur un vrai mot). À dérouler avec relecture avant chaque étape.
-- ============================================================

-- alter table lemmas drop constraint if exists lemmas_no_bare_vs_accented_dup;
-- alter table lemmas drop column if exists has_stress_mark;
-- alter table lemmas drop column if exists form_unaccented;
-- alter table lemmas drop constraint if exists lemmas_form_is_nfc;
