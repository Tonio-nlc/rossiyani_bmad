# Diagnostic — où part le temps sur un cache HIT ?

> Contexte : après le préremplissage du cache (413 mots), un clic sur un mot
> gold reste mesuré à ~1,5 s côté utilisateur, alors qu'un cache hit "pur"
> avait été estimé à ~250 ms. Ce diagnostic décompose précisément le temps
> serveur d'un cache hit pour trouver où part la seconde manquante.

## Méthode

- Instrumentation via le perf-timer existant (`src/lib/utils/perf-timer.ts`,
  déjà utilisé pour `explain:*`) : la seule étape auparavant chronométrée en
  un bloc (`attachConceptResolution`) a été décomposée en sous-étapes
  (`ensureConceptGraphHydrated`, `getKnowledgeForConceptResolution`,
  `resolveReaderConceptFromSignals`, `applyInstrumentRoleOverride`), et la
  route `/api/word/explain` a reçu ses propres marks (`createClient`,
  `auth.getUser`, parse/validation, `explainWord`, sérialisation).
- Mesures faites en appelant `explainWord()` directement (script `tsx`,
  `PERF_DEBUG=1`), donc **sans** le coût de la route HTTP/auth — mesuré
  séparément ci-dessous — pour isoler le pipeline explication pur.
- 3 mots représentatifs, 4 exécutions chacun (cache déjà chaud d'un run
  précédent) :
  - **simple** : `ты` (pronom, sujet)
  - **mot à cas** : `хлеб` (objet direct, `linguistic_knowledge` déjà
    bootstrappée → concept `case-accusative` résolu)
  - **instrumental** : `ка́ртой.` (pas de `linguistic_knowledge`, override
    "moyen" déclenché via forme curée)

## Décomposition mesurée (moyenne, process Node chaud, hors 1er appel du run)

| Étape | ты | хлеб | ка́ртой. | Commentaire |
|---|---:|---:|---:|---|
| lecture `explanation_cache` (cache lookup) | ~104 ms | ~76 ms | ~77 ms | 1 requête Supabase (SELECT + jointure `lemmas(form)`) |
| `applyCuratedLemmaToResponse` | ~0 ms | ~0 ms | ~0 ms | Sync sauf pour les mots curés (rare) — négligeable |
| `ensureConceptGraphHydrated` | ~0 ms* | ~0 ms* | ~0 ms* | Mémoïsé (singleton en mémoire) après le tout premier appel du process |
| `getKnowledgeForConceptResolution` | 56–207 ms | 48–59 ms | 96–132 ms | **Étape dominante**, voir détail plus bas |
| `resolveReaderConceptFromSignals` | ~1 ms | ~1 ms | — | Pur, en mémoire (graphe déjà hydraté) |
| `applyInstrumentRoleOverride` | ~0 ms | ~0 ms | ~0 ms | Pur, en mémoire |
| **Total `explainWord` (cache hit)** | **~233 ms** | **~131 ms** | **~185 ms** | Avant correctif (voir avant/après plus bas) |

\* sauf le tout premier appel du process (~150 ms) — non représentatif d'un
serveur déjà chaud.

**Étape dominante : `getKnowledgeForConceptResolution`** (lecture
`linguistic_knowledge`). Deux sous-cas très différents :

- **Lemme déjà bootstrappé** (`хлеб`) : 1 seule requête directe
  (`linguistic_knowledge.lemma_id = ...`) → ~50 ms.
- **Lemme non bootstrappé** (la majorité des mots fraîchement préremplis —
  cf. les logs `[Concept Resolution] Pas de linguistic_knowledge
  utilisable... bootstrap requis` observés pendant le préremplissage) :
  la fonction retombe sur un **repli en cascade** :
  1. requête directe (miss),
  2. requête `lemmas` par préfixe (`LIKE 'xxxx%'`),
  3. **une requête `linguistic_knowledge` par candidat trouvé, en boucle
     séquentielle** (`for (const candidate of equivalents) { await ... }`).

  C'est le point exact décrit par l'hypothèse 1 du ticket ("requêtes DB
  redondantes, plusieurs allers-retours là où un seul suffirait").

**Hypothèses écartées après mesure :**
- *Hydratation du Concept Graph refaite à chaque appel* : **non** — déjà
  mémoïsée par un singleton (`hydratePromise`), ~0 ms sauf le tout premier
  appel du process.
- *Résolution de concept recalculée alors qu'elle pourrait être cachée*
  (`resolveReaderConceptFromSignals`, `applyInstrumentRoleOverride`) :
  **non pertinent** — ce sont des fonctions pures en mémoire (pas de DB),
  déjà sous la milliseconde. Rien à mémoïser ici.

## Correctif appliqué (gain sûr, sans risque)

Deux changements ciblés, sans toucher au contenu ni à la justesse du
rôle/concept :

1. **`src/lib/knowledge/get-knowledge.ts`** — le repli par candidats
   équivalents faisait une requête `linguistic_knowledge` **par candidat, en
   séquence**. Remplacé par **une seule requête groupée**
   (`.in("lemma_id", [...candidateIds])`), puis sélection en mémoire du
   premier candidat utilisable — résultat strictement identique, un seul
   aller-retour DB au lieu de N.
2. **`src/lib/orchestrator/index.ts`** — `ensureConceptGraphHydrated()` et
   `getKnowledgeForConceptResolution()` sont indépendants mais étaient
   attendus en séquence. Passés en **`Promise.all`** : les deux latences se
   chevauchent au lieu de s'additionner (gain surtout visible à froid, quand
   l'hydratation n'est pas encore en cache).

