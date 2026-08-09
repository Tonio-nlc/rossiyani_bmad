-- ============================================================
-- PHASE 3 §1 — SELECT DE REPÉRAGE (tous motifs, 1 ligne / id)
-- EXCLUS : картой. Multi-motifs : colonne all_motifs + multi_flag.
-- Lecture seule.
-- ============================================================

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
with_motifs as (
  select
    f.*,
    array_remove(array[
      case when m_a_u_pronoun then 'a_u_pronoun_possession' end,
      case when m_a_posle then 'a_posle_time' end,
      case when m_a_bez then 'a_bez_clear' end,
      case when m_a_numeral then 'a_numeral_quantity' end,
      case when m_a_fixed then 'a_do_svidaniya_fixed' end,
      case when m_b_false_case then 'b_false_case_claim' end,
      case when m_c_invariable_manner then 'c_invariable_manner' end,
      case when m_d_preposition then 'd_preposition' end,
      case when m_e_lemma_stressed then 'e_lemma_stressed_mismatch' end,
      case when m_f_menya_je then 'f_gloss_menya_je' end,
      case when m_f_chasov_sg then 'f_gloss_chasov_singular' end,
      case when m_g_b3 then 'g_b3_bad_lemma' end,
      case when m_g_b4 then 'g_b4_monosyllable' end
    ], null) as motifs
  from flagged f
)
select
  id,
  surface_word,
  functional_role,
  function_color,
  motifs[1] as motif,
  motifs as all_motifs,
  cardinality(motifs) as motif_count,
  case when cardinality(motifs) > 1 then 'MULTI' else 'single' end as multi_flag,
  lemma_form,
  left(sentence_example, 80) as sentence_preview
from with_motifs
where cardinality(motifs) > 0
order by motif, surface_word, id;
