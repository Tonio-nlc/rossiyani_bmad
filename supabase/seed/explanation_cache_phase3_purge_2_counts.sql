-- ============================================================
-- PHASE 3 §2 — COMPTES PAR MOTIF + TOTAL DÉDUPLIQUÉ
-- Lecture seule. Noter total_dedup → v_expected du §3.
-- ============================================================

-- 2a) compte par motif (une ligne peut compter dans plusieurs motifs)
with
preps as (
  select unnest(array[
    'до','из','от','у','без','для','после','около','кроме','вместо','против','среди',
    'к','по','про','через','сквозь',
    'с','над','под','перед','за','между',
    'о','об','обо','при','в','во','на'
  ]) as prep
),
invariables as (
  select unnest(array[
    'и','а','но','или',
    'не','ни','же','ли','только','тоже','ещё',
    'очень','быстро','громко','медленно','часто','сразу','немного','много',
    'вместе','пешком','плохо','хорошо','прямо','темно','нужно','по-французски'
  ]) as word
),
numerals as (
  select unnest(array[
    'два','две','три','четыре','пять','шесть','семь','восемь','девять','десять',
    'одиннадцать','двенадцать','двадцать','тридцать','сорок',
    'пятьдесят','шестьдесят','семьдесят','восемьдесят','девяносто',
    'сто','двести','триста','четыреста','пятьсот','тысяча',
    'много','мало','несколько','сколько'
  ]) as num
),
pronoun_gen as (
  select unnest(array[
    'меня','тебя','него','неё','нее','нас','вас','них','себя','его','её','ее'
  ]) as form
),
b3_bad_lemmas as (
  select unnest(array['ойти́','моло́дый','хото́ть','свиде́ние']) as form
),
b4_mono as (
  select unnest(array[
    'я́','мы́','на́с','се́мь','де́нь','сто́л','су́п','вхо́д','пи́ть','вста́ть',
    'я','мы','нас','семь','день','стол','суп','вход','пить','встать'
  ]) as form
),
base as (
  select
    ec.id,
    ec.surface_word,
    ec.functional_role,
    ec.function_color,
    ec.sentence_example,
    ec.explanation_fr,
    ec.lemma_id,
    l.form as lemma_form,
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
  left join lemmas l on l.id = ec.lemma_id
  where regexp_replace(
          replace(lower(trim(ec.surface_word)), chr(769), ''),
          '[^а-яё\-]+', '', 'g'
        ) is distinct from 'картой'
),
flagged as (
  select
    b.*,
    (b.surface_key in (select form from pronoun_gen)
      and b.sentence_bare ~ ('(^|[^а-яё])у[[:space:]]+' || b.surface_key || '([^а-яё]|$)')) as m_a_u_pronoun,
    (b.sentence_bare ~ ('(^|[^а-яё])после[[:space:]]+' || b.surface_key || '([^а-яё]|$)')) as m_a_posle,
    (b.sentence_bare ~ ('(^|[^а-яё])без[[:space:]]+' || b.surface_key || '([^а-яё]|$)')) as m_a_bez,
    (exists (
      select 1 from numerals n
      where b.sentence_bare ~ ('(^|[^а-яё])' || n.num || '[[:space:]]+' || b.surface_key || '([^а-яё]|$)')
    )) as m_a_numeral,
    (b.surface_key = 'свидания'
      and b.sentence_bare ~ '(^|[^а-яё])до[[:space:]]+свидания([^а-яё]|$)') as m_a_fixed,
    (b.surface_key in ('молодой','десять','день')) as m_b_false_case,
    (b.functional_role = 'manner'
      and (
        b.surface_key in (select word from invariables)
        or b.surface_key = 'приятно'
        or (b.surface_key = 'очень'
            and b.sentence_bare ~ '(^|[^а-яё])очень[[:space:]]+приятно([^а-яё]|$)')
      )) as m_c_invariable_manner,
    (b.surface_key in (select prep from preps)) as m_d_preposition,
    (b.payload is not null
      and nullif(trim(b.payload->>'lemmaStressed'), '') is not null
      and b.lemma_form is not null
      and trim(b.payload->>'lemmaStressed') is distinct from b.lemma_form) as m_e_lemma_stressed,
    (b.surface_key = 'меня'
      and (coalesce(b.payload->>'translation', '') ~* '(^|[^[:alpha:]])je([^[:alpha:]]|$)'
           or b.explanation_fr ~* '(^|[^[:alpha:]])je([^[:alpha:]]|$)')) as m_f_menya_je,
    (b.surface_key = 'часов'
      and coalesce(b.payload->>'translation', '') ~* '(^|[^[:alpha:]])heure([^[:alpha:]]|$)'
      and coalesce(b.payload->>'translation', '') !~* 'heures') as m_f_chasov_sg,
    (b.lemma_form in (select form from b3_bad_lemmas)
      or b.surface_key in (select replace(form, chr(769), '') from b3_bad_lemmas)) as m_g_b3,
    (b.lemma_form in (select form from b4_mono)
      or b.surface_key in (select replace(lower(form), chr(769), '') from b4_mono)) as m_g_b4
  from base b
)
,
long as (
  select id, 'a_u_pronoun_possession' as motif from flagged where m_a_u_pronoun
  union all select id, 'a_posle_time' from flagged where m_a_posle
  union all select id, 'a_bez_clear' from flagged where m_a_bez
  union all select id, 'a_numeral_quantity' from flagged where m_a_numeral
  union all select id, 'a_do_svidaniya_fixed' from flagged where m_a_fixed
  union all select id, 'b_false_case_claim' from flagged where m_b_false_case
  union all select id, 'c_invariable_manner' from flagged where m_c_invariable_manner
  union all select id, 'd_preposition' from flagged where m_d_preposition
  union all select id, 'e_lemma_stressed_mismatch' from flagged where m_e_lemma_stressed
  union all select id, 'f_gloss_menya_je' from flagged where m_f_menya_je
  union all select id, 'f_gloss_chasov_singular' from flagged where m_f_chasov_sg
  union all select id, 'g_b3_bad_lemma' from flagged where m_g_b3
  union all select id, 'g_b4_monosyllable' from flagged where m_g_b4
)
select motif, count(*) as rows_with_motif
from long
group by motif
order by motif;

