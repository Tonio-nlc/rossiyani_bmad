/**
 * Hydratation morphologie curée (M2) — motif ensureConceptGraphHydrated.
 *
 * 1. Seed TS au load des modules verbes/pronoms/cas (comportement actuel).
 * 2. Premier ensureMorphologyCuratedHydrated() : SELECT source=curated,
 *    assemblage local, puis rebuild des Maps/indexes SYNCHRONES.
 * 3. La Promise ne se résout QU'APRÈS rebuildCaseRoutingIndexes() —
 *    aucun override sync du même request ne voit un état mi-hydraté.
 * 4. Échec / table vide → 'memory', seed TS intact, pas d'erreur user.
 */

import {
  CURATED_PRESENT_VERBS,
  replaceCuratedVerbIndexes,
  stripStressMarks,
  type TCuratedVerbPresent,
  type TPresentPersonKey,
} from "@/lib/knowledge/morphology/curated/present-verbs";
import {
  CURATED_PRONOUNS,
  replaceCuratedPronounParadigms,
  type TPronounCase,
  type TPronounParadigm,
} from "@/lib/knowledge/morphology/curated/pronouns";
import { rebuildCaseRoutingIndexes } from "@/lib/knowledge/concept-graph/case-concept-routing";

import { logCuratedMorphologyDivergence } from "./divergence";
import {
  formDisplayValue,
  loadCuratedMorphologyFromDb,
  type TCuratedMorphologyDbPayload,
  type TMorphologyFormRow,
  type TMorphologyLemmaRow,
} from "./load-from-db";

const PERSON_KEYS: TPresentPersonKey[] = [
  "sg1",
  "sg2",
  "sg3",
  "pl1",
  "pl2",
  "pl3",
];

const PAST_KEYS = ["m", "f", "n", "pl"] as const;

const PRONOUN_CASES: TPronounCase[] = [
  "nominative",
  "genitive",
  "dative",
  "accusative",
  "instrumental",
  "prepositional",
];

function cloneVerb(verb: TCuratedVerbPresent): TCuratedVerbPresent {
  return {
    lemma: verb.lemma,
    aliases: [...verb.aliases],
    conjugationClass: verb.conjugationClass,
    defective: verb.defective
      ? {
          allowedPersons: [...verb.defective.allowedPersons],
          note: verb.defective.note,
        }
      : undefined,
    present: { ...verb.present },
    endings: { ...verb.endings },
    past: verb.past ? { ...verb.past } : undefined,
  };
}

function clonePronoun(paradigm: TPronounParadigm): TPronounParadigm {
  const forms: TPronounParadigm["forms"] = {};
  for (const c of PRONOUN_CASES) {
    const entry = paradigm.forms[c];
    if (!entry) continue;
    forms[c] = {
      plain: entry.plain,
      withN: entry.withN,
      alt: entry.alt ? [...entry.alt] : undefined,
    };
  }
  return {
    lemma: paradigm.lemma,
    reflexive: paradigm.reflexive,
    forms,
  };
}

function formsByLemmaId(
  payload: TCuratedMorphologyDbPayload,
): Map<string, TMorphologyFormRow[]> {
  const map = new Map<string, TMorphologyFormRow[]>();
  for (const form of payload.forms) {
    const list = map.get(form.morphology_lemma_id) ?? [];
    list.push(form);
    map.set(form.morphology_lemma_id, list);
  }
  return map;
}

function buildFormLookup(
  payload: TCuratedMorphologyDbPayload,
  lemmasById: Map<string, TMorphologyLemmaRow>,
): Map<string, string> {
  const lookup = new Map<string, string>();
  for (const form of payload.forms) {
    const lemma = lemmasById.get(form.morphology_lemma_id);
    if (!lemma) continue;
    const key = `${lemma.lemma_bare}\0${form.slot}\0${form.variant}`;
    lookup.set(key, formDisplayValue(form));
  }
  return lookup;
}

