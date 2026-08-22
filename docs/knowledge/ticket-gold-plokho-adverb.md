# Ticket — gold « У врача » : плохо́ → пло́хо

**Statut** : ouvert — ne pas traiter dans M3a.  
**Date** : 2026-08-22.

## Problème

Dans le texte gold **У врача** :

> На сле́дующий день Луи́ чу́вствует себя́ **плохо́**.

Après *чувствовать себя*, la forme attendue est l’**adverbe** **пло́хо**,
pas la forme courte de l’adjectif **плохо́** (neutre de плохой).

C’est une faute d’accent **dans le texte source** (`texts.content` /
éventuellement `content_annotated`), pas un conflit de lemme dictionnaire
seul.

## Travail attendu (plus tard)

1. Corriger l’accent dans `public.texts` pour le titre `У врача`
   (et la source JSON / migration gold si elle fait référence).
2. Vérifier `content_annotated` / cache d’explication pour la surface
   concernée.
3. Aligner `docs/knowledge/accent-conflicts-m3a.md` une fois le gold corrigé.

## Références

- Migration / seed : texte « У врача »
- `docs/knowledge/accent-conflicts-m3a.md` (§ плохо)