-- 2b) total dédupliqué + multi + FK vocab
with
preps as (
  select unnest(array[
    'до','из','от','у','без','для','после','около','кроме','вместо','против','среди',
    'к','по','про','через','сквозь',
    'с','над','под','перед','за','между',
    'о','об','обо','при','в','во','на'
  ]) as prep
),
invariables as (
  select unnest(array[
    'и','а','но','или',
    'не','ни','же','ли','только','тоже','ещё',
    'очень','быстро','громко','медленно','часто','сразу','немного','много',
    'вместе','пешком','плохо','хорошо','прямо','темно','нужно','по-французски'
  ]) as word
),
numerals as (
  select unnest(array[
    'два','две','три','четыре','пять','шесть','семь','восемь','девять','десять',
    'одиннадцать','двенадцать','двадцать','тридцать','сорок',
    'пятьдесят','шестьдесят','семьдесят','восемьдесят','девяносто',
    'сто','двести','триста','четыреста','пятьсот','тысяча',
    'много','мало','несколько','сколько'
  ]) as num
),
pronoun_gen as (
  select unnest(array[
    'меня','тебя','него','неё','нее','нас','вас','них','себя','его','её','ее'
  ]) as form
),
b3_bad_lemmas as (
  select unnest(array['ойти́','моло́дый','хото́ть','свиде́ние']) as form
),
b4_mono as (
  select unnest(array[
    'я́','мы́','на́с','се́мь','де́нь','сто́л','су́п','вхо́д','пи́ть','вста́ть',
    'я','мы','нас','семь','день','стол','суп','вход','пить','встать'
  ]) as form
),
base as (
  select
    ec.id,
    ec.surface_word,
    ec.functional_role,
    ec.function_color,
    ec.sentence_example,
    ec.explanation_fr,
    ec.lemma_id,
    l.form as lemma_form,
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
  left join lemmas l on l.id = ec.lemma_id
  where regexp_replace(
          replace(lower(trim(ec.surface_word)), chr(769), ''),
          '[^а-яё\-]+', '', 'g'
        ) is distinct from 'картой'
),
flagged as (
  select
    b.*,
    (b.surface_key in (select form from pronoun_gen)
      and b.sentence_bare ~ ('(^|[^а-яё])у[[:space:]]+' || b.surface_key || '([^а-яё]|$)')) as m_a_u_pronoun,
    (b.sentence_bare ~ ('(^|[^а-яё])после[[:space:]]+' || b.surface_key || '([^а-яё]|$)')) as m_a_posle,
    (b.sentence_bare ~ ('(^|[^а-яё])без[[:space:]]+' || b.surface_key || '([^а-яё]|$)')) as m_a_bez,
    (exists (
      select 1 from numerals n
      where b.sentence_bare ~ ('(^|[^а-яё])' || n.num || '[[:space:]]+' || b.surface_key || '([^а-яё]|$)')
    )) as m_a_numeral,
    (b.surface_key = 'свидания'
      and b.sentence_bare ~ '(^|[^а-яё])до[[:space:]]+свидания([^а-яё]|$)') as m_a_fixed,
    (b.surface_key in ('молодой','десять','день')) as m_b_false_case,
    (b.functional_role = 'manner'
      and (
        b.surface_key in (select word from invariables)
        or b.surface_key = 'приятно'
        or (b.surface_key = 'очень'
            and b.sentence_bare ~ '(^|[^а-яё])очень[[:space:]]+приятно([^а-яё]|$)')
      )) as m_c_invariable_manner,
    (b.surface_key in (select prep from preps)) as m_d_preposition,
    (b.payload is not null
      and nullif(trim(b.payload->>'lemmaStressed'), '') is not null
      and b.lemma_form is not null
      and trim(b.payload->>'lemmaStressed') is distinct from b.lemma_form) as m_e_lemma_stressed,
    (b.surface_key = 'меня'
      and (coalesce(b.payload->>'translation', '') ~* '(^|[^[:alpha:]])je([^[:alpha:]]|$)'
           or b.explanation_fr ~* '(^|[^[:alpha:]])je([^[:alpha:]]|$)')) as m_f_menya_je,
    (b.surface_key = 'часов'
      and coalesce(b.payload->>'translation', '') ~* '(^|[^[:alpha:]])heure([^[:alpha:]]|$)'
      and coalesce(b.payload->>'translation', '') !~* 'heures') as m_f_chasov_sg,
    (b.lemma_form in (select form from b3_bad_lemmas)
      or b.surface_key in (select replace(form, chr(769), '') from b3_bad_lemmas)) as m_g_b3,
    (b.lemma_form in (select form from b4_mono)
      or b.surface_key in (select replace(lower(form), chr(769), '') from b4_mono)) as m_g_b4
  from base b
)
,
targets as (
  select id,
    (select count(*) from (
      select unnest(array[
        m_a_u_pronoun, m_a_posle, m_a_bez, m_a_numeral, m_a_fixed,
        m_b_false_case, m_c_invariable_manner, m_d_preposition,
        m_e_lemma_stressed, m_f_menya_je, m_f_chasov_sg, m_g_b3, m_g_b4
      ]) as hit
    ) s where hit) as motif_count
  from flagged
  where 
    m_a_u_pronoun or m_a_posle or m_a_bez or m_a_numeral or m_a_fixed
    or m_b_false_case or m_c_invariable_manner or m_d_preposition
    or m_e_lemma_stressed or m_f_menya_je or m_f_chasov_sg
    or m_g_b3 or m_g_b4

)
select
  (select count(*) from targets) as total_dedup,
  (select count(*) from targets where motif_count > 1) as multi_motif_rows,
  (
    select count(*) from user_vocabulary uv
    where uv.explanation_cache_id in (select id from targets)
  ) as referenced_by_user_vocabulary;
