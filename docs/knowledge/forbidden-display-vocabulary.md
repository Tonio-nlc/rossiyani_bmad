# Vocabulaire de conception interdit à l'affichage

> Source code : `src/lib/knowledge/teaching-engine/forbidden-display-vocabulary.ts`  
> Appliqué par le Quality Gate (`SCENARIO_FORBIDDEN_DISPLAY_VOCAB`).

## Principe Rossiyani

**Expliquer avant nommer.** Le jargon d'implémentation (couleurs internes, termes
d'archi, jargon linguistique d'atelier) ne doit **jamais** apparaître dans le contenu
lu par l'apprenant.

La couleur se **voit** dans l'interface ; on ne la **nomme** pas.
L'utilisateur a rencontré un **mot** dans une phrase — pas un « lemme ».

## Liste interdite (extensible)

| Terme | Pourquoi |
|-------|----------|
| corail, bleu, vert, violet, ambre, indigo | Noms internes des couleurs fonctionnelles |
| lemme / lemmes | Terme technique ; dire « mot » |
| POS, part of speech | Jargon morphologique interne |
| rôle fonctionnel | Terme d'archi Reader |
| citation | Sens « forme de dictionnaire » — incompréhensible ; préférer « forme de départ » / rôle (sujet) |
| slug, concept id | Identifiants techniques |

## Champs concernés (lus)

`principle`, `fact`, `contrast` (formes + explications), `memoryAnchor`, `hook`,
`question`, `intuition`, `visual` (nodes + caption), `commonMistake`, `reuse`,
et les mêmes slots dans `illustration` / `illustrationVariants`.

## Autorisé ailleurs

- Code TypeScript, commentaires, IDs (`case-accusative`), `teacherNotes`
- Documentation interne (`docs/knowledge/…`)
- Noms pédagogiques des cas/aspects quand c'est le moment de **nommer**
  (accusatif, perfectif…) — ce n'est pas du vocabulaire de conception

## Comment étendre

1. Ajouter une entrée dans `FORBIDDEN_DISPLAY_VOCABULARY`.
2. Documenter la ligne dans ce fichier.
3. Relancer l'audit : `npx tsx scripts/audit-forbidden-display-vocabulary.ts`
