# Accents en conflit — M3a (relecture Mario)

**Statut** : ne **pas** importer automatiquement.  
**Source** : dry-run M3a (`public.lemmas` × OpenRussian), 24 CONFLICTS  
(les deux côtés ont un U+0301, positions différentes).  
**Corpus gold** : 11 textes library (migrations `008` + `010`–`015`).  
Fréquence = occurrences du **lemme citation** (token = bare après strip accent)  
dans le gold ; si 0, phrase de **forme fléchie** liée indiquée entre parenthèses.

Tri : fréquence gold décroissante, puis bare alpha.

---

## Ne jamais écraser automatiquement

Cas où **les deux accents existent en russe** avec des rôles / sens distincts
(ou arbitrage Mario déjà documenté). L’import OpenRussian **ne doit pas**
choisir à la place de Mario.

| Bare | Rossiyani | OpenRussian | Pourquoi |
|------|-----------|-------------|----------|
| **дома** | дома́ | до́ма | **Sens / POS distincts** : до́ма = adverbe « à la maison » ; дома́ = nominatif pluriel de дом « les maisons ». *(absent du gold sous ces formes ; le texte « Дома вечером » utilise домо́й.)* |
| **болеть** | бо́леть | боле́ть | **Arbitrage Mario** : deux lemmes / sens (ex. « être malade » vs « avoir mal ») avec paradigmes distincts — déjà géré côté curé. |
| **себя** | се́бя | себя́ | **Doublon d’accent** déjà repéré (même pronom réfléchi) ; la forme gold est себя́. |
| **дорога** | дорога́ | доро́га | **Sens / POS distincts possibles** : доро́га = nom « route » ; дорога́ = court féminin de дорогой « cher / cher(e) ». Le gold (« По доро́ге… ») pointe le **nom**. |
| **плохо** | плохо́ | пло́хо | **POS distincts possibles** : пло́хо = adverbe ; плохо́ = court neutre de плохой. Le gold (« чу́вствует себя́ плохо́ ») est l’**adverbe** (OR a raison pédagogiquement ici, mais ce n’est pas un FILL — conflit à trancher à la main). |

**Vérification du reste de la liste** : aucun autre couple n’est un homographe
à deux sens lexicaux stables du type му́ка/мука́. Ce sont des **désaccords
d’accent sur le même lemme** (souvent Rossiyani faux vs dictionnaire OR, ou
variante). Ils restent en attente de relecture — **pas** d’import auto.

---

## Les 24 conflits

Format : `freq | Rossiyani | OpenRussian | contexte gold`

1. **5** | моло́ко | молоко́ | « Ему́ ну́жен хлеб и молоко́. » — *В магазине*
2. **2** | моло́дой | молодо́й | « Молодо́й челове́к сра́зу встаёт… » — *В метро*
3. **2** | рано́ | ра́но | « Луи́ прихо́дит к университе́ту ра́но. » — *Первый день в университете*
4. **2** | се́бя | себя́ | « …чу́вствует себя́ плохо́. » — *У врача* ⚠ doublon (voir ci-dessus)
5. **1** | и́дти | идти́ | « Пото́м Са́ша продолжа́ет идти́. » — *По дороге*
6. **1** | и́нтересный | интере́сный | « …о́чень интере́сный. » — *Первый день в университете*
7. **1** | мага́зин | магази́н | « Ива́н идёт в магази́н. » — *В магазине*
8. **1** | о́кно | окно́ | « …смо́трит в окно́. » — *Первый кофе*
9. **1** | па́льто | пальто́ | « Он снима́ет пальто́ и ту́фли. » — *Дома вечером*
10. **1** | плохо́ | пло́хо | « …чу́вствует себя́ плохо́. » — *У врача* ⚠ adverbe vs court adj. (voir ci-dessus)
11. **1** | пое́зд | по́езд | « По́езд ме́дленно е́дет. » — *В метро*
12. **1** | те́мно | темно́ | « На у́лице ещё темно́. » — *Первый кофе*
13. **0** | ауди́тория | аудито́рия | *(fléchi)* « В аудито́рии уже́ есть студе́нты. » — *Первый день…*
14. **0** | бо́леть | боле́ть | *(fléchi)* « У него́ боли́т го́рло. » — *У врача* ⚠ arbitrage Mario
15. **0** | булочна́я | бу́лочная | *(fléchi)* « …идут в булочную. » — *В булочной* / seed
16. **0** | во́да | вода́ | *(fléchi)* « …пить больше воды́. » — *У врача*
17. **0** | дома́ | до́ма | — absent du gold (ni до́ма ni дома́) ⚠ sens distincts
18. **0** | дорога́ | доро́га | *(fléchi)* « По доро́ге он ви́дит… » — *По дороге* ⚠ nom vs court adj.
19. **0** | дума́ть | ду́мать | *(fléchi)* « Он ду́мает о предстоя́щем дне. »
20. **0** | небо́льшой | небольшо́й | *(fléchi)* « Там небольша́я о́чередь. »
21. **0** | осматрива́ть | осма́тривать | *(fléchi)* « Врач осма́тривает Луи́. »
22. **0** | про́блема | пробле́ма | — absent du gold
23. **0** | спраши́вать | спра́шивать | *(fléchi)* « Он спра́шивает прохо́жего… »
24. **0** | ча́сы | часы́ | *(fléchi)* « …в де́вять часо́в. » — *По дороге*

---

## Suite

Après relecture Mario : décider par ligne (garder Rossiyani / adopter OR /
créer override curé). **Aucun** de ces 24 n’entre dans l’import FILL M3a.
