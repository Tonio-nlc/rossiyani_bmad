/**
 * Lecture morphologie curée depuis Supabase (source='curated').
 * Aucune écriture. Erreurs → null (repli TS côté hydrate).
 */

import { createAdminClient } from "@/lib/supabase/admin";

export type TMorphologyLemmaRow = {
  id: string;
  lemma_bare: string;
  lemma_stressed: string | null;
  pos: string;
  aspect: string | null;
  conjugation_class: number | null;
};

export type TMorphologyFormRow = {
  morphology_lemma_id: string;
  slot: string;
  variant: string;
  form_bare: string;
  form_stressed: string | null;
  ending: string | null;
};

export type TMorphologySenseRow = {
  morphology_lemma_id: string;
  sense_key: string;
  allowed_slots: string[] | null;
  notes_fr: string | null;
};

export type TCuratedMorphologyDbPayload = {
  lemmas: TMorphologyLemmaRow[];
  forms: TMorphologyFormRow[];
  senses: TMorphologySenseRow[];
};

export function formDisplayValue(form: {
  form_bare: string;
  form_stressed: string | null;
}): string {
  return form.form_stressed ?? form.form_bare;
}

export async function loadCuratedMorphologyFromDb(): Promise<
  TCuratedMorphologyDbPayload | null
> {
  try {
    const supabase = createAdminClient();

    const [lemmasRes, formsRes, sensesRes] = await Promise.all([
      supabase
        .from("morphology_lemmas")
        .select(
          "id, lemma_bare, lemma_stressed, pos, aspect, conjugation_class",
        )
        .eq("source", "curated"),
      supabase
        .from("morphology_forms")
        .select(
          "morphology_lemma_id, slot, variant, form_bare, form_stressed, ending",
        )
        .eq("source", "curated"),
      supabase
        .from("morphology_sense_overrides")
        .select("morphology_lemma_id, sense_key, allowed_slots, notes_fr")
        .eq("source", "curated"),
    ]);

    if (lemmasRes.error || formsRes.error || sensesRes.error) {
      console.warn(
        "[morphology curated] SELECT failed",
        lemmasRes.error?.message ??
          formsRes.error?.message ??
          sensesRes.error?.message,
      );
      return null;
    }

    const lemmas = (lemmasRes.data ?? []) as TMorphologyLemmaRow[];
    const forms = (formsRes.data ?? []) as TMorphologyFormRow[];
    const senses = (sensesRes.data ?? []) as TMorphologySenseRow[];

    if (lemmas.length === 0 || forms.length === 0) {
      return null;
    }

    return { lemmas, forms, senses };
  } catch (error) {
    console.warn("[morphology curated] load threw", error);
    return null;
  }
}
