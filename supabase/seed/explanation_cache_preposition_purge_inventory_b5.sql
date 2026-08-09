-- ============================================================
-- B5 — Inventaire explanation_cache des prépositions (phase 3 purge)
-- Lecture seule. Les ~53 lignes signalées en Phase A (prépositions de
-- CURATED_PREPOSITION_GOVERNMENT présentes en cache gold) entrent dans
-- la purge phase 3 — ce SELECT les liste pour le rapport avant purge.
--
-- Appariement : surface normalisée = lower(trim) sans U+0301, contre la
-- liste nue des prépositions de régence (même source que
-- isCuratedPrepositionSurface / preposition-government.ts).
-- ============================================================

with preps as (
  select unnest(array[
    'до','из','от','у','без','для','после','около','кроме','вместо','против','среди',
    'к','по',
    'про','через','сквозь',
    'с','над','под','перед','за','между',
    'о','об','обо','при',
    'в','во','на'
  ]) as prep
)
select
  ec.id,
  ec.surface_word,
  replace(lower(ec.surface_word), chr(769), '') as surface_key,
  ec.sentence_example,
  ec.functional_role,
  ec.function_color,
  ec.lemma_id,
  l.form as lemma_form,
  ec.context_hash,
  ec.source,
  exists (
    select 1 from user_vocabulary uv
    where uv.explanation_cache_id = ec.id
  ) as referenced_by_user_vocabulary
from explanation_cache ec
left join lemmas l on l.id = ec.lemma_id
join preps p
  on replace(lower(trim(ec.surface_word)), chr(769), '') = p.prep
order by p.prep, ec.surface_word, ec.id;

-- Totaux
with preps as (
  select unnest(array[
    'до','из','от','у','без','для','после','около','кроме','вместо','против','среди',
    'к','по',
    'про','через','сквозь',
    'с','над','под','перед','за','между',
    'о','об','обо','при',
    'в','во','на'
  ]) as prep
)
select
  count(*) as prep_cache_rows,
  count(*) filter (
    where exists (
      select 1 from user_vocabulary uv
      where uv.explanation_cache_id = explanation_cache.id
    )
  ) as referenced_by_vocab
from explanation_cache
join preps p
  on replace(lower(trim(surface_word)), chr(769), '') = p.prep;
