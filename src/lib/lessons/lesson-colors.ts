import type { TLessonExampleWord, TLessonWordRole } from "@/types/lessons";
import {
  getFunctionColorHex,
  normalizeToken,
  tokenizeSentence,
  type TReaderFunctionColor,
} from "@/lib/utils/russian";

const ROLE_COLOR_MAP: Record<
  Exclude<TLessonWordRole, null>,
  TReaderFunctionColor
> = {
  subject: "blue",
  object: "coral",
  place: "green",
  possession: "violet",
  recipient: "amber",
  instrument: "teal",
};

/**
 * Libellé pédagogique "learner-facing" par rôle — jamais le nom du cas
 * (ex. "instrumental"), toujours le sens concret ("avec quoi"). `Record`
 * exhaustif sur `TLessonWordRole` : un futur ajout de rôle fait échouer le
 * build tant que son libellé n'est pas renseigné ici (pas de légende figée
 * qui prendrait du retard sur les rôles réels).
 */
const ROLE_ONBOARDING_LABEL: Record<Exclude<TLessonWordRole, null>, string> = {
  subject: "fait l'action (le sujet)",
  object: "reçoit l'action (l'objet)",
  place: "indique où ou quand",
  possession: "indique une possession",
  recipient: "indique à qui",
  instrument: "indique le moyen (avec quoi)",
};

/** Ordre d'affichage de la légende (pédagogique : agent → patient → circonstances). */
const ROLE_LEGEND_ORDER: Array<Exclude<TLessonWordRole, null>> = [
  "subject",
  "object",
  "place",
  "possession",
  "recipient",
  "instrument",
];

export interface TRoleLegendItem {
  role: Exclude<TLessonWordRole, null>;
  color: string;
  label: string;
}

/**
 * Légende complète des rôles fonctionnels — dérivée de la source de vérité
 * (ROLE_COLOR_MAP + FUNCTION_COLOR_MAP dans russian.ts), jamais une liste de
 * hex codée en dur. Utilisée par l'onboarding pour rester synchronisée avec
 * les couleurs réellement utilisées dans le Reader/Explorer.
 */
export function buildRoleLegend(): TRoleLegendItem[] {
  return ROLE_LEGEND_ORDER.map((role) => ({
    role,
    color: getFunctionColorHex(ROLE_COLOR_MAP[role]) ?? "",
    label: ROLE_ONBOARDING_LABEL[role],
  }));
}

const COLOR_ROLE_MAP: Record<TReaderFunctionColor, Exclude<TLessonWordRole, null>> =
  {
    blue: "subject",
    coral: "object",
    green: "place",
    violet: "possession",
    amber: "recipient",
    teal: "instrument",
  };

export function lessonRoleToFunctionColor(
  role: TLessonWordRole,
): TReaderFunctionColor | undefined {
  if (!role) {
    return undefined;
  }

  return ROLE_COLOR_MAP[role];
}

/** Inverse de lessonRoleToFunctionColor — pour colorer via functionColor d'un encounter. */
export function functionColorToLessonRole(
  color: string | null | undefined,
): TLessonWordRole {
  if (!color || !(color in COLOR_ROLE_MAP)) {
    return null;
  }

  return COLOR_ROLE_MAP[color as TReaderFunctionColor];
}

/** Mappe le rôle orchestrateur / Reader vers le rôle Leçon. */
export function functionalRoleToLessonRole(
  role: string | null | undefined,
): TLessonWordRole {
  if (!role) {
    return null;
  }

  switch (role.toLowerCase()) {
    case "subject":
      return "subject";
    case "object_direct":
    case "object":
      return "object";
    case "object_indirect":
    case "recipient":
      return "recipient";
    case "possession":
      return "possession";
    case "location":
    case "place":
      return "place";
    case "instrument":
      return "instrument";
    default:
      return null;
  }
}

export function resolveLessonRoleFromEncounter(encounter: {
  functionalRole?: string | null;
  functionColor?: string | null;
} | null): TLessonWordRole {
  if (!encounter) {
    return null;
  }

  return (
    functionalRoleToLessonRole(encounter.functionalRole) ??
    functionColorToLessonRole(encounter.functionColor)
  );
}

/** Annotate chaque token d'une forme / phrase avec un rôle uniforme (couleurs Leçons). */
export function buildLessonWordsWithRole(
  russian: string,
  role: TLessonWordRole,
): TLessonExampleWord[] {
  if (!role) {
    return [];
  }

  return tokenizeSentence(russian)
    .map((token) => normalizeToken(token))
    .filter(Boolean)
    .map((text) => ({ text, role }));
}

/**
 * Colorie les tokens qui matchent la surface rencontrée (accents ignorés).
 */
export function buildLessonWordsHighlightingSurface(
  russian: string,
  surface: string | null | undefined,
  role: TLessonWordRole,
): TLessonExampleWord[] {
  if (!role || !surface?.trim()) {
    return [];
  }

  const target = normalizeToken(surface).toLowerCase().replace(/\u0301/g, "");

  return tokenizeSentence(russian)
    .map((token) => normalizeToken(token))
    .filter(Boolean)
    .map((text) => {
      const normalized = text.toLowerCase().replace(/\u0301/g, "");
      const matches =
        normalized === target ||
        target.includes(normalized) ||
        normalized.includes(target);

      return { text, role: matches ? role : null };
    });
}

const CYRILLIC_PATTERN = /[\u0400-\u04FF\u0301]/;

export function containsCyrillic(text: string): boolean {
  return CYRILLIC_PATTERN.test(text);
}
