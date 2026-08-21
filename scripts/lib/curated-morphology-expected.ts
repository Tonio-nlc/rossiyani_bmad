/**
 * Shared expected curated morphology payload (TS → row shapes).
 * Used by import-curated-morphology.ts and verify-curated-morphology.ts.
 * No DB I/O — pure collect from curated modules.
 */

import {
  CURATED_ADJECTIVES,
  CURATED_AGREEMENT_NOUNS,
  CURATED_ANNA,
  CURATED_AUDITORIYA,
  CURATED_CHITAT,
  CURATED_DELAT,
  CURATED_GOVORIT,
  CURATED_KARTA,
  CURATED_KNIGA,
  CURATED_MOSKVA,
  CURATED_MOTION,
  CURATED_NAJTI_PAST,
  CURATED_NOUNS_GENDER,
  CURATED_OKNO_CASES,
  CURATED_PISAT,
  CURATED_POSSESSIVE,
  CURATED_PRESENT_SG2,
  CURATED_PRESENT_VERBS,
  CURATED_PROCHITAT,
  CURATED_PRONOUNS,
  CURATED_SLUCHITSYA_PAST,
  CURATED_STOL,
  CURATED_UNIVERSITET,
  CURATED_VRACH,
  type TCuratedVerbPresent,
  type TPresentPersonKey,
  type TPronounCase,
  type TPronounParadigm,
} from "@/lib/knowledge/morphology/curated";
import {
  canonicalizeLemmaForm,
  countRussianVowels,
  hasStressMark,
  isAllowedLemmaFormCharset,
  stripStressMark,
} from "@/lib/vocabulary/canonicalize-lemma-form";

export const CURATED_SOURCE = "curated" as const;

export type TStressStatus = "present" | "missing" | "unknown";
export type TVariant = "plain" | "with_n" | "alt";

export type TLemmaRow = {
  lemma_bare: string;
  lemma_stressed: string | null;
  stress_status: TStressStatus;
  pos: string;
  aspect: string | null;
  conjugation_class: number | null;
  app_lemma_id: string | null;
  source: typeof CURATED_SOURCE;
  source_version: string;
};

export type TFormRow = {
  lemma_bare: string;
  lemma_pos: string;
  lemma_aspect: string | null;
  slot: string;
  variant: TVariant;
  form_bare: string;
  form_stressed: string | null;
  stress_status: TStressStatus;
  ending: string | null;
  source: typeof CURATED_SOURCE;
  source_version: string;
};

export type TSenseRow = {
  lemma_bare: string;
  lemma_pos: string;
  lemma_aspect: string | null;
  sense_key: string;
  label_fr: string | null;
  allowed_slots: string[];
  notes_fr: string | null;
  validated: boolean;
  source: typeof CURATED_SOURCE;
  source_version: string;
};

export type TFormDraft = {
  lemma: string;
  pos: string;
  aspect: string | null;
  conjugation_class: number | null;
  slot: string;
  variant: TVariant;
  form: string;
  ending: string | null;
  priority: number; // lower wins on (lemma,slot,variant)
};

const PRIO = { pronouns: 0, "present-verbs": 1, forms: 2 } as const;

export function lemmaKey(bare: string, pos: string, aspect: string | null): string {
  return `${bare}\0${pos}\0${aspect ?? ""}`;
}

export function formKey(
  bare: string,
  pos: string,
  aspect: string | null,
  slot: string,
  variant: TVariant,
): string {
  return `${lemmaKey(bare, pos, aspect)}\0${slot}\0${variant}`;
}

export function toBare(form: string): string {
  return stripStressMark(canonicalizeLemmaForm(form));
}

function isMonosyllable(form: string): boolean {
  return countRussianVowels(canonicalizeLemmaForm(form)) === 1;
}

