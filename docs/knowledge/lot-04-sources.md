# Lot 04 — sources de vérification

> Concepts : `case-nominative`, `verb-past-tense`
> Dernier lot du système des 6 cas — ferme le nominatif.
> Statut seed : `brouillon` (relecture enseignant requise avant `valide`)
> Date : 2026-07-26

Règle : aucune forme fléchie ni affirmation grammaticale n'est reprise sans source
explicite. Les formes d'illustration sont dans
`src/lib/knowledge/morphology/curated/forms.ts` (commentaire
« validé manuellement — ne pas générer par LLM »).

## Formes fléchies — passé de найти́

| Forme | Genre/nombre | Source | Vérifié |
|-------|--------------|--------|---------|
| нашёл | masculin | **Attestée verbatim** dans le texte gold « Как найти дорогу? » (`— Ты бы́стро нашёл доро́гу!`) | oui |
| нашла́ | féminin | Gramota.ru (Метасловарь, forme officielle « нашёл, -шла́, -шло́ ») ; learnrussianwords.com (fiche de conjugaison найти́) ; elon.io (найти́ hérite du passé irrégulier de идти́ : шёл/шла́/шло́/шли́ → нашёл/нашла́/нашло́/нашли́). **Non attestée** verbatim dans les textes gold actuels — forme du paradigme irrégulier documenté, à vérifier par un enseignant | oui (règle sourcée), non (occurrence gold) |
| нашло́ | neutre | Mêmes sources que нашла́ (paradigme complet). Non utilisée dans le contenu du lot (seuls m./f./pl. sont illustrés) — listée dans `CURATED_NAJTI_PAST` et le mini-tableau du concept pour l'exhaustivité pédagogique | oui (règle sourcée), non (occurrence gold) |
| нашли́ | pluriel | Mêmes sources que нашла́ | oui (règle sourcée), non (occurrence gold) |

