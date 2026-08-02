/**
 * Vocabulaire de conception interdit dans le contenu LU par l'apprenant.
 * Source de vérité documentée : docs/knowledge/forbidden-display-vocabulary.md
 *
 * Autorisé dans le code, commentaires, teacherNotes, IDs techniques.
 */

export interface TForbiddenDisplayHit {
  term: string;
  field: string;
  excerpt: string;
}

/** Termes / motifs interdits (affichage apprenant). Liste extensible. */
export const FORBIDDEN_DISPLAY_VOCABULARY: ReadonlyArray<{
  id: string;
  label: string;
  pattern: RegExp;
}> = [
  {
    id: "color-corail",
    label: "corail",
    pattern: /\bcorails?\b/i,
  },
  {
    id: "color-bleu",
    label: "bleu",
    pattern: /\bbleue?s?\b/i,
  },
  {
    id: "color-vert",
    label: "vert",
    pattern: /\bvertes?\b|\bverts?\b/i,
  },
  {
    id: "color-violet",
    label: "violet",
    pattern: /\bviolette?s?\b/i,
  },
  {
    id: "color-ambre",
    label: "ambre",
    pattern: /\bambres?\b/i,
  },
  {
    id: "color-teal",
    label: "teal",
    pattern: /\bteals?\b/i,
  },
  {
    id: "color-turquoise",
    label: "turquoise",
    pattern: /\bturquoises?\b/i,
  },
  {
    id: "term-lemme",
    label: "lemme",
    pattern: /\blemme?s?\b/i,
  },
  {
    id: "term-pos",
    label: "POS",
    pattern: /\bPOS\b/,
  },
  {
    id: "term-part-of-speech",
    label: "part of speech",
    pattern: /\bparts?\s+of\s+speech\b/i,
  },
  {
    id: "term-role-fonctionnel",
    label: "rôle fonctionnel",
    pattern: /\br[oô]les?\s+fonctionnels?\b/i,
  },
  {
    id: "term-citation",
    label: "citation",
    pattern: /\bcitations?\b/i,
  },
  {
    id: "term-slug",
    label: "slug",
    pattern: /\bslugs?\b/i,
  },
  {
    id: "term-concept-id",
    label: "concept id",
    pattern: /\bconcept\s*ids?\b/i,
  },
];

function excerptAround(text: string, matchIndex: number, matchLength: number): string {
  const start = Math.max(0, matchIndex - 24);
  const end = Math.min(text.length, matchIndex + matchLength + 24);
  const slice = text.slice(start, end).replace(/\s+/g, " ").trim();

  return `${start > 0 ? "…" : ""}${slice}${end < text.length ? "…" : ""}`;
}

/**
 * Détecte le vocabulaire de conception dans un texte affiché.
 */
export function findForbiddenDisplayVocabulary(
  text: string | null | undefined,
  field: string,
): TForbiddenDisplayHit[] {
  const value = text?.trim();

  if (!value) {
    return [];
  }

  const hits: TForbiddenDisplayHit[] = [];

  for (const entry of FORBIDDEN_DISPLAY_VOCABULARY) {
    entry.pattern.lastIndex = 0;
    const match = entry.pattern.exec(value);

    if (!match || match.index === undefined) {
      continue;
    }

    hits.push({
      term: entry.label,
      field,
      excerpt: excerptAround(value, match.index, match[0].length),
    });
  }

  return hits;
}

export function findForbiddenDisplayVocabularyInFields(
  fields: Array<{ field: string; text: string | null | undefined }>,
): TForbiddenDisplayHit[] {
  return fields.flatMap((item) =>
    findForbiddenDisplayVocabulary(item.text, item.field),
  );
}
