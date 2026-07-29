/**
 * Liste CURATÉE (arbitrage humain, pas de détection automatique) des fusions
 * de lemmes résiduelles à exécuter — PROMPT CURSOR 28/07/2026, suite de
 * npm run lemma:audit-accents (12 doublons nu/accentué + 4 paires accentuées
 * ambiguës détectées sur 260 lemmes).
 *
 * Le fondateur (russophone) a tranché les 4 paires ambiguës :
 * - бо́леть / боле́ть → DEUX MOTS DIFFÉRENTS ("avoir mal" vs "être malade") →
 *   EXCLUS de toute fusion, intentionnellement absents de CURATED_GROUPS.
 * - дума́ть, у́рок, до́мой → accents erronés (mots inexistants) → fusionnés
 *   vers leur forme correcte déjà présente en base (ду́мать, уро́к, домо́й).
 *
 * ⚠️ Ce fichier remplace SCIEMMENT `scripts/lemma-dedup/compute-groups.ts`
 * pour cette opération : ce dernier groupe par forme accent-insensible
 * (`normalizeRussianWord`), ce qui fusionnerait бо́леть/боле́ть à tort s'il
 * était relancé tel quel. Ne pas réutiliser `computeDedupGroups` ici.
 */

export interface CuratedGroup {
  /** Forme du lemme à SUPPRIMER après remap de ses références. */
  dropForm: string;
  /** Forme du lemme à CONSERVER (déjà présente en base, forme correcte). */
  keepForm: string;
  reason: "bare-accent" | "accent-correction";
}

export const CURATED_GROUPS: CuratedGroup[] = [
  // 12 doublons "forme nue" -> "forme accentuée" (même mot, accent absent
  // d'une des deux lignes).
  { dropForm: "день", keepForm: "де́нь", reason: "bare-accent" },
  { dropForm: "язык", keepForm: "язы́к", reason: "bare-accent" },
  { dropForm: "они", keepForm: "они́", reason: "bare-accent" },
  { dropForm: "каждый", keepForm: "ка́ждый", reason: "bare-accent" },
  { dropForm: "кофе", keepForm: "ко́фе", reason: "bare-accent" },
  { dropForm: "суп", keepForm: "су́п", reason: "bare-accent" },
  { dropForm: "Олег", keepForm: "Оле́г", reason: "bare-accent" },
  { dropForm: "Луи", keepForm: "Луи́", reason: "bare-accent" },
  { dropForm: "уже", keepForm: "уже́", reason: "bare-accent" },
  { dropForm: "после", keepForm: "по́сле", reason: "bare-accent" },
  { dropForm: "я", keepForm: "я́", reason: "bare-accent" },
  { dropForm: "пить", keepForm: "пи́ть", reason: "bare-accent" },

  // 3 doublons "accent erroné" -> forme correcte (arbitrage fondateur,
  // dictionnaire russe). Les DEUX formes existaient déjà accentuées en base ;
  // seule la position de l'accent différait, et une seule est un vrai mot.
  { dropForm: "дума́ть", keepForm: "ду́мать", reason: "accent-correction" },
  { dropForm: "у́рок", keepForm: "уро́к", reason: "accent-correction" },
  { dropForm: "до́мой", keepForm: "домо́й", reason: "accent-correction" },
];

/**
 * Paire explicitement EXCLUE de toute fusion — deux mots russes distincts qui
 * ne diffèrent que par la position de l'accent. Sert de garde-fou de
 * non-régression : `resolveCuratedGroups` vérifie que ni "бо́леть" ni
 * "боле́ть" n'apparaissent dans CURATED_GROUPS, et que les deux existent
 * toujours comme deux lignes distinctes en base avant ET après l'opération.
 */
export const EXCLUDED_DISTINCT_PAIR: [string, string] = ["бо́леть", "боле́ть"];

export function assertExclusionIsRespected(): void {
  const allForms = new Set(
    CURATED_GROUPS.flatMap((g) => [g.dropForm, g.keepForm]),
  );

  for (const excluded of EXCLUDED_DISTINCT_PAIR) {
    if (allForms.has(excluded)) {
      throw new Error(
        `GARDE-FOU VIOLÉ : "${excluded}" (paire accent-distinctive exclue) apparaît dans CURATED_GROUPS — corriger avant toute exécution.`,
      );
    }
  }
}
