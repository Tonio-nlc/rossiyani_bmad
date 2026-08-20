-- ============================================================
-- PURGE CIBLÉE §2 — COMPTES PAR MOTIF + TOTAL DÉDUPLIQUÉ
-- Lecture seule. Noter total_dedup → coller dans §3 v_expected.
-- ============================================================

with
numerals as (
  select unnest(array[
    'два','две','три','четыре','пять','шесть','семь','восемь','девять','десять',
    'одиннадцать','двенадцать','двадцать','тридцать','сорок',
    'пятьдесят','шестьдесят','семьдесят','восемьдесят','девяносто',
    'сто','двести','триста','четыреста','пятьсот','тысяча',
    'много','мало','несколько','сколько'
  ]) as num
),
pronoun_oblique as (
  select unnest(array[
    'меня','тебя','него','неё','нее','нас','вас','них','себя',
    'его','её','ее','мной','тобой','им','ей','ими','ними','ней'
  ]) as form
),
base as (
  select
    ec.id,
    regexp_replace(
      replace(lower(trim(ec.surface_word)), chr(769), ''),
      '[^а-яё\-]+', '', 'g'
    ) as surface_key,
    replace(lower(ec.sentence_example), chr(769), '') as sentence_bare,
    case
      when left(trim(ec.explanation_fr), 1) = '{'
        then ec.explanation_fr::jsonb
      else null
    end as payload
  from explanation_cache ec
),
flagged as (
  select
    b.id,
    (b.surface_key in (select form from pronoun_oblique)
      and b.sentence_bare ~ ('(^|[^а-яё])у[[:space:]]+' || b.surface_key || '([^а-яё]|$)'))
      as m_gen_u_pronoun,
    (b.sentence_bare ~ ('(^|[^а-яё])после[[:space:]]+' || b.surface_key || '([^а-яё]|$)'))
      as m_gen_posle,
    (b.sentence_bare ~ ('(^|[^а-яё])из[[:space:]]+' || b.surface_key || '([^а-яё]|$)'))
      as m_gen_iz,
    (b.sentence_bare ~ ('(^|[^а-яё])без[[:space:]]+' || b.surface_key || '([^а-яё]|$)'))
      as m_gen_bez,
    (exists (
      select 1 from numerals n
      where b.sentence_bare ~
        ('(^|[^а-яё])' || n.num || '[[:space:]]+' || b.surface_key || '([^а-яё]|$)')
    )) as m_gen_numeral,
    (b.surface_key = 'свидания'
      and b.sentence_bare ~ '(^|[^а-яё])до[[:space:]]+свидания([^а-яё]|$)')
      as m_gen_do_svidaniya,
    (b.surface_key = 'тоже') as m_tozhe,
    (b.surface_key in (select form from pronoun_oblique)
      and coalesce(b.payload->>'translation', '')
          ~* '(^|[^[:alpha:]])(je|tu|il|elle|nous|vous|ils|elles|on|soi)([^[:alpha:]]|$)')
      as m_gloss_pronoun_nominative_fr,
    (b.surface_key = 'часов'
      and coalesce(b.payload->>'translation', '') ~* '(^|[^[:alpha:]])heure([^[:alpha:]]|$)'
      and coalesce(b.payload->>'translation', '') !~* 'heures')
      as m_gloss_chasov_singular
  from base b
),
long as (
  select id, motif
  from flagged
  cross join lateral (
    values
      (m_gen_u_pronoun, 'gen_u_pronoun'),
      (m_gen_posle, 'gen_posle'),
      (m_gen_iz, 'gen_iz'),
      (m_gen_bez, 'gen_bez'),
      (m_gen_numeral, 'gen_numeral'),
      (m_gen_do_svidaniya, 'gen_do_svidaniya'),
      (m_tozhe, 'tozhe'),
      (m_gloss_pronoun_nominative_fr, 'gloss_pronoun_nominative_fr'),
      (m_gloss_chasov_singular, 'gloss_chasov_singular')
  ) as v(flag, motif)
  where flag
)
select motif, count(*) as n
from long
group by motif

union all

select 'TOTAL_DEDUP (ids uniques)' as motif, count(distinct id) as n
from long

order by case when motif like 'TOTAL%' then 1 else 0 end, motif;
