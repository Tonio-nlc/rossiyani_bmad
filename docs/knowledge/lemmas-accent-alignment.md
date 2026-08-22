# Ticket — alignement des accents dans `public.lemmas`

**Statut** : ouvert — **lecture seule** pour l’ampleur ; pas de SQL de correction ici.  
**Date** : 2026-08-22.  
**Contexte M3a** : les conflits d’accent OR vs Rossiyani ont révélé que
`public.lemmas.form` porte des accents faux **et** des **doublons** d’accent
(deux lignes, même bare, deux U+0301 différents).

C’est cette table que l’app affiche en gros titre via la précédence
`resolveDisplayLemma` / `lemmas.form`.

---

## Constat

La contrainte `lemmas_no_bare_vs_accented_dup` (EXCLUDE) empêche la coexistence
d’une forme **nue** et d’une forme **accentuée** pour la même base
(`replace(form, U+0301, '')`). Elle **ne compare pas** deux formes **toutes
deux accentuées** entre elles → `идти́` + `и́дти` passent.

Mesure (script `scripts/morphology-audit/measure-lemma-accent-pairs.ts`,
2026-08-22) : **259** lemmes → **10** bares avec ≥ 2 accents distincts.

### Paires légitimes (му́ка / мука́, etc.)

**Aucune** trouvée dans `public.lemmas` aujourd’hui (pas de couple
мука / замок / атлас en double accentué).

### Doublons d’accent (à fusionner / arbitrer) — 10 bares

| bare | formes `lemmas.form` | explanation_cache | user_vocabulary | lemma_concept_links | word_forms |
|------|----------------------|------------------:|----------------:|--------------------:|-----------:|
| болеть | бо́леть, боле́ть | 2 | 1 | 0 | 0 |
| думать | дума́ть, ду́мать | 2 | 0 | 0 | 0 |
| идти | идти́, и́дти | 12 | 0 | 0 | 0 |
| интересный | интере́сный, и́нтересный | 1 | 0 | 0 | 0 |
| молодой | молодо́й, моло́дой | 2 | 0 | 0 | 0 |
| молоко | молоко́, моло́ко | 5 | 0 | 0 | 0 |
| проблема | пробле́ма, про́блема | 1 | 0 | 0 | 0 |
| себя | се́бя, себя́ | 2 | 0 | 0 | 0 |
| спрашивать | спраши́вать, спра́шивать | 2 | 0 | 0 | 0 |
| темно | те́мно, темно́ | 1 | 0 | 0 | 0 |

**Totaux dépendances (somme des comptes ci-dessus)** :  
explanation_cache **30** · user_vocabulary **1** · lemma_concept_links **0** ·
word_forms **0**.

Note : `болеть` chevauche le ticket
[`ticket-bolet-sense-without-stress.md`](./ticket-bolet-sense-without-stress.md)
(`бо́леть` fabriqué).

---

## Contrainte DB possible (piste, pas encore de migration)

Pour empêcher la **reproduction** (deux accents ≠ sur le même bare) :

1. **UNIQUE sur bare** :  
   `UNIQUE (replace(form, chr(769), ''))`  
   → une seule ligne par bare, quel que soit l’accent.  
   **Casse** les homographes légitimes (му́ка / мука́) s’ils entrent un jour
   dans `lemmas` — il faudrait alors une exception (colonne `homograph_key`
   ou table dédiée).

2. **EXCLUDE plus strict** (gist) : interdire deux lignes dont le bare est
   égal **et** les formes NFC diffèrent, sauf allowlist — complexe.

3. **Garde applicative** dans `resolveOrCreateLemma` : avant INSERT, si bare
   existe déjà avec un autre accent → réutiliser / merger au lieu de créer
   (complément à `lemmas_no_bare_vs_accented_dup`).

La contrainte actuelle `lemmas_no_bare_vs_accented_dup` reste utile (nu ↔
accentué) mais **insuffisante** contre double accentué.

---

## Hors scope de ce ticket (pour l’instant)

- SQL de fusion / DELETE / UPDATE des 10 paires.
- Alignement `public.lemmas` avec `morphology_lemmas` openrussian.
- Décision produit sur les homographes légitimes futurs.

## Suite

Mario valide l’ampleur → ticket d’exécution (choix du « gagnant » par paire,
souvent OR / gold, + rewire FK).

## Script de re-mesure

```bash
npx tsx scripts/morphology-audit/measure-lemma-accent-pairs.ts
```
