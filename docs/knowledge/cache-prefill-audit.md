# Audit préremplissage — explanation_cache (11 textes gold)

> Généré le 2026-07-28T16:33:21.479Z par `scripts/cache-prefill-audit.ts`.
> Lecture seule — aucune écriture en base, aucun appel LLM dans ce ticket.

## Objectif

Mesurer, avant toute génération de masse, combien de couples (mot affiché,
phrase) des 11 textes gold ont déjà une explication en cache et combien
manquent — pour chiffrer le coût d'un préremplissage complet du pilote.

## Méthodologie

- **Périmètre** : les 11 textes Rossiyani (`ROSSIYANI_TEXT_TITLES`,
  `src/lib/knowledge/bootstrap/types.ts`), identifiés par `texts.title`
  (pas de colonne `is_gold` dédiée — ce sont les seuls textes `source = 'curated'`
  de la bibliothèque pilote).
- **Phrases** : `content_annotated.sentences[].text` si présent, sinon repli
  `splitIntoSentences(content)` — exactement le même repli que `TextBody.tsx`
  (Reader).
- **Mots cliquables** : `tokenizeSentence(phrase)` (découpe sur les espaces,
  garde la ponctuation collée au mot, ex. `окна́.`) puis ne retient que les
  tokens où `normalizeToken(token).length > 0` — identique à `Sentence.tsx`.
  La ponctuation isolée (`—`, `«`, `»`…) n'est pas cliquable et n'est donc
  pas comptée.
- **Clé de cache** : `context_hash = sha256(surface.toLowerCase() + "::" +
  phrase.trim().toLowerCase())` (`computeContextHash`,
  `src/lib/orchestrator/hasher.ts`) — **identique** au calcul fait par
  `explainWord` sur un vrai clic. Une même surface dans deux phrases
  différentes = deux clés distinctes. La casse est neutralisée mais pas
  l'accent tonique (´) : `А́нной` ≠ `Анной`.
- **Cache existant** : lecture de `explanation_cache.context_hash` par lots
  de 150 (`.in(...)`), aucune écriture.

## Résultat global

| Indicateur | Valeur |
|---|---|
| Textes gold trouvés en base | 11 / 11 |
| Couples (mot, phrase) distincts (dédupliqués globalement) | 540 |
| Déjà en cache (hit) | 540 (100.0 %) |
| Manquants (à générer) | 0 (0.0 %) |
| Somme des colonnes "distinct" par texte (avant dédup inter-textes) | 540 |

> Aucun couple identique partagé entre deux textes (somme par texte = total global).

## Répartition par texte

| Texte | Phrases | Distinct | Déjà en cache | Manquants | Source phrases |
|---|---:|---:|---:|---:|---|
| В метро | 8 | 53 | 53 | 0 | `content_annotated` |
| По дороге | 8 | 37 | 37 | 0 | `content_annotated` |
| Первый кофе | 9 | 44 | 44 | 0 | `content_annotated` |
| В магазине | 10 | 41 | 41 | 0 | `content_annotated` |
| Дома вечером | 9 | 43 | 43 | 0 | `content_annotated` |
| Первый день в университете | 13 | 55 | 55 | 0 | `content_annotated` |
| В булочной | 12 | 46 | 46 | 0 | `content_annotated` |
| Знакомство | 12 | 41 | 41 | 0 | `content_annotated` |
| У врача | 12 | 52 | 52 | 0 | `content_annotated` |
| Как найти дорогу? | 12 | 46 | 46 | 0 | `content_annotated` |
| Обычный день студента | 14 | 82 | 82 | 0 | `content_annotated` |

## Coût estimé du préremplissage complet

Estimation grossière — un appel LLM manquant ≈ le pipeline `explainWord`
au clic (cache miss) : `generateWordExplanation` (1 à 3 tentatives) +
`resolveOrCreateLemma` + écriture cache.

| Indicateur | Valeur |
|---|---|
| Appels LLM nécessaires | 0 |
| Temps total estimé (3.5 s / appel, séquentiel) | 0 s |
| Tokens d'entrée estimés / appel (prompt système + mot + phrase) | ~674 |
| Tokens de sortie estimés / appel (JSON réponse) | ~200 |
| Volume total de tokens estimé | ~0 (0 entrée + 0 sortie) |
| Coût indicatif (modèle gpt-4.1-mini — $0.4/1M entrée, $1.6/1M sortie) | ~$0.00 |

> Estimation approximative (règle chars/4, propre au prompt système en
> français) — le russe (cyrillique) consomme généralement plus de tokens
> par caractère que le français ; le volume réel peut être un peu
> supérieur. Prix indicatif au tarif standard (hors Batch API, qui
> diviserait le coût par 2, et hors cache de prompt).

## Prochaine étape

Aucune entrée manquante — le cache des 11 textes gold est complet. Un clic sur n'importe quel mot de ces textes est un cache hit (~250 ms).

