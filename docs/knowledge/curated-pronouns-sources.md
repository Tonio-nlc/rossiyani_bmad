# Pronoms personnels curés — sources, paradigmes, règles de rôle

Ticket : « Curer les pronoms personnels (supplétion + rôle sans segmentation LLM) ».

## 1. Bug corrigé

`меня́` (« У меня́ боли́т го́рло ») était :
1. **segmenté** par le LLM en `мен-` + désinence `-я` — faux : `меня́` est une
   forme **supplétive** du pronom `я` (le radical change entièrement selon le
   cas, comme *go/went* en anglais), pas une désinence régulière décomposable ;
2. **étiqueté** avec un rôle proche de « possession/appartient à » — faux :
   `меня́` reste le pronom personnel « je » au génitif, jamais un déterminant
   possessif (« mon/ma/mes » = `мой/моя́/моё/мои́`, un mot différent).

Même famille de bug que `нашёл` (désinence inventée « -ёл », corrigée par
`getCuratedPastTenseSuffix`) et `никто́` (désinence inventée) : un ensemble
**fermé et connu** (9 pronoms personnels/réfléchi × 6 cas) ne devrait jamais
dépendre d'une devinette LLM. Solution : le curer à la main, comme la
morphologie verbale (`morphology/curated/present-verbs.ts`).

## 2. Sources vérifiées (croisées)

Paradigme vérifié contre 4 sources indépendantes, toutes concordantes sur les
formes ET les accents toniques :

- OpenRussian — <https://en.openrussian.org/ru/%D1%8F> (я : меня́/мне/мной/мне)
- Wikipedia, *Russian grammar*, section Pronouns — <https://en.wikipedia.org/wiki/Russian_grammar>
  (table complète des 8 pronoms + réfléchi, avec accents)
- Elon.io, *Personal Pronouns and Their Declension* — <https://elon.io/grammar/russian/pronouns/personal/forms>
  (table complète + règle н- explicite)