Sources : [Gramota.ru — Метасловарь найти](https://gramota.ru/meta/nayti) (tableau
« Прошедшее время : Мужской род нашёл / Женский род нашла́ / Средний род нашло́ /
Множественное число нашли́ ») ; [learnrussianwords.com — conjugaison найти́](https://learnrussianwords.com/conjugation/najti/) ;
[elon.io — находить/найти́](https://elon.io/grammar/russian/verb-reference/находить-найти)
(paradigme irrégulier hérité de идти́, avec mise en garde pédagogique sur нашёл comme
forme la plus fréquemment mal produite par les apprenants) ; confirmé par
[Викисловарь найти](https://ru.wiktionary.org/wiki/найти) (найти́ = на- + racine de
идти́, type de conjugaison isolé selon Zaliznyak ^b/b(9)).

## Formes fléchies — passé de случи́ться

| Forme | Source | Vérifié |
|-------|--------|---------|
| случи́лось | **Attestée verbatim** dans le texte gold « У врача » (`— Что случи́лось?`) | oui |

## Affirmation grammaticale — accord du passé (genre/nombre, pas personne)

| Affirmation | Source | Vérifié |
|-------------|--------|---------|
| Le passé russe s'accorde en genre et en nombre avec le sujet, jamais en personne (я/ты/он нашёл sont identiques au masculin) | Fait grammatical standard (morphologie du passé russe formé sur le radical de l'infinitif + suffixe -л/-ла/-ло/-ли, sans marque de personne) ; confirmé par le tableau de conjugaison найти́ ci-dessus (Gramota.ru, learnrussianwords.com : le passé n'a que 4 cases — m./f./n./pl. — contre 6 au présent/futur) | oui |
| Le français accorde parfois son participe passé selon le sujet (« elle est allée »), mais pas systématiquement (« il a trouvé » / « elle a trouvé », même forme) — contrairement au russe qui accorde toujours | Fait de contraste français standard (accord du participe passé avec être vs invariance avec avoir aux temps composés courants) — utilisé uniquement à des fins de contraste pédagogique, pas comme règle de grammaire française à vérifier en profondeur | oui |

## Affirmation grammaticale — case défectivité/impersonnalité de случи́ться

**Vérification ciblée demandée par le lot** — le statut de случи́ться a été vérifié et
**nuancé** par rapport à la première formulation (qui le disait strictement défectif) :

| Affirmation | Source | Vérifié |
|-------------|--------|---------|
| случи́ться n'est **pas** grammaticalement défectif au sens strict : il conjugue en théorie à toutes les personnes (я случу́сь, ты случи́шься… et prend un accord de genre/nombre complet au passé — « беда́ случи́лась » féminin, « происше́ствия случи́лись » pluriel sont grammaticalement corrects) | [Gramota.ru — Метасловарь случиться](https://gramota.ru/meta/sluchitsya) (tableau de conjugaison complet, toutes personnes) ; [SubLearn — случаться](https://sublearn.com/learn/ru/vocabulary/случаться) (« When «случаться» does have a subject, the verb agrees with it in number and gender ») | oui |
| Dans son emploi le plus courant et idiomatique — l'évènement sans sujet nommé, comme dans « Что случи́лось? » — случи́ться(-ся) apparaît **surtout** à la 3e personne du singulier / neutre singulier, de façon impersonnelle | [OpenRussian — случи́ться](https://en.openrussian.org/ru/случиться) (« usually impersonal ») ; [Definify — случиться](https://www.definify.com/word/случиться) (« usually impersonal ») ; déjà documenté dans le code (`CURATED_SLUCHITSYA`, `present-verbs.ts`, présent : « Verbe défectif / impersonnel : **surtout** 3e personne » — formulation déjà nuancée avant ce lot) | oui |

**Conséquence sur le contenu** : le concept `verb-past-tense` et son scénario ont été
rédigés avec la formulation nuancée (« reste au neutre singulier **dans son emploi le
plus courant** », jamais « ne s'emploie **que** au neutre singulier ») — cohérent avec
la défectivité déjà documentée au présent dans `CURATED_SLUCHITSYA`.

## Alignement avec la leçon existante — `docs/lessons/content/six-cas/02-nominatif.json`

**Vérification demandée explicitement par le lot avant rédaction.** Contenu relu en
entier avant d'écrire `case-nominative`. Aucun écart constaté :

| Point de la leçon existante | Concept `case-nominative` (lot 04) | Écart ? |
|------------------------------|--------------------------------------|---------|
| « Le nominatif est le cas de base — celui du dictionnaire […] C'est aussi le cas du sujet » | `coreIdea` : « chaque mot a une forme neutre, celle du dictionnaire ; c'est cette forme que porte le sujet » | Aucun — même logique |
| « Dans Rossiyani, c'est le rôle que tu vois en bleu » | `teacherNotes` : « Rôle fonctionnel Rossiyani : sujet (bleu, déjà existant) » — rôle déjà implémenté, non modifié par ce lot | Aucun |
| Exemples : преподава́тель (sujet), они́ (sujet), я/ты (sujets) — tous rôle `"subject"` explicite | Concept illustré avec А́нна (sujet) ; `relatedLemmas` inclut преподава́тель | Aucun — même famille d'exemples (textes gold « Первый день », « Знакомство ») |
| « Le nominatif est ton point de départ. Les cinq cas suivants existent pour exprimer tout ce que le sujet n'exprime pas » | `whyItExists` : « chaque cas se définit par ce qu'il change par rapport au nominatif » | Aucun — reformulation du même principe |
| Exemple « я францу́з. А ты ру́сская? » : францу́з et ру́сская marqués `role: null` (**pas** sujet, bien que nominatif) | `commonMistakes` : « un mot au nominatif peut aussi être un attribut ("Он врач") sans être le sujet » — règle de résolution technique alignée sur cette même distinction | Aucun — la leçon **confirme déjà implicitement** que nominatif ≠ sujet automatique (attribut non coloré comme sujet) ; le concept formalise cette même règle côté résolution (`functionalRole === "subject"` requis) |

**Conclusion : aucun écart.** Le contenu de la leçon existante anticipait déjà, sans le
nommer, la distinction cas/rôle que ce lot formalise dans la résolution de concept.

## Vérification de la hiérarchie de résolution

Vérifié avec un script de test exécuté manuellement pendant ce lot (10 scénarios,
non conservé dans le dépôt — cf. `src/lib/knowledge/concept-graph/match-signals.ts`,
`pedagogical-hierarchy.ts`, `case-concept-routing.ts` pour le code final) :

1. **А́нна, cas nominatif, rôle confirmé `subject`** → primary `case-nominative`
   (secondaire `noun-declension`, comme les autres cas précis).
2. **врач, cas nominatif, rôle ≠ `subject`** (attribut, « Он врач ») → primary
   `noun-declension` — **jamais** `case-nominative`. Confirme la règle demandée par le
   lot : le nominatif seul ne suffit pas.
3. **стол, cas ambigu nominatif/accusatif désambiguïsé en nominatif via rôle
   `subject`** → primary `case-nominative` (la désambiguïsation amont,
   `disambiguateCase` dans `case-concept-routing.ts`, résout déjà le cas nominatif
   uniquement quand le rôle confirme le sujet — cf. commentaire ajouté dans ce
   fichier pour ce lot).
4. **стол, rôle `object_direct`** → primary `case-accusative`, jamais
   `case-nominative` — aucune collision entre les deux cas sur le même mot.
5. **нашёл (tense=passé)** → primary `verb-past-tense`.
6. **чита́ет (tense=présent, non-régression)** → primary `verb-present-conjugation`
   inchangé.
7. **нашёл (tense=passé + aspect perfectif)** → primary `verb-past-tense` (famille
   conjugaison, priorité 70, gagne sur aspect, priorité 50 — même règle déjà en place
   pour le présent).
8. **у окна́ (régence détectée)** → primary `preposition-government`, secondaire
   `case-genitive` — **la régence prépositionnelle reste prioritaire**, non affectée
   par ce lot.
9. **я (pronom sujet, nominatif)** → primary `case-nominative` — les pronoms sujets
   sont bien couverts, pas seulement les noms.
10. **случи́лось (tense=passé)** → primary `verb-past-tense`. **Bug détecté et corrigé
    pendant ce lot** (voir section suivante) : avant correction, ce mot résolvait à
    tort vers `verb-movement-prefixes` (préfixe с- détecté par erreur comme préfixe
    de mouvement).

Régression vérifiée après correction (voir ci-dessous) :

11. **пойти́ / пойду́** (verbe de mouvement réellement préfixé) → primary toujours
    `verbs-of-motion` (secondaire `verb-movement-prefixes`) — comportement inchangé.
12. **сде́лать** (préfixe с-, verbe non-mouvement) → primary
    `verb-perfective-aspect`, **jamais** `verb-movement-prefixes` — confirme que le
    correctif ne capture plus les faux positifs.

## Correction en marge du lot — règle `verb-movement-prefixes` trop permissive

En testant la résolution de `случи́лось` (exemple imposé par ce lot), le mot
résolvait à tort vers `verb-movement-prefixes` : la règle ne testait qu'un préfixe
apparent (`/^(по|у|при|вы|в|с|пере)/` sur la forme de surface) sans vérifier qu'il
s'agit réellement d'un verbe de mouvement. Comme случи́ться commence par с-, il était
capturé par erreur — et aurait capturé aussi сде́лать, смотре́ть, etc. si l'occasion
s'était présentée.

**Correctif** (`src/lib/knowledge/concept-graph/match-signals.ts`) : la règle exige
désormais en plus `isMotionVerbLemma()` (racine de mouvement connue, déjà utilisée
ailleurs dans le module) avant de tester le préfixe. Vérifié par les scénarios 10, 11,
12 ci-dessus : случи́лось n'est plus capturé, пойти́ reste correctement résolu comme
verbe de mouvement.

Ce correctif est nécessaire pour livrer la couverture explicite de случи́лось exigée
par le lot ; documenté aussi dans `docs/knowledge/concept-resolution-hierarchy.md`.

## Non couvert volontairement (hors lot)

- Passé imperfectif systématique (le lot illustre uniquement des verbes perfectifs au
  passé, нашёл/случи́лось — cohérent avec les exemples gold disponibles).
- Verbes de mouvement au passé (ходи́л/шёл — hors lot, appartiennent au périmètre
  `verbs-of-motion`/`verb-movement-prefixes`, non dupliqués ici).
- Nominatif attribut/apposition comme concept dédié — volontairement **non couvert**
  par `case-nominative` (voir `commonMistakes`) ; resterait sur `noun-declension`.
- Nominatif des adjectifs substantivés (ex. «ру́сский» employé comme sujet) — POS
  adjectif autorisé dans la règle de signal par cohérence avec `case-accusative`, mais
  non illustré spécifiquement dans ce lot (aucun exemple gold disponible).
- Futur (temps) — hors périmètre, seul le couple présent/passé est traité par les
  concepts de conjugaison à ce stade.

## Verdict

Toutes les formes utilisées dans les scénarios seed du lot 04 ont une source vérifiée
(Gramota.ru, OpenRussian, elon.io, learnrussianwords.com, Wiktionnaire russe) et/ou
sont attestées verbatim dans les textes gold (нашёл, случи́лось — les deux formes
demandées explicitement par le lot). Les formes du paradigme sans occurrence gold
(нашла́, нашло́, нашли́) suivent un paradigme irrégulier mais entièrement documenté
(hérité de идти́), ajoutées à la main dans
`src/lib/knowledge/morphology/curated/forms.ts` avec mention explicite de leur statut.

Le statut de случи́ться a été vérifié et **nuancé** par rapport à une première
hypothèse de défectivité stricte : il est grammaticalement complet mais **surtout**
employé de façon impersonnelle — formulation reflétée dans le contenu final.

L'alignement avec la leçon existante (`docs/lessons/content/six-cas/02-nominatif.json`)
a été vérifié point par point : **aucun écart**. La règle de résolution
(`functionalRole === "subject"` requis en plus du cas nominatif) a été testée sur 12
scénarios et confirme qu'elle ne route jamais un attribut/apposition nominatif vers
`case-nominative`, et que `verb-past-tense` ne collisionne jamais avec les concepts de
cas (POS disjoints) ni avec `verb-present-conjugation` (temps mutuellement exclusifs).
Un bug préexistant (règle `verb-movement-prefixes` trop permissive) bloquait la
résolution de случи́лось et a été corrigé en marge de ce lot, avec vérification de
non-régression sur пойти́/сде́лать.