function assembleVerbs(
  payload: TCuratedMorphologyDbPayload,
): TCuratedVerbPresent[] {
  const lemmasById = new Map(payload.lemmas.map((l) => [l.id, l]));
  const byLemmaForms = formsByLemmaId(payload);
  const verbLemmas = payload.lemmas.filter((l) => l.pos === "verb");
  const tsByBare = new Map(
    CURATED_PRESENT_VERBS.map((v) => [stripStressMarks(v.lemma), v] as const),
  );

  const out: TCuratedVerbPresent[] = [];

  for (const lemma of verbLemmas) {
    const ts = tsByBare.get(stripStressMarks(lemma.lemma_bare));
    if (!ts) {
      // Lemmes verbaux curés hors CURATED_PRESENT_VERBS (ex. inf seuls) :
      // pas d'API present-verbs à servir — ignorés ici.
      continue;
    }

    const verb = cloneVerb(ts);
    if (lemma.lemma_stressed) {
      if (lemma.lemma_stressed !== ts.lemma) {
        logCuratedMorphologyDivergence({
          kind: "verb",
          lemmaBare: lemma.lemma_bare,
          slot: "lemma",
          tsValue: ts.lemma,
          dbValue: lemma.lemma_stressed,
        });
      }
      verb.lemma = lemma.lemma_stressed;
    }

    const forms = byLemmaForms.get(lemma.id) ?? [];
    for (const form of forms) {
      const dbValue = formDisplayValue(form);

      if (form.slot.startsWith("present.")) {
        const person = form.slot.slice("present.".length) as TPresentPersonKey;
        if (!PERSON_KEYS.includes(person)) continue;
        const tsForm = ts.present[person];
        if (tsForm && tsForm !== dbValue) {
          logCuratedMorphologyDivergence({
            kind: "verb",
            lemmaBare: lemma.lemma_bare,
            slot: form.slot,
            variant: form.variant,
            tsValue: tsForm,
            dbValue,
          });
        }
        verb.present[person] = dbValue;
        if (form.ending) {
          const tsEnding = ts.endings[person];
          if (tsEnding && tsEnding !== form.ending) {
            logCuratedMorphologyDivergence({
              kind: "verb",
              lemmaBare: lemma.lemma_bare,
              slot: `${form.slot}.ending`,
              tsValue: tsEnding,
              dbValue: form.ending,
            });
          }
          verb.endings[person] = form.ending;
        }
        continue;
      }

      if (form.slot.startsWith("past.")) {
        const g = form.slot.slice("past.".length) as (typeof PAST_KEYS)[number];
        if (!PAST_KEYS.includes(g)) continue;
        const tsForm = ts.past?.[g];
        if (tsForm && tsForm !== dbValue) {
          logCuratedMorphologyDivergence({
            kind: "verb",
            lemmaBare: lemma.lemma_bare,
            slot: form.slot,
            tsValue: tsForm,
            dbValue,
          });
        }
        verb.past = verb.past ?? { m: dbValue };
        verb.past[g] = dbValue;
      }
    }

    const sense = payload.senses.find((s) => s.morphology_lemma_id === lemma.id);
    if (sense?.allowed_slots?.length && verb.defective) {
      const persons = sense.allowed_slots
        .filter((s) => s.startsWith("present."))
        .map((s) => s.slice("present.".length) as TPresentPersonKey)
        .filter((p) => PERSON_KEYS.includes(p));
      if (persons.length > 0) {
        verb.defective = {
          ...verb.defective,
          allowedPersons: persons,
          note: sense.notes_fr ?? verb.defective.note,
        };
      }
    }

    out.push(verb);
  }

  // Garder tout verbe TS absent de la DB (ne devrait pas arriver si verify PASS).
  for (const ts of CURATED_PRESENT_VERBS) {
    const bare = stripStressMarks(ts.lemma);
    if (!out.some((v) => stripStressMarks(v.lemma) === bare)) {
      out.push(cloneVerb(ts));
    }
  }

  return out;
}

