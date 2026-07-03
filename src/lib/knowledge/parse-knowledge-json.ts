import { z } from "zod";

import type { TKnowledgeLlmPayload } from "@/types/knowledge";

const optionalText = z
  .string()
  .transform((value) => {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  })
  .nullable();

const requiredText = z.string().trim().min(1);

export const knowledgeLlmResponseSchema = z.object({
  partOfSpeech: requiredText,
  gender: z.enum(["m", "f", "n"]).nullable(),
  aspect: z.enum(["imperfective", "perfective"]).nullable(),
  movementType: optionalText,
  government: z.array(z.string()),
  semanticCategory: optionalText,
  register: optionalText,
  difficulty: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]).or(requiredText),
  notes: z.string().transform((value) => value.trim()),
  tags: z.array(z.string().transform((value) => value.trim())).transform((tags) =>
    tags.filter(Boolean),
  ),
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

export function parseKnowledgeLlmJson(content: string): TKnowledgeLlmPayload {
  const extracted = extractJsonPayload(content);
  const attempts = [extracted, repairJsonPayload(extracted)];

  for (const candidate of attempts) {
    try {
      return knowledgeLlmResponseSchema.parse(JSON.parse(candidate));
    } catch {
      continue;
    }
  }

  throw new Error(
    "Réponse LLM invalide : le JSON de connaissance n'a pas pu être analysé",
  );
}
