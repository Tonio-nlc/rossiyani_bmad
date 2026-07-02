import OpenAI from "openai";
import { z } from "zod";

import type { TLlmExplanationPayload } from "@/lib/orchestrator/types";

const SYSTEM_PROMPT = `Tu es l'orchestrateur linguistique de Rossiyani.

Ta mission : expliquer pourquoi un mot russe a une forme précise dans une phrase précise.

RÈGLES ABSOLUES :
1. Répondre UNIQUEMENT en JSON valide — aucun texte avant ou après
2. L'explication répond TOUJOURS à "pourquoi CE MOT a CETTE FORME dans CETTE PHRASE"
3. Ne jamais donner d'information grammaticale sans expliquer son rôle dans le sens
4. Utiliser un langage simple — pas de jargon brut sans explication immédiate
5. L'explication est en français, 2-3 phrases maximum

SYSTÈME DE COULEURS FONCTIONNELLES :
- "blue"   → sujet (fait l'action)
- "coral"  → objet direct (subit l'action)
- "green"  → lieu ou temps
- "violet" → possession ou relation entre mots
- "amber"  → destinataire (à qui, pour qui)

FORMAT DE RÉPONSE JSON strict :
{
  "lemma": "forme de base du mot",
  "translation": "traduction française du lemme",
  "functionalRole": "subject|object_direct|object_indirect|possession|location|time|manner",
  "functionColor": "blue|coral|green|violet|amber",
  "explanation": "2-3 phrases expliquant pourquoi ce mot a cette forme dans cette phrase",
  "suffix": "la terminaison qui change ex: -у, -ого, -ой",
  "suffixExplanation": "ce que cette terminaison signale en une phrase simple"
}`;

const llmResponseSchema = z.object({
  lemma: z.string().min(1),
  translation: z.string().min(1),
  functionalRole: z.string().min(1),
  functionColor: z.string().min(1),
  explanation: z.string().min(1),
  suffix: z.string(),
  suffixExplanation: z.string(),
});

function extractJsonPayload(content: string): string {
  const trimmed = content.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);

  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const objectMatch = trimmed.match(/\{[\s\S]*\}/);

  if (objectMatch?.[0]) {
    return objectMatch[0];
  }

  return trimmed;
}

function repairJsonPayload(content: string): string {
  return content
    .replace(/,\s*([}\]])/g, "$1")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"');
}

function parseLlmJson(content: string): TLlmExplanationPayload {
  const extracted = extractJsonPayload(content);

  const attempts = [extracted, repairJsonPayload(extracted)];

  for (const candidate of attempts) {
    try {
      return llmResponseSchema.parse(JSON.parse(candidate));
    } catch {
      continue;
    }
  }

  throw new Error(
    "Réponse LLM invalide : le JSON retourné n'a pas pu être analysé",
  );
}

export async function generateWordExplanation(
  surface: string,
  sentence: string,
): Promise<TLlmExplanationPayload> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY manquante");
  }

  if (!model) {
    throw new Error("OPENAI_MODEL manquante");
  }

  const client = new OpenAI({ apiKey });

  const response = await client.responses.create({
    model,
    instructions: SYSTEM_PROMPT,
    input: `Mot : ${surface}\nPhrase : ${sentence}`,
  });

  const outputText = response.output_text?.trim();

  if (!outputText) {
    throw new Error("Réponse LLM vide");
  }

  return parseLlmJson(outputText);
}
