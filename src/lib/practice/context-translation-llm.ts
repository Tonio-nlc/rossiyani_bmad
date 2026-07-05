import OpenAI from "openai";
import { z } from "zod";

import { parseLlmJson } from "@/lib/practice/parse-llm-json";
import type {
  TContextTranslationResult,
  TTranslationRegister,
} from "@/types/practice";

const SYSTEM_PROMPT = `Tu es le module de traduction contextualisée de Rossiyani.

Ta mission : traduire une expression française en russe naturel
et expliquer les différences de construction entre les deux langues.

RÈGLES ABSOLUES :
1. Répondre UNIQUEMENT en JSON valide
2. Toujours fournir une traduction naturelle (pas mot à mot)
3. Expliquer les différences grammaticales ou culturelles
4. Donner la traduction littérale incorrecte pour montrer
   pourquoi elle ne fonctionne pas
5. Réponse en français sauf pour les exemples en russe
6. Adapter la traduction naturelle au registre demandé

FORMAT JSON strict :
{
  "naturalTranslation": "traduction russe naturelle",
  "explanation": "pourquoi cette construction en russe",
  "literalTranslation": "ce que donnerait une traduction mot à mot",
  "literalNote": "pourquoi la traduction littérale ne fonctionne pas",
  "examples": ["exemple 1 en contexte", "exemple 2"],
  "registerNote": "note courte sur comment ce registre change la traduction vs le registre courant (uniquement si register !== courant, sinon null)"
}`;

const contextTranslationResponseSchema = z.object({
  naturalTranslation: z.string().min(1),
  explanation: z.string().min(1),
  literalTranslation: z.string().min(1),
  literalNote: z.string().min(1),
  examples: z.array(z.string()),
  registerNote: z.string().nullable(),
});

const REGISTER_GUIDANCE = `Registre demandé : {register}
- courant : langue standard, ni trop formelle ni trop familière
- soutenu : langue formelle, littéraire ou professionnelle
- familier : langue de tous les jours entre amis
- argotique : langue très informelle, expressions populaires, argot contemporain russe`;

export async function translateInContext(
  text: string,
  register: TTranslationRegister,
): Promise<TContextTranslationResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY manquante");
  }

  const client = new OpenAI({ apiKey });

  const registerBlock = REGISTER_GUIDANCE.replace("{register}", register);

  const response = await client.responses.create({
    model,
    max_output_tokens: 600,
    instructions: SYSTEM_PROMPT,
    input: `Expression française à traduire : ${text}\n\n${registerBlock}`,
  });

  const outputText = response.output_text?.trim();

  if (!outputText) {
    throw new Error("Réponse LLM vide");
  }

  return parseLlmJson(
    outputText,
    contextTranslationResponseSchema,
    "Réponse LLM invalide : le JSON de traduction n'a pas pu être analysé",
  );
}
