import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { buildLinguisticProfile } from "../src/lib/knowledge/build-linguistic-profile";
import { composeConceptLesson } from "../src/lib/knowledge/concept/compose-concept-lesson";
import { composeLearningCard } from "../src/lib/knowledge/pedagogy/compose-learning-card";
import { composeTeachingScenario } from "../src/lib/knowledge/teaching-engine/compose-teaching-scenario";
import { resolveConceptGraph } from "../src/lib/knowledge/concept-graph";
import { analyzeLinguisticContext } from "../src/lib/knowledge/teaching/analyze-linguistic-context";
import { normalizeEncounterSurface } from "../src/lib/knowledge/concept/build-hero-chips";
import { getNaturalFunctionalRoleLabel } from "../src/lib/utils/russian";
import { extractTranslation } from "../src/lib/vocabulary/extract-translation";
import { parseExplanationCachePayload } from "../src/lib/vocabulary/parse-explanation-cache";
import { resolveDisplayLemma } from "../src/lib/vocabulary/resolve-display-lemma";
import { mapKnowledgeRow, type LinguisticKnowledgeRow } from "../src/lib/knowledge/types";

function loadEnvLocal() {
  const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq);
    const value = trimmed.slice(eq + 1);
    if (!process.env[key]) process.env[key] = value;
  }
}

async function main() {
  loadEnvLocal();
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: vocab, error } = await sb
    .from("user_vocabulary")
    .select(
      `
      lemma_id,
      lemmas ( form ),
      explanation_cache (
        explanation_fr,
        surface_word,
        sentence_example,
        functional_role,
        function_color
      )
    `,
    )
    .limit(20);

  if (error) throw error;

  const lemmaIds = (vocab ?? []).map((r) => r.lemma_id as string);
  const { data: knowledgeRows } = await sb
    .from("linguistic_knowledge")
    .select("*")
    .in("lemma_id", lemmaIds);

  const knowledgeByLemma = new Map(
    (knowledgeRows ?? []).map((row) => [
      row.lemma_id as string,
      mapKnowledgeRow(row as LinguisticKnowledgeRow),
    ]),
  );

  for (const row of vocab ?? []) {
    const lemmas = row.lemmas as { form: string } | { form: string }[] | null;
    const lemma = Array.isArray(lemmas) ? lemmas[0]?.form : lemmas?.form;
    const cache = Array.isArray(row.explanation_cache)
      ? row.explanation_cache[0]
      : row.explanation_cache;

    console.log(`\n==== ${lemma} ====`);
    const knowledge = knowledgeByLemma.get(row.lemma_id as string);

    if (!knowledge) {
      console.log("FAIL layer=buildKnowledge reason=no linguistic_knowledge row");
      continue;
    }

    const payload = cache
      ? parseExplanationCachePayload(
          (cache as { explanation_fr: string }).explanation_fr,
        )
      : null;
    const translation = extractTranslation(
      (cache as { explanation_fr?: string } | null)?.explanation_fr,
    );
    const displayLemma = resolveDisplayLemma(lemma!, payload?.lemmaStressed);
    const profile = buildLinguisticProfile(knowledge);
    const linguisticProfile = {
      lemma: lemma!,
      displayLemma,
      translation,
      partOfSpeech: profile.partOfSpeech,
      gender: profile.gender,
      aspect: profile.aspect,
      movementType: profile.movementType,
      morphology: profile.morphology,
      syntax: profile.syntax,
      semantics: profile.semantics,
      pedagogy: profile.pedagogy,
      paradigms: profile.paradigms,
      profile,
      government: profile.syntax.government ?? [],
      register: profile.semantics.register ?? null,
      semanticCategory: profile.semantics.semanticCategory ?? null,
      notes: profile.pedagogy.takeaway ?? null,
      tags: profile.pedagogy.relatedConcepts ?? [],
    };

    const encounter =
      cache && payload?.explanation
        ? {
            surface: (cache as { surface_word: string }).surface_word,
            sentence: (cache as { sentence_example: string }).sentence_example,
            explanation: payload.explanation,
            suffix: payload.suffix,
            suffixExplanation: payload.suffixExplanation,
            functionalRole: (cache as { functional_role: string })
              .functional_role,
            functionColor: (cache as { function_color: string | null })
              .function_color,
            roleLabel: getNaturalFunctionalRoleLabel(
              (cache as { functional_role: string }).functional_role,
            ),
          }
        : null;

    try {
      composeLearningCard({
        profile: linguisticProfile,
        displayLemma,
        translation,
        encounter,
        examples: [],
      });
      console.log("composeLearningCard: OK");
    } catch (e) {
      console.log(
        "FAIL layer=composeLearningCard/IntegrityGate",
        e instanceof Error ? `${e.name}: ${e.message}` : e,
      );
      continue;
    }

    try {
      const analysis = analyzeLinguisticContext(
        linguisticProfile,
        displayLemma,
        encounter,
      );
      const graph = resolveConceptGraph(linguisticProfile, analysis, encounter);
      console.log("resolveConceptGraph: OK primary=", graph.primary.id);

      const scenario = composeTeachingScenario({
        concept: graph.primary,
        lemma: displayLemma || lemma!,
        encounteredForm: normalizeEncounterSurface(encounter),
        encounterExample: encounter?.sentence
          ? {
              sentence: encounter.sentence,
              note: encounter.explanation,
              surface: encounter.surface,
            }
          : null,
      });

      if (!scenario) {
        console.log(
          "FAIL layer=composeTeachingScenario reason=null (fact/contrast/bridge)",
        );
        continue;
      }

      console.log(
        "composeTeachingScenario: OK bridge?",
        Boolean(scenario.bridge),
        "fact=",
        scenario.fact.slice(0, 40),
      );

      composeConceptLesson({
        profile: linguisticProfile,
        displayLemma,
        translation,
        encounter,
        examples: [],
      });
      console.log("composeConceptLesson: OK");
    } catch (e) {
      console.log(
        "FAIL layer=composeConceptLesson",
        e instanceof Error ? `${e.name}: ${e.message}` : e,
      );
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