export function splitStress(formRaw: string): {
  bare: string;
  stressed: string | null;
  stress_status: TStressStatus;
} {
  const form = canonicalizeLemmaForm(formRaw);
  if (!isAllowedLemmaFormCharset(form)) {
    throw new Error(`Charset invalide : « ${form} »`);
  }
  const bare = toBare(form);
  if (isMonosyllable(form)) {
    return { bare, stressed: null, stress_status: "missing" };
  }
  if (hasStressMark(form)) {
    return { bare, stressed: form, stress_status: "present" };
  }
  return { bare, stressed: null, stress_status: "missing" };
}

function addDraft(bucket: TFormDraft[], draft: TFormDraft): void {
  bucket.push(draft);
}

function collectPronounDrafts(): TFormDraft[] {
  const out: TFormDraft[] = [];
  const cases: TPronounCase[] = [
    "nominative",
    "genitive",
    "dative",
    "accusative",
    "instrumental",
    "prepositional",
  ];

  for (const paradigm of CURATED_PRONOUNS as readonly TPronounParadigm[]) {
    for (const c of cases) {
      const cell = paradigm.forms[c];
      if (!cell) continue;
      const slot = `case.${c}`;
      if (cell.plain) {
        addDraft(out, {
          lemma: paradigm.lemma,
          pos: "pronoun",
          aspect: null,
          conjugation_class: null,
          slot,
          variant: "plain",
          form: cell.plain,
          ending: null,
          priority: PRIO.pronouns,
        });
      }
      if (cell.withN) {
        addDraft(out, {
          lemma: paradigm.lemma,
          pos: "pronoun",
          aspect: null,
          conjugation_class: null,
          slot,
          variant: "with_n",
          form: cell.withN,
          ending: null,
          priority: PRIO.pronouns,
        });
      }
      const alts = cell.alt ?? [];
      if (alts.length > 1) {
        throw new Error(
          `Plusieurs alt pour ${paradigm.lemma} ${slot} — Model B n'autorise qu'un variant 'alt'`,
        );
      }
      for (const alt of alts) {
        addDraft(out, {
          lemma: paradigm.lemma,
          pos: "pronoun",
          aspect: null,
          conjugation_class: null,
          slot,
          variant: "alt",
          form: alt,
          ending: null,
          priority: PRIO.pronouns,
        });
      }
    }
  }
  return out;
}

function collectVerbDrafts(sourceVersion: string): { forms: TFormDraft[]; senses: TSenseRow[] } {
  const forms: TFormDraft[] = [];
  const senses: TSenseRow[] = [];
  const persons: TPresentPersonKey[] = [
    "sg1",
    "sg2",
    "sg3",
    "pl1",
    "pl2",
    "pl3",
  ];

  for (const verb of CURATED_PRESENT_VERBS as TCuratedVerbPresent[]) {
    for (const person of persons) {
      const form = verb.present[person];
      if (!form) continue;
      addDraft(forms, {
        lemma: verb.lemma,
        pos: "verb",
        aspect: null,
        conjugation_class: verb.conjugationClass,
        slot: `present.${person}`,
        variant: "plain",
        form,
        ending: verb.endings[person] ?? null,
        priority: PRIO["present-verbs"],
      });
    }
    if (verb.past) {
      for (const g of ["m", "f", "n", "pl"] as const) {
        const form = verb.past[g];
        if (!form) continue;
        addDraft(forms, {
          lemma: verb.lemma,
          pos: "verb",
          aspect: null,
          conjugation_class: verb.conjugationClass,
          slot: `past.${g}`,
          variant: "plain",
          form,
          ending: null,
          priority: PRIO["present-verbs"],
        });
      }
    }

    if (verb.defective) {
      const bare = toBare(verb.lemma);
      const senseKey =
        bare === "болеть" ? "boleть.hurt" : "случиться.defective";
      senses.push({
        lemma_bare: bare,
        lemma_pos: "verb",
        lemma_aspect: null,
        sense_key: senseKey,
        label_fr: null,
        allowed_slots: verb.defective.allowedPersons.map(
          (p) => `present.${p}`,
        ),
        notes_fr: verb.defective.note,
        validated: true,
        source: CURATED_SOURCE,
        source_version: sourceVersion,
      });
    }
  }
  return { forms, senses };
}