function assemblePronouns(
  payload: TCuratedMorphologyDbPayload,
): TPronounParadigm[] {
  const byLemmaForms = formsByLemmaId(payload);
  const pronounLemmas = payload.lemmas.filter((l) => l.pos === "pronoun");
  const tsByBare = new Map(
    CURATED_PRONOUNS.map((p) => [stripStressMarks(p.lemma), p] as const),
  );

  const out: TPronounParadigm[] = [];

  for (const lemma of pronounLemmas) {
    const ts = tsByBare.get(stripStressMarks(lemma.lemma_bare));
    if (!ts) {
      // Possessifs / nominatifs isolés hors paradigme personnel — hors API pronom.
      continue;
    }

    const paradigm = clonePronoun(ts);
    if (lemma.lemma_stressed && lemma.lemma_stressed !== ts.lemma) {
      logCuratedMorphologyDivergence({
        kind: "pronoun",
        lemmaBare: lemma.lemma_bare,
        slot: "lemma",
        tsValue: ts.lemma,
        dbValue: lemma.lemma_stressed,
      });
      paradigm.lemma = lemma.lemma_stressed;
    }

    const forms = byLemmaForms.get(lemma.id) ?? [];
    for (const form of forms) {
      if (!form.slot.startsWith("case.")) continue;
      const pronounCase = form.slot.slice("case.".length) as TPronounCase;
      if (!PRONOUN_CASES.includes(pronounCase)) continue;

      const dbValue = formDisplayValue(form);
      const entry = paradigm.forms[pronounCase] ?? {};
      const tsEntry = ts.forms[pronounCase];

      if (form.variant === "plain") {
        if (tsEntry?.plain && tsEntry.plain !== dbValue) {
          logCuratedMorphologyDivergence({
            kind: "pronoun",
            lemmaBare: lemma.lemma_bare,
            slot: form.slot,
            variant: "plain",
            tsValue: tsEntry.plain,
            dbValue,
          });
        }
        entry.plain = dbValue;
      } else if (form.variant === "with_n") {
        if (tsEntry?.withN && tsEntry.withN !== dbValue) {
          logCuratedMorphologyDivergence({
            kind: "pronoun",
            lemmaBare: lemma.lemma_bare,
            slot: form.slot,
            variant: "with_n",
            tsValue: tsEntry.withN,
            dbValue,
          });
        }
        entry.withN = dbValue;
      } else if (form.variant === "alt") {
        const tsAlt = tsEntry?.alt?.[0];
        if (tsAlt && tsAlt !== dbValue) {
          logCuratedMorphologyDivergence({
            kind: "pronoun",
            lemmaBare: lemma.lemma_bare,
            slot: form.slot,
            variant: "alt",
            tsValue: tsAlt,
            dbValue,
          });
        }
        entry.alt = [dbValue];
      }

      paradigm.forms[pronounCase] = entry;
    }

    out.push(paradigm);
  }

  for (const ts of CURATED_PRONOUNS) {
    const bare = stripStressMarks(ts.lemma);
    if (!out.some((p) => stripStressMarks(p.lemma) === bare)) {
      out.push(clonePronoun(ts));
    }
  }

  return out;
}

let hydratePromise: Promise<"db" | "memory"> | null = null;

/**
 * Charge morphology_* curated une fois par process.
 * Rebuild verb/pronoun/case indexes avant de résoudre — l'appelant qui
 * `await` cette Promise est garanti de voir les chaînes DB (si succès).
 */
export async function ensureMorphologyCuratedHydrated(): Promise<
  "db" | "memory"
> {
  if (hydratePromise) {
    return hydratePromise;
  }

  hydratePromise = (async () => {
    try {
      const payload = await loadCuratedMorphologyFromDb();
      if (!payload) {
        return "memory";
      }

      // Assemblage 100 % local — aucun index mutable touché tant que tout n'est
      // pas prêt (évite une fenêtre mi-DB / mi-TS si une étape échoue).
      const verbs = assembleVerbs(payload);
      const pronouns = assemblePronouns(payload);
      const lemmasById = new Map(payload.lemmas.map((l) => [l.id, l]));
      const formLookup = buildFormLookup(payload, lemmasById);

      replaceCuratedVerbIndexes(verbs);
      replaceCuratedPronounParadigms(pronouns);
      // B3 Option 2 : chaînes depuis lookup DB ; structure ambiguïté/animacy TS.
      rebuildCaseRoutingIndexes(formLookup);

      return "db";
    } catch (error) {
      console.warn(
        "[morphology curated] hydrate failed — keeping TS seed",
        error,
      );
      return "memory";
    }
  })();

  return hydratePromise;
}
