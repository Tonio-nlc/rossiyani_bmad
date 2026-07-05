import { z } from "zod";

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

export function parseLlmJson<T>(
  content: string,
  schema: z.ZodType<T>,
  errorMessage: string,
): T {
  const extracted = extractJsonPayload(content);
  const attempts = [extracted, repairJsonPayload(extracted)];

  for (const candidate of attempts) {
    try {
      return schema.parse(JSON.parse(candidate));
    } catch {
      continue;
    }
  }

  throw new Error(errorMessage);
}
