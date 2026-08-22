-- ============================================================
-- PURGE PROSE — SELECT de repérage (après fusion accents)
-- Cible : explanation_cache dont lemmaStressed = forme DROP (accent faux).
-- Compte attendu Phase A + mesure 2026-08-22 : **6**
--   бо́леть, дума́ть, и́дти, моло́дой, се́бя, спраши́вать
-- Hors cible :
--   моло́ко DROP avait 1 EC avec lemmaStressed=молоко́ (correct) → pas ici
--   orphelins и́нтересный / про́блема / те́мно : 0 EC
-- UV Mario (боли́т) référence 83e099e6… → détachée au DELETE (§2).
-- ============================================================

with drop_forms as (
  select unnest(array[
    'бо́леть',
    'дума́ть',
    'и́дти',
    'и́нтересный',
    'моло́дой',
    'моло́ко',
    'про́блема',
    'се́бя',
    'спраши́вать',
    'те́мно'
  ]) as form
),
targets as (
  select
    ec.id,
    ec.lemma_id,
    ec.surface_word,
    ec.sentence_example,
    l.form as lemma_form_now,
    case
      when left(trim(ec.explanation_fr), 1) = '{'
        then ec.explanation_fr::jsonb->>'lemmaStressed'
      else null
    end as lemma_stressed
  from explanation_cache ec
  left join lemmas l on l.id = ec.lemma_id
)
select
  t.id,
  t.surface_word,
  t.lemma_form_now,
  t.lemma_stressed,
  t.sentence_example,
  exists (
    select 1 from user_vocabulary uv
    where uv.explanation_cache_id = t.id
  ) as referenced_by_user_vocabulary
from targets t
where t.lemma_stressed in (select form from drop_forms)
order by t.lemma_stressed, t.surface_word;

-- Compte (doit = 6 avant purge ; 0 après)
select count(*) as purge_count
from explanation_cache ec
where left(trim(ec.explanation_fr), 1) = '{'
  and ec.explanation_fr::jsonb->>'lemmaStressed' in (
    'бо́леть', 'дума́ть', 'и́дти', 'и́нтересный', 'моло́дой',
    'моло́ко', 'про́блема', 'се́бя', 'спраши́вать', 'те́мно'
  );