**Vérification de non-régression** : les rôles/couleurs/concepts retournés
pour `хлеб` (object_direct/coral, concept `case-accusative`), `ты`
(subject/blue) et `ка́ртой.` (instrument/teal, override appliqué) sont
identiques avant/après le correctif.

## Avant / après (pipeline `explainWord`, cache hit, process chaud)

| Mot | Avant | Après | Gain |
|---|---:|---:|---:|
| `ты` (repli multi-candidats) | ~233 ms | ~120 ms | **-48 %** |
| `хлеб` (lemme déjà bootstrappé, pas de repli) | ~131 ms | ~109 ms | -16 % (gain lié au parallélisme, pas de boucle à regrouper ici) |
| `ка́ртой.` (repli mono/zéro-candidat) | ~185 ms | ~160 ms | -14 % |

Le gain est net quand plusieurs lemmes équivalents existent (accents,
variantes) — c'était notamment le cas pour `ты`. Pour les mots sans repli ou
avec un seul candidat, le gain vient uniquement du parallélisme et reste
modeste, ce qui est cohérent (il n'y avait rien à regrouper).

## Le vrai constat : ~1 s reste inexpliqué **en dehors** de ce pipeline

Même **avant** le correctif, le pipeline `explainWord` complet pour un cache
hit ne dépassait pas ~200–400 ms (pire cas mesuré : 424 ms, au tout premier
appel du process, hydratation à froid incluse). Après correctif, il tourne à
**~100–160 ms** en régime chaud. On est donc très loin des ~1,5 s mesurés
côté utilisateur, avec ou sans le correctif — **`attachConceptResolution`
n'était pas la source principale de la seconde manquante**, seulement une
inefficacité réelle et désormais corrigée.

Deux autres coûts serveur ont été mesurés en dehors de `explainWord` :

| Étape (hors `explainWord`) | Mesuré | Nature |
|---|---:|---|
| `auth.getUser()` (vérification JWT, route `/api/word/explain`) | ~119 ms (66–175 ms sur 8 essais) | Réseau obligatoire vers Supabase Auth — **volontairement non modifié** (`getUser()` revalide le JWT côté serveur, contrairement à `getSession()` qui ferait confiance au cookie local ; c'est un compromis sécurité/latence qui ne doit pas être arbitré silencieusement dans ce ticket) |
| `createClient()` (lecture cookies) + sérialisation JSON | < 1 ms | Négligeable, aucune I/O |

**Total serveur mesuré pour un clic cache-hit, process chaud : environ
230–300 ms** (auth ~120 ms + cache lookup ~55–100 ms + résolution concept
~55–100 ms en parallèle + sérialisation négligeable).

**Conclusion : les ~1,2 s restants ne sont pas dans ce code.** Ils sont très
probablement dans une couche que ce diagnostic ne peut pas instrumenter
depuis le code serveur seul :

- **Aller-retour réseau navigateur ↔ serveur** (latence + TLS), invisible
  depuis un timer côté serveur.
- **Cold start serverless**, si le déploiement tourne sur des fonctions
  à la demande (ex. Vercel) : chaque invocation "froide" recharge les
  modules et repaie l'hydratation du Concept Graph (~150 ms) — mais surtout
  peut ajouter plusieurs centaines de ms à ~1-2 s de démarrage de fonction,
  un coût qui n'apparaît PAS dans les mesures ci-dessus (faites dans un
  process Node unique et durable, donc optimiste par rapport à une
  invocation serverless froide).
- **Rendu client** (React Query, mise à jour d'état, ouverture/anim de
  l'Explorer Panel) : hors périmètre serveur.

**Recommandation pour confirmer** (hors périmètre de ce ticket, nécessite de
l'observabilité en production) : comparer, sur un vrai clic en prod/preview,
le *Time To First Byte* de `/api/word/explain` (onglet Réseau du navigateur)
à la durée de fonction reportée par la plateforme d'hébergement. Si le TTFB
est proche des ~250-300 ms mesurés ici, la seconde manquante est côté
réseau/rendu client ; si le TTFB est proche de 1 s+, c'est un cold start
serveur qu'il faudra traiter séparément (ex. garder une instance chaude).

## Contraintes respectées

- Aucune modification du Teaching Engine, du design ou du contenu.
- Aucun changement de comportement/justesse : rôles, couleurs et concepts
  vérifiés identiques avant/après sur les 3 échantillons.
- `tsc --noEmit` et ESLint passent sans erreur sur les fichiers modifiés.
