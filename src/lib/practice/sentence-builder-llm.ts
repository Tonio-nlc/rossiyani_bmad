import OpenAI from "openai";
import { z } from "zod";

import { parseLlmJson } from "@/lib/practice/parse-llm-json";
import type { TSentenceBuilderResult } from "@/types/practice";

const SYSTEM_PROMPT = `Tu es le module Practice de Rossiyani, une application
d'apprentissage du russe par la compréhension.

Ta mission : évaluer une phrase russe composée par un apprenant
et expliquer les erreurs grammaticales dans le style de la méthode
Rossiyani.

RÈGLES ABSOLUES :
1. Répondre UNIQUEMENT en JSON valide
2. Ne jamais dire juste "correct" ou "incorrect" sans explication
3. Chaque feedback explique le POURQUOI grammatical en langage simple
4. Utiliser les concepts de rôle fonctionnel (sujet, objet, lieu...)
   pas la nomenclature abstraite seule
5. Être encourageant mais précis
6. Réponse en français

FORMAT JSON strict :
{
  "isCorrect": boolean,
  "positives": ["ce qui fonctionne bien, avec explication"],
  "corrections": [{
    "original": "la partie incorrecte",
    "corrected": "la version correcte",
    "explanation": "pourquoi cette forme est nécessaire ici"
  }],
  "correctedSentence": "phrase entière corrigée si nécessaire",
  "explanation": "explication générale de la construction"
}`;

const sentenceBuilderResponseSchema = z.object({
  isCorrect: z.boolean(),
  positives: z.array(z.string()),
  corrections: z.array(
    z.object({
      original: z.string(),
      corrected: z.string(),
      explanation: z.string(),
    }),
  ),
  correctedSentence: z.string(),
  explanation: z.string(),
});

export async function evaluateSentence(
  idea: string,
  sentence: string,
): Promise<TSentenceBuilderResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY manquante");
  }

  const client = new OpenAI({ apiKey });

  const response = await client.responses.create({
    model,
    max_output_tokens: 800,
    instructions: SYSTEM_PROMPT,
    input: `Idée de l'apprenant : ${idea}\nPhrase russe proposée : ${sentence}`,
  });

  const outputText = response.output_text?.trim();

  if (!outputText) {
    throw new Error("Réponse LLM vide");
  }

  return parseLlmJson(
    outputText,
    sentenceBuilderResponseSchema,
    "Réponse LLM invalide : le JSON d'évaluation n'a pas pu être analysé",
  );
}