function collectFormsTsDrafts(): TFormDraft[] {
  const out: TFormDraft[] = [];
  const p = PRIO.forms;

  // CURATED_CHITAT — forms + endings (si present-verbs gagne, endings viennent de là)
  {
    const inf = CURATED_CHITAT.infinitive;
    addDraft(out, {
      lemma: inf,
      pos: "verb",
      aspect: null,
      conjugation_class: 1,
      slot: "inf",
      variant: "plain",
      form: inf,
      ending: null,
      priority: p,
    });
    for (const person of ["sg1", "sg2", "sg3"] as const) {
      addDraft(out, {
        lemma: inf,
        pos: "verb",
        aspect: null,
        conjugation_class: 1,
        slot: `present.${person}`,
        variant: "plain",
        form: CURATED_CHITAT.present[person],
        ending: CURATED_CHITAT.endings[person],
        priority: p,
      });
    }
    addDraft(out, {
      lemma: inf,
      pos: "verb",
      aspect: null,
      conjugation_class: 1,
      slot: "past.m",
      variant: "plain",
      form: CURATED_CHITAT.past.m,
      ending: null,
      priority: p,
    });
  }

  addDraft(out, {
    lemma: CURATED_PROCHITAT.infinitive,
    pos: "verb",
    aspect: null,
    conjugation_class: null,
    slot: "inf",
    variant: "plain",
    form: CURATED_PROCHITAT.infinitive,
    ending: null,
    priority: p,
  });

  for (const pair of [CURATED_DELAT, CURATED_PISAT, CURATED_GOVORIT]) {
    for (const form of [pair.imperfective, pair.perfective]) {
      addDraft(out, {
        lemma: form,
        pos: "verb",
        aspect: null,
        conjugation_class: null,
        slot: "inf",
        variant: "plain",
        form,
        ending: null,
        priority: p,
      });
    }
  }

  for (const [key, form] of Object.entries(CURATED_MOTION) as [
    keyof typeof CURATED_MOTION,
    string,
  ][]) {
    if (key === "idu") {
      addDraft(out, {
        lemma: CURATED_MOTION.idti,
        pos: "verb",
        aspect: null,
        conjugation_class: null,
        slot: "present.sg1",
        variant: "plain",
        form,
        ending: null,
        priority: p,
      });
    } else {
      addDraft(out, {
        lemma: form,
        pos: "verb",
        aspect: null,
        conjugation_class: null,
        slot: "inf",
        variant: "plain",
        form,
        ending: null,
        priority: p,
      });
    }
  }

  for (const form of Object.values(CURATED_POSSESSIVE)) {
    addDraft(out, {
      lemma: form,
      pos: "pronoun",
      aspect: null,
      conjugation_class: null,
      slot: "case.nominative",
      variant: "plain",
      form,
      ending: null,
      priority: p,
    });
  }

  const nounObjs: Array<{
    nom: string;
    cases: Record<string, string>;
  }> = [
    { nom: CURATED_KNIGA.nom, cases: CURATED_KNIGA },
    { nom: CURATED_STOL.nom, cases: CURATED_STOL },
    { nom: CURATED_VRACH.nom, cases: CURATED_VRACH },
    { nom: CURATED_UNIVERSITET.nom, cases: CURATED_UNIVERSITET },
    { nom: CURATED_ANNA.nom, cases: CURATED_ANNA },
    { nom: CURATED_KARTA.nom, cases: CURATED_KARTA },
    { nom: CURATED_AUDITORIYA.nom, cases: CURATED_AUDITORIYA },
    { nom: CURATED_OKNO_CASES.nom, cases: CURATED_OKNO_CASES },
  ];
  const caseKeyToSlot: Record<string, string> = {
    nom: "case.nominative",
    gen: "case.genitive",
    dat: "case.dative",
    acc: "case.accusative",
    instr: "case.instrumental",
    prep: "case.prepositional",
  };
  for (const obj of nounObjs) {
    for (const [k, form] of Object.entries(obj.cases)) {
      const slot = caseKeyToSlot[k];
      if (!slot) continue;
      addDraft(out, {
        lemma: obj.nom,
        pos: "noun",
        aspect: null,
        conjugation_class: null,
        slot,
        variant: "plain",
        form,
        ending: null,
        priority: p,
      });
    }
  }

  const adjMap: Record<
    keyof typeof CURATED_ADJECTIVES,
    { lemma: string; slot: string }
  > = {
    novyj: { lemma: CURATED_ADJECTIVES.novyj, slot: "adj.m.nominative" },
    novaya: { lemma: CURATED_ADJECTIVES.novyj, slot: "adj.f.nominative" },
    novoe: { lemma: CURATED_ADJECTIVES.novyj, slot: "adj.n.nominative" },
    novye: { lemma: CURATED_ADJECTIVES.novyj, slot: "adj.pl.nominative" },
    horoshij: { lemma: CURATED_ADJECTIVES.horoshij, slot: "adj.m.nominative" },
    horoshaya: { lemma: CURATED_ADJECTIVES.horoshij, slot: "adj.f.nominative" },
    horoshee: { lemma: CURATED_ADJECTIVES.horoshij, slot: "adj.n.nominative" },
  };
  for (const key of Object.keys(adjMap) as (keyof typeof CURATED_ADJECTIVES)[]) {
    const { lemma, slot } = adjMap[key];
    addDraft(out, {
      lemma,
      pos: "adjective",
      aspect: null,
      conjugation_class: null,
      slot,
      variant: "plain",
      form: CURATED_ADJECTIVES[key],
      ending: null,
      priority: p,
    });
  }

  for (const form of Object.values(CURATED_AGREEMENT_NOUNS)) {
    addDraft(out, {
      lemma: form,
      pos: "noun",
      aspect: null,
      conjugation_class: null,
      slot: "case.nominative",
      variant: "plain",
      form,
      ending: null,
      priority: p,
    });
  }
  for (const form of Object.values(CURATED_NOUNS_GENDER)) {
    addDraft(out, {
      lemma: form,
      pos: "noun",
      aspect: null,
      conjugation_class: null,
      slot: "case.nominative",
      variant: "plain",
      form,
      ending: null,
      priority: p,
    });
  }

  const sg2: Record<keyof typeof CURATED_PRESENT_SG2, string> = {
    delaesh: CURATED_DELAT.imperfective,
    govorish: CURATED_GOVORIT.imperfective,
    pishesh: CURATED_PISAT.imperfective,
  };
  for (const key of Object.keys(sg2) as (keyof typeof CURATED_PRESENT_SG2)[]) {
    addDraft(out, {
      lemma: sg2[key],
      pos: "verb",
      aspect: null,
      conjugation_class: null,
      slot: "present.sg2",
      variant: "plain",
      form: CURATED_PRESENT_SG2[key],
      ending: null,
      priority: p,
    });
  }

  // Moscou — formes mono-mot uniquement
  addDraft(out, {
    lemma: "Москва́",
    pos: "noun",
    aspect: null,
    conjugation_class: null,
    slot: "case.genitive",
    variant: "plain",
    form: CURATED_MOSKVA.genitive,
    ending: null,
    priority: p,
  });
  addDraft(out, {
    lemma: "Москва́",
    pos: "noun",
    aspect: null,
    conjugation_class: null,
    slot: "case.prepositional",
    variant: "plain",
    form: CURATED_MOSKVA.prepositional,
    ending: null,
    priority: p,
  });

  for (const past of [CURATED_NAJTI_PAST, CURATED_SLUCHITSYA_PAST]) {
    addDraft(out, {
      lemma: past.infinitive,
      pos: "verb",
      aspect: null,
      conjugation_class: null,
      slot: "inf",
      variant: "plain",
      form: past.infinitive,
      ending: null,
      priority: p,
    });
    for (const g of ["m", "f", "n", "pl"] as const) {
      if (!(g in past)) continue;
      const form = (past as Record<string, string>)[g];
      if (!form) continue;
      addDraft(out, {
        lemma: past.infinitive,
        pos: "verb",
        aspect: null,
        conjugation_class: null,
        slot: `past.${g}`,
        variant: "plain",
        form,
        ending: null,
        priority: p,
      });
    }
  }

  return out;
}

