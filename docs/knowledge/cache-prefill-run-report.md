# Rapport d'exécution — préremplissage explanation_cache (11 textes gold)

> Exécuté le 2026-07-28 via `npm run cache:prefill-run` (réutilise `explainWord`
> tel quel, aucune duplication du pipeline LLM/cache).

## Résultat

| Indicateur | Valeur |
|---|---|
| Couples (mot, phrase) manquants au départ | 413 |
| Générés avec succès | 413 (412 au run 1, 1 au run de rattrapage) |
| Échecs définitifs | **0** |
| Audit de contrôle après coup (`npm run cache:prefill-audit`) | **540 / 540 en cache, 0 manquant** |

## Déroulé

1. **Run principal** — `npm run cache:prefill-run -- --concurrency=4` :
   - 413/413 mots traités, **412 générés, 1 échec**.
   - Durée : **456,7 s (~7,6 min)**.
   - Échec : `"где"` (dans *Как найти дорогу?*, phrase « Извини́те, где библиоте́ка? ») —
     `Réponse LLM invalide : le JSON retourné n'a pas pu être analysé` après les
     3 tentatives internes de `generateWordExplanation` (backoff 300 ms / 900 ms).
     Panne de formatage JSON passagère côté LLM, pas un problème de contenu.
2. **Run de rattrapage** — le script étant idempotent, relancé tel quel
   (`npm run cache:prefill-run -- --concurrency=2`) : il n'a re-traité que le
   seul mot manquant restant (`"где"`), qui a réussi en 2,3 s.
   → **Aucun échec définitif.**
3. **Vérification finale** — `npm run cache:prefill-audit` relancé : **540/540
   couples (mot, phrase) des 11 textes gold sont en cache, 0 manquant.**

## Temps et coût réels

| Indicateur | Estimé (audit) | Réel |
|---|---|---|
| Temps total | ~24,1 min (séquentiel, 3,5 s/appel) | **~7,6 min** (run principal, concurrence 4) + 2,3 s (rattrapage) |
| Appels LLM | 413 | 413 (412 réussis directement + 1 réussi après une régénération) |
| Coût indicatif | ~0,25 $ | Du même ordre (~0,25 $, modèle `gpt-4.1-mini`) — pas de compteur de tokens exposé par le SDK dans ce pipeline pour un chiffrage exact après coup |

Le temps réel est plus court que l'estimation séquentielle grâce à la
concurrence (`--concurrency=4`), sans erreur de rate-limit OpenAI observée.

## Journal détaillé

Chaque mot traité (surface, phrase, texte, résultat, durée) est journalisé
dans `docs/knowledge/cache-prefill-run-log.jsonl` (414 lignes : 413 succès +
1 échec initial sur `"где"`, régénéré ensuite avec succès).

## Vérification qualité — rôle fonctionnel dérivé du cas (override) vs rôle LLM brut

**Constat architectural (confirmé en lisant le code, `src/lib/orchestrator/index.ts`) :**
`explanation_cache.functional_role` / `function_color` stockent **toujours la
valeur brute du LLM**, écrite *avant* toute résolution de concept
(`storeExplanationInCache` est appelé avant `attachConceptResolution` dans le
chemin cache-miss). L'override déterministe (ex. instrumental → *moyen*,
teal) n'est **jamais réécrit en base** : il est recalculé **à chaque lecture**,
que ce soit un cache-miss (génération) ou un cache-hit (mot déjà en cache) —
`attachConceptResolution` est appelé identiquement dans les deux branches de
`explainWord` (lignes ~269 et ~293-310).

**Conséquence : c'est volontaire et sans danger.** Préremplir 413 lignes avec
les rôles LLM bruts est exactement ce qu'un clic utilisateur aurait produit
en cache-miss — l'override s'appliquera de la même façon à la lecture,
préremplissage ou pas.

**Vérification empirique** — échantillon de mots frais du run, comparaison
valeur brute en base vs réponse de `explainWord` (cache-hit, donc 0 appel LLM
pour ce contrôle) :

| Mot | Contexte | DB brut (role / color) | `explainWord` (role / color) | Résultat |
|---|---|---|---|---|
| `ка́ртой.` | « Он пла́тит ка́ртой. » — instrumental (moyen) | `manner` / `amber` | `instrument` / `teal` | **Override appliqué** ✅ |
| `идёт` | « Пото́м он идёт на ку́хню. » — verbe | `subject` / `blue` | *(vide)* / *(vide)* | **Override appliqué** (rôle neutralisé pour les verbes) ✅ |
| `где` | « Извини́те, где библиоте́ка? » — adverbe de lieu | `location` / `green` | `location` / `green` | Identique (pas de cas à corriger) |
| `Библиоте́ка` | « Библиоте́ка бу́дет сле́ва. » — sujet | `location` / `green` | `location` / `green` | Identique (imprécision LLM préexistante, hors périmètre de l'override instrumental) |
| `ко́фе` | « Пока́ ко́фе гото́вится… » — sujet | `subject` / `blue` | `subject` / `blue` | Identique |
| `ты` | « А ты ча́сто чита́ешь…? » — sujet | `subject` / `blue` | `subject` / `blue` | Identique |
| `хлеб` | « …покупа́ют хлеб и молоко́… » — objet direct | `object_direct` / `coral` | `object_direct` / `coral` | Identique |
| `ку́хню.` | « …идёт на ку́хню. » — destination (на + accusatif) | `location` / `green` | `location` / `green` | Identique |

**Conclusion :** l'override instrumental fonctionne et s'applique correctement
sur une entrée fraîchement préremplie (`ка́ртой.`), tout comme la
neutralisation du rôle pour les verbes (`идёт`). Les autres mots de
l'échantillon n'ont pas de correction déterministe à appliquer (seul le cas
instrumental a un override actif aujourd'hui) et affichent donc le même rôle
en base et à la lecture — c'est le comportement attendu.

**Point de vigilance identifié (hors périmètre de ce ticket, à traiter
séparément si besoin)** : `src/lib/vocabulary/prepare-and-persist-word-scenario.ts`
lit `functional_role` / `function_color` directement depuis
`explanation_cache` **sans** appliquer l'override instrumental (contrairement
à `explainWord` et à `get-vocabulary-entry.ts`, qui l'appliquent tous les
deux). Un mot instrumental composé via ce chemin afficherait donc le rôle LLM
brut. Aucun mot instrumental n'a été rencontré dans ce run qui emprunte ce
chemin spécifique, donc aucun impact immédiat, mais c'est à corriger si ce
chemin est amené à afficher le rôle fonctionnel à l'utilisateur.

## Contraintes respectées

- `explainWord` réutilisé tel quel, aucune duplication du pipeline LLM/cache.
- Aucune modification du Teaching Engine ni du design.
- Aucune forme russe modifiée manuellement — tout provient de la génération
  LLM standard, comme un clic utilisateur normal.
