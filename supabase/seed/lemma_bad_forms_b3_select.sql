-- ============================================================
-- B3 — LEMMES INEXISTANTS — RAPPORT AVANT (lecture seule)
-- NE PAS EXÉCUTER d'écriture ici. Backup manuel d'abord
-- (scripts/db-backup-manual.sql).
--
-- Cas :
--   ойти́     → идти́      (troncature ; surface идёшь — PAS пойти́)
--   моло́дый  → молодо́й   (accent faux — PAS une paire minimale légitime)
--   хото́ть   → хоте́ть    (lettre inventée ; surface хо́чешь)
--   свиде́ние → свида́ние  (lettre inventée ; surface свида́ния)
--
-- Canonicalisation existante (resolveOrCreateLemma /
-- lemma_canonicalization_guardrail) :
--   - fusionne seulement nue ↔ UNE accentuée (même base) ;
--   - NE fusionne JAMAIS deux formes accentuées à positions différentes
--     (garde бо́леть / боле́ть, му́ка / мука́, etc.).
-- Ces 4 cas ne sont PAS couverts par cette règle (troncature / faute
-- d'orthographe / accent erroné à corriger manuellement). Aucun script
-- ci-dessous ne touche бо́леть ni боле́ть.
-- ============================================================

-- Garde d'exclusion (lecture) : les deux lemmes légitimes doivent rester
-- deux lignes distinctes.
select id, form
from lemmas
where form in ('бо́леть', 'боле́ть')
order by form;

-- ---- Inventaire des 4 fautifs + cibles (si déjà présentes) ----
with probes as (
  select * from (values
    ('bad',  'ойти́'),
    ('good', 'идти́'),
    ('bad',  'моло́дый'),
    ('good', 'молодо́й'),
    ('good_bare', 'молодой'),
    ('bad',  'хото́ть'),
    ('good', 'хоте́ть'),
    ('good_bare', 'хотеть'),
    ('bad',  'свиде́ние'),
    ('good', 'свида́ние'),
    ('good_bare', 'свидание')
  ) as t(kind, form)
)
select
  p.kind,
  p.form as probe_form,
  l.id as lemma_id,
  l.form as lemma_form,
  l.pos,
  (select count(*) from word_forms wf where wf.lemma_id = l.id) as word_forms,
  (select count(*) from lemma_concept_links lcl where lcl.lemma_id = l.id) as lemma_concept_links,
  (select count(*) from user_vocabulary uv where uv.lemma_id = l.id) as user_vocabulary,
  (select count(*) from explanation_cache ec where ec.lemma_id = l.id) as explanation_cache,
  (select count(*) from linguistic_knowledge lk where lk.lemma_id = l.id) as linguistic_knowledge,
  (
    select count(*)
    from srs_reviews sr
    join user_vocabulary uv on uv.id = sr.user_vocabulary_id
    where uv.lemma_id = l.id
  ) as srs_reviews
from probes p
left join lemmas l on l.form = p.form
order by p.form, p.kind;

-- ---- Détail des dépendances pour chaque lemme fautif (s'il existe) ----
-- word_forms
select 'word_forms' as src, wf.*
from word_forms wf
join lemmas l on l.id = wf.lemma_id
where l.form in ('ойти́', 'моло́дый', 'хото́ть', 'свиде́ние')
order by l.form, wf.surface;

-- lemma_concept_links
select 'lemma_concept_links' as src, lcl.*
from lemma_concept_links lcl
join lemmas l on l.id = lcl.lemma_id
where l.form in ('ойти́', 'моло́дый', 'хото́ть', 'свиде́ние')
order by l.form;

-- user_vocabulary (horodatage = saved_at — pas de created_at sur cette table)
select 'user_vocabulary' as src, uv.id, uv.user_id, uv.lemma_id, uv.explanation_cache_id, uv.text_id, uv.saved_at, uv.notes
from user_vocabulary uv
join lemmas l on l.id = uv.lemma_id
where l.form in ('ойти́', 'моло́дый', 'хото́ть', 'свиде́ние')
order by l.form;

-- explanation_cache
select
  'explanation_cache' as src,
  ec.id,
  ec.lemma_id,
  l.form as lemma_form,
  ec.surface_word,
  ec.sentence_example,
  ec.functional_role,
  ec.function_color,
  ec.context_hash,
  ec.source
from explanation_cache ec
join lemmas l on l.id = ec.lemma_id
where l.form in ('ойти́', 'моло́дый', 'хото́ть', 'свиде́ние')
order by l.form, ec.surface_word;