- learnrussianstepbystep.com, *Russian pronouns — Declension charts*
  (confirme la variante д'instrumental е́ю pour она́, et тобо́й/на́ми/ва́ми/и́ми)

Toutes les formes du module `src/lib/knowledge/morphology/curated/pronouns.ts`
sont reprises telles quelles depuis ce recoupement (aucune n'a été inventée ou
generée par LLM).

## 3. Paradigme complet (formes retenues)

| | Nom. | Gén. | Dat. | Acc. | Instr. | Prép. |
|---|---|---|---|---|---|---|
| я | я | меня́ | мне | меня́ | мной (мно́ю) | мне |
| ты | ты | тебя́ | тебе́ | тебя́ | тобо́й (тобо́ю) | тебе́ |
| он | он | его́ (него́) | ему́ (нему́) | его́ (него́) | им (ним) | (о) нём |
| она́ | она́ | её (неё) | ей (ней) | её (неё) | ей/е́ю (ней) | (о) ней |
| оно́ | оно́ | его́ (него́) | ему́ (нему́) | его́ (него́) | им (ним) | (о) нём |
| мы | мы | нас | нам | нас | на́ми | (о) нас |
| вы | вы | вас | вам | вас | ва́ми | (о) вас |
| они́ | они́ | их (них) | им (ним) | их (них) | и́ми (ни́ми) | (о) них |
| себя́ | — | себя́ | себе́ | себя́ | собо́й (собо́ю) | (о) себе́ |

Formes entre parenthèses = variante **н-** obligatoire après préposition,
réservée à `он/она́/оно́/они́` (jamais `я/ты/мы/вы/себя́` : *с тобо́й*, jamais
*с нтобо́й*). Le prépositionnel de `он/она́/оно́/они́` n'a pas de forme « sans
н » : ce cas n'existe jamais sans préposition régissante.

## 4. Où segmentation et rôle sont déterminés (diagnostic, avant modification)

- **Segmentation (`suffix`/`suffixExplanation`)** : normalement fournie par le
  LLM (`generateWordExplanation`, `orchestrator/llm.ts`), sauf override
  déterministe. `orchestrator/index.ts::attachConceptResolution` efface déjà
  `suffix` quand `POS_WITHOUT_RELIABLE_SUFFIX.has(partOfSpeech)` (inclut
  `"pronoun"`) — **mais seulement si un `profile` complet existe** avec
  `partOfSpeech === "pronoun"`. Bug : quand `linguistic_knowledge` n'est pas
  encore bootstrappée pour le lemme (`profile === null`, cas de `меня́`), la
  fonction retourne tôt (ligne `!profile?.partOfSpeech && !curatedSurface`)
  **sans jamais toucher `suffix`** → la désinence brute du LLM survit.
- **Rôle fonctionnel (`functionalRole`/`functionColor`)** : fourni par le LLM,
  sauf override déterministe existant pour l'instrumental
  (`deriveInstrumentRoleOverride`, `concept-graph/resolve-reader-concept.ts`),
  qui réutilise `detectReliableCase` (paradigmes `linguistic_knowledge` →
  formes curées → régence prépositionnelle `detectPrepositionGovernment`).
  Aucun override équivalent n'existait pour les pronoms → rôle 100 % LLM.

**Mécanisme réutilisé** (aucun parallèle créé) :
- `detectReliableCase` (cas fiable, régence incluse)
- `disambiguateCase` (désambiguïsation cas syncrétiques, déjà utilisée pour
  `стол` nom/acc et `врача́` acc/gén — étendue avec 2 règles génériques,
  ci-dessous)
- `getPrecedingPrepositionEntry` (nouveau petit export à côté de
  `detectPrepositionGovernment`, même fichier, même logique de recherche du
  mot précédent)

## 5. Câblage

1. `src/lib/knowledge/morphology/curated/pronouns.ts` (nouveau) : paradigme
   fermé + `getPronounCaseCandidates(surface)` (cas candidats pour une forme)
   + `isCuratedPronounSurface(surface)`.
2. `concept-graph/case-concept-routing.ts::inferMorphologicalCase` : les
   formes de pronoms curés sont vérifiées **en priorité**, avant les
   paradigmes `linguistic_knowledge` et les formes curées de noms — un
   paradigme fermé écrit à la main est plus fiable qu'un bootstrap encore
   incomplet. `disambiguateCase` (désormais exportée) reçoit deux
   améliorations génériques (aucune régression sur les noms, cf. §7) :
   - le prépositionnel est retiré des candidats s'il n'y a **aucun** signal de
     régence (ni `governmentCase`, ni `governmentCandidateCases`) — le cas
     prépositionnel n'existe jamais sans préposition régissante ;
   - une préposition *sense-dependent* (с/за/под…) non tranchée en amont
     (cas encore inconnu) est quand même **intersectée** avec les candidats du
     mot ; si un seul cas survit, il est retenu (ex. `с ней` : с =
     instrumental|génitif, ней = datif|instrumental|prépositionnel →
     instrumental, sans ambiguïté).
3. `concept-graph/resolve-reader-concept.ts` :
   - `detectReliableCase` calcule maintenant aussi
     `governmentCandidateCases` via le nouvel export
     `getPrecedingPrepositionEntry` (curated/detect-preposition-government.ts).
   - nouvelle fonction `derivePronounRoleOverride` : mappe le cas résolu vers
     rôle/couleur (table fixe, §6), retourne `null` si la surface n'est pas un
     pronom curé (aucun effet sur le reste du vocabulaire).
4. `orchestrator/index.ts::attachConceptResolution` : nouvelle fonction
   `applyPronounRoleOverride` — pour une surface de pronom curée, force
   `partOfSpeech = "pronoun"`, efface `suffix`/`suffixExplanation`, applique
   `derivePronounRoleOverride`. Appelée à **chaque** point de retour de la
   fonction (y compris les retours anticipés sans `profile`, exactement le
   scénario du bug `меня́`) via `applyDeterministicRoleOverride` (priorise le
   pronom curé, sinon override instrumental classique inchangé).
5. `vocabulary/get-vocabulary-entry.ts` : même override appliqué à
   `contextEncounter` (carte « rencontre »), pour que les 3 surfaces (Reader,
   Explorer, vocabulaire) restent cohérentes — même schéma que l'override
   instrumental existant.

## 6. Règle de rôle fonctionnel par cas (jamais une devinette LLM)

| Cas | Rôle | Couleur | Justification |
|---|---|---|---|
| Nominatif | `subject` | bleu | sujet — sans ambiguïté pour un pronom |
| Accusatif | `object_direct` | corail | objet direct |
| Datif | `object_indirect` | ambre | destinataire |
| Génitif | `location` | vert | **jamais `possession`** — un pronom personnel n'est jamais un déterminant possessif (mon/ton/son = `мой/твой/его́` un mot différent). Réutilise le rôle déjà retenu par cette appli pour « у/до/из/от/без + génitif » (prompt LLM : « Complément de lieu (avec на, в, у, к…) → location »), y compris pour la construction possessive-existentielle « у меня́ есть » (littéralement « à moi/chez moi il y a ») : la forme reste au génitif, le rôle affiché reste cohérent avec celui des noms après « у ». |
| Instrumental | `instrument` | teal | identique à `deriveInstrumentRoleOverride` (6e rôle, déjà en place) |
| Prépositionnel | `location` | vert | cohérent avec le génitif ci-dessus (о/об/при + prépositionnel = lieu/sujet dont on parle) |

Le champ `explanation` (prose LLM, « pourquoi ce mot a cette forme ici ») n'est
**jamais** modifié : seuls la forme du badge de terminaison et le
rôle/couleur viennent du curé.

## 7. Désambiguïsation des syncrétismes (formes partagées)

Les pronoms russes partagent massivement des formes entre cas (« syncrétisme »)
— géré par `disambiguateCase`, dans cet ordre :
1. régence univoque détectée (`у`, `без`, `к`, `о`… — un seul cas possible) ;
2. intersection avec une régence *sense-dependent* non tranchée (`с`, `за`,
   `под`) ;
3. rôle fonctionnel du LLM (`object_direct`→accusatif, `subject`→nominatif) ;
4. mention explicite du cas dans la prose LLM ;
5. heuristiques de repli par paire :
   - accusatif = génitif (tous les pronoms) → **accusatif** (déjà la règle
     existante pour les noms animés, ex. `врача́`) ;
   - nominatif = accusatif → **nominatif** (règle existante, inchangée) ;
   - datif = instrumental (`ей`/`ней` pour `она́`, hors régence tranchée) →
     **datif** (nouvelle règle, ci-dessous — limite documentée).

Aucune de ces règles n'affecte les noms existants (`стол`, `врача́`…) : les
deux nouvelles règles (pruning du prépositionnel sans régence, repli
datif/instrumental) ne se déclenchent que sur des ensembles de candidats qui
n'apparaissent aujourd'hui que pour les pronoms. Vérifié par
régression (§9).

## 8. Limites connues (documentées, pas bloquantes)

- **`ей`/`ней` (она́) datif vs instrumental sans régence tranchée** : par
  défaut, résolu en **datif** (complément d'attribution sans préposition,
  plus fréquent en lecture A1-A2 que l'instrumental sans préposition). Avec
  une régence explicite (`к ней` → datif, `с ней` → instrumental via
  intersection sense-dependent, `о ней` → prépositionnel), la résolution est
  fiable à 100 %.
- **`им` (singulier `он`/`оно́` instrumental) vs `им` (pluriel `они́` datif)** :
  collision de surface entre deux LEMMES différents, non désambiguïsable par
  le seul mot (nécessiterait l'accord du verbe/sujet, hors scope). Repli par
  défaut : datif (même heuristique que ci-dessus). Non testé par le ticket
  (`меня́, тебя́, его́/него́, ей/ней, себя́, нас, них` — `им` seul n'y figure
  pas).
- **`его́/её/их` comme déterminant possessif invariable** (« его́ кни́га » = «
  son livre ») : cette 2e fonction grammaticale de ces 3 formes (distincte de
  leur usage comme pronom personnel génitif/accusatif) n'est **pas**
  distinguée ici — nécessiterait de repérer si le mot suivant est un nom
  qu'il modifie (analyse syntaxique hors scope actuel). Dans ce cas
  précis, un rôle `possession` serait en réalité correct (contrairement à
  `меня́/тебя́/нас/вас/себя́`, qui ne sont **jamais** des déterminants
  possessifs). Limite acceptée : le mot continuera d'être traité comme un
  pronom personnel (génitif/accusatif → location/object_direct) même dans son
  emploi possessif. Amélioration future si un texte gold l'expose.

## 9. Vérification

- `src/lib/knowledge/morphology/curated/pronouns.test.ts` — paradigme fermé,
  candidats de cas par forme (y compris variantes н- et syncrétismes triples
  нас/вас/них).
- `src/lib/knowledge/concept-graph/resolve-reader-pronoun.test.ts` — les 7 cas
  du ticket (`меня́, тебя́, его́/него́, ей/ней, себя́, нас, них`) + `я`/`мной`,
  couvrant régence univoque, régence sense-dependent (`с ней` → instrumental),
  absence de régence (repli accusatif/datif), et confirmation qu'aucun cas
  génitif ne reçoit jamais `possession`.
- Régression noms (`ка́ртой` instrumental, `стол` nom/acc, `врача́` acc/gén,
  `врача́` + régence génitive explicite) : résultats identiques à avant les
  changements — `disambiguateCase`/`inferMorphologicalCase` restent
  rétrocompatibles pour tout ce qui n'est pas un pronom curé.
- `npx tsc --noEmit` et `npx eslint` : aucune erreur sur les fichiers modifiés.

## 10. Contraintes respectées

- Teaching Engine, design et contenu rédigé (leçons `docs/lessons/content/`)
  non touchés.
- Aucune forme de pronom générée par LLM — les 9 paradigmes sont écrits à la
  main et vérifiés contre 4 sources externes indépendantes.
- Build TypeScript strict : `npx tsc --noEmit` passe sans erreur.

## 11. Suite — prose LLM sous contrainte du fait curé (ticket « Prose LLM des pronoms »)

Le §5-6 ci-dessus corrige le **badge** (rôle/couleur) et la **segmentation**
(suffix), tous deux appliqués à la lecture. La **prose** (`explanation`, texte
libre écrit par le LLM et mis en cache) restait, elle, celle générée AVANT la
curation — ex. `меня́` : « est la forme possessive du pronom je… on exprime la
possession avec ce cas ». Cette prose n'est jamais touchée par les overrides
(§6, dernier paragraphe) : il fallait donc (1) empêcher le LLM de la générer
fausse à l'avenir, et (2) purger + régénérer les entrées déjà en cache.

### 11.1 Injection du fait curé dans le prompt (avant l'appel LLM)

Nouveau : `concept-graph/resolve-reader-concept.ts::resolvePronounCuratedFact`
calcule, **avant** l'appel LLM (pas après comme `derivePronounRoleOverride`),
le lemme + cas résolu d'une surface de pronom curée via le même
`detectReliableCase` déjà utilisé pour l'override de rôle — aucun chemin
parallèle. `buildPronounFactPromptHint` transforme ce fait en consigne
française injectée dans le prompt (`orchestrator/llm.ts::generateWordExplanation`,
3e paramètre optionnel `curatedFactHint`, concaténé à l'input ; le
`SYSTEM_PROMPT` a une règle 6 explicite lui demandant de respecter tout bloc
« FAIT GRAMMATICAL CERTAIN » sans le contredire). Câblé dans
`orchestrator/index.ts::explainWord` juste avant l'appel LLM (branche cache
miss).

Nuance importante conservée (cohérente avec la limite §8) : la consigne
« ce n'est JAMAIS un possessif » n'est envoyée que pour les lemmes qui ne
peuvent structurellement jamais l'être (`я, ты, мы, вы, себя́` —
`NEVER_POSSESSIVE_PRONOUN_HINT`). Pour `он/она́/оно́/они́`, la consigne reste
prudente (« ne le présente comme possessif QUE s'il précède directement un
nom ») — ce qui laisse le LLM correctement décrire `её` dans « Э́то её
люби́мый моме́нт дня » comme un vrai déterminant possessif (vérifié §11.3),
sans pour autant permettre de qualifier `меня́`/`тебя́`/`него́` de possessif.
Cas `у + génitif` : phrase dédiée expliquant que la construction exprime la
possession/existence **au niveau de la phrase**, mais que le mot reste le
pronom personnel au génitif.

### 11.2 Purge ciblée + régénération

`scripts/purge-pronoun-cache.ts` (dry-run par défaut, `--execute` pour agir) :
1. Liste toutes les lignes `explanation_cache` dont `surface_word` est une
   forme de pronom curée (`isCuratedPronounSurface`) — **53** lignes trouvées
   sur les textes gold.
2. Vérifie les FK entrantes (`user_vocabulary.explanation_cache_id`, colonne
   sans `ON DELETE`, donc un `DELETE` échouerait/casserait une sauvegarde
   utilisateur) — **1** ligne protégée (`Ему́`, référencée par une sauvegarde).
3. Écrit le rapport **avant toute suppression** :
   `docs/knowledge/pronoun-cache-purge-report.md`.
4. En mode `--execute` :
   - la ligne protégée est régénérée **en place** (même `id`/`context_hash`,
     nouvelle fonction `orchestrator/cache.ts::updateExplanationInCache`,
     réutilise `serializeCachedPayload`) — aucune sauvegarde perdue ;
   - les 52 autres sont supprimées (`DELETE ... WHERE id IN (...)`) puis
     régénérées via `explainWord` (même pipeline que le préremplissage,
     `scripts/prefill-explanation-cache.ts`) — nouvel `id`, même
     `context_hash`.
   - journal détaillé : `docs/knowledge/pronoun-cache-purge-run-log.jsonl`.

Exécuté le 2026-07-29 : 53/53 entrées régénérées sans erreur (~4 min 40).

### 11.3 Vérification post-régénération

Échantillon relu via `explainWord` (donc badge + prose tels qu'affichés à
l'utilisateur) :
- `меня́` (« У меня́ боли́т го́рло ») : badge `location`/vert (inchangé), prose
  → *« […] le mot lui-même reste un pronom personnel au génitif, pas un
  adjectif possessif »* — **ne dit plus « possessif »**.
- `него́` (« У него́ боли́т го́рло ») : *« Le pronom garde sa forme personnelle
  au génitif sans devenir un adjectif possessif »*.
- `тебя́` (« А тебя́ ? ») : accusatif, aucune mention de possession.
- `его́` (objet direct, 2 phrases) : *« sans être un possessif car il ne
  précède pas un nom »*.
- `Ему́` (ligne protégée, mise à jour en place) : *« Il n'est pas possessif
  ici car il ne précède pas directement un nom »* — sauvegarde utilisateur
  intacte (vérifié après coup : `user_vocabulary` référence toujours le même
  `explanation_cache_id`).
- `её` (« Э́то её люби́мый моме́нт дня ») : prose correcte, décrit un vrai
  déterminant possessif — confirme que la nuance §11.1 fonctionne. Le badge
  reste `object_direct` (accusatif, repli par défaut) au lieu de `possession` :
  c'est la limite déjà documentée en §8, non modifiée par ce ticket (seule la
  prose était dans le périmètre demandé).

### 11.4 Effet de bord corrigé : scripts de test

En vérifiant que `resolve-reader-pronoun-fact.test.ts` (nouveau, §11.5)
s'exécute bien via `npm run test:knowledge`, découverte d'un bug latent
préexistant : les scripts `test*` de `package.json` utilisaient un glob
`src/lib/**/*.test.ts` non protégé, expansé par le **shell** avant que `tsx`
ne le voie. `npm run` exécute ses scripts via `sh` (pas le shell interactif de
l'utilisateur), qui n'étend `**` que sur un seul niveau de dossier : les
fichiers à 2 niveaux de profondeur (ex.
`morphology/curated/pronouns.test.ts`) étaient donc silencieusement ignorés
par `npm test` / `npm run test:knowledge` depuis leur création — seule
l'exécution manuelle en zsh (globbing récursif natif) les incluait. Corrigé
par `scripts/run-node-tests.mjs` (découverte récursive native Node, sans
dépendance de glob) ; les 4 scripts `test*` de `package.json` l'utilisent
désormais. `npm test` exécute maintenant 55 tests / 12 suites (au lieu de
tests silencieusement manquants).

### 11.5 Vérification (nouveaux tests)

- `concept-graph/resolve-reader-pronoun-fact.test.ts` (nouveau) :
  `resolvePronounCuratedFact` (lemme + cas + préposition régissante) et
  `buildPronounFactPromptHint` (consigne « jamais possessif » pour
  `я/ты/мы/вы/себя́`, consigne prudente pour `он/она́/оно́/они́`, accord
  français « à l'accusatif »/« à l'instrumental » vs « au génitif »/« au
  datif »).
- `npm test` (55 tests, 12 suites), `npx tsc --noEmit`, `npx eslint` : tous
  au vert sur les fichiers modifiés.