export function buildExpectedCuratedPayload(
  sourceVersion: string,
  appLemmaByBare: Map<string, string | "ambiguous" | null>,
): {
  lemmas: TLemmaRow[];
  forms: TFormRow[];
  senses: TSenseRow[];
  endingsAttached: number;
} {
  const pronounDrafts = collectPronounDrafts();
  const { forms: verbDrafts, senses } = collectVerbDrafts(sourceVersion);
  const formsTsDrafts = collectFormsTsDrafts();
  const all = [...pronounDrafts, ...verbDrafts, ...formsTsDrafts];

  // Dedup (lemma,slot,variant) — priorité basse gagne ; endings : garder si winner n'en a pas
  type Acc = TFormDraft & { bareLemma: string };
  const byForm = new Map<string, Acc>();
  for (const d of all) {
    const bareLemma = toBare(d.lemma);
    const key = formKey(bareLemma, d.pos, d.aspect, d.slot, d.variant);
    const existing = byForm.get(key);
    if (!existing || d.priority < existing.priority) {
      byForm.set(key, { ...d, bareLemma });
    } else if (
      existing &&
      d.priority > existing.priority &&
      !existing.ending &&
      d.ending
    ) {
      existing.ending = d.ending;
    } else if (
      existing &&
      d.priority === existing.priority &&
      existing.form !== d.form
    ) {
      throw new Error(
        `Collision (lemma,slot,variant) : ${key} « ${existing.form} » vs « ${d.form} »`,
      );
    }
  }

  const lemmaMeta = new Map<
    string,
    {
      lemma: string;
      pos: string;
      aspect: string | null;
      conjugation_class: number | null;
    }
  >();
  for (const d of byForm.values()) {
    const lk = lemmaKey(d.bareLemma, d.pos, d.aspect);
    const prev = lemmaMeta.get(lk);
    if (!prev) {
      lemmaMeta.set(lk, {
        lemma: d.lemma,
        pos: d.pos,
        aspect: d.aspect,
        conjugation_class: d.conjugation_class,
      });
    } else if (
      prev.conjugation_class == null &&
      d.conjugation_class != null
    ) {
      prev.conjugation_class = d.conjugation_class;
    }
  }

  const lemmas: TLemmaRow[] = [];
  for (const [lk, meta] of lemmaMeta) {
    const split = splitStress(meta.lemma);
    const app = appLemmaByBare.get(split.bare);
    lemmas.push({
      lemma_bare: split.bare,
      lemma_stressed: split.stressed,
      stress_status: split.stress_status,
      pos: meta.pos,
      aspect: meta.aspect,
      conjugation_class: meta.conjugation_class,
      app_lemma_id: app && app !== "ambiguous" ? app : null,
      source: CURATED_SOURCE,
      source_version: sourceVersion,
    });
    void lk;
  }

  const forms: TFormRow[] = [];
  let endingsAttached = 0;
  for (const d of byForm.values()) {
    const split = splitStress(d.form);
    if (d.ending) endingsAttached += 1;
    forms.push({
      lemma_bare: d.bareLemma,
      lemma_pos: d.pos,
      lemma_aspect: d.aspect,
      slot: d.slot,
      variant: d.variant,
      form_bare: split.bare,
      form_stressed: split.stressed,
      stress_status: split.stress_status,
      ending: d.ending,
      source: CURATED_SOURCE,
      source_version: sourceVersion,
    });
  }

  // Normaliser sense lemma_bare
  const sensesNorm = senses.map((s) => ({
    ...s,
    lemma_bare: toBare(s.lemma_bare),
  }));

  return { lemmas, forms, senses: sensesNorm, endingsAttached };
}

