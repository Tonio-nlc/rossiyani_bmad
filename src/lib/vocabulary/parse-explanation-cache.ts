import type { TCachedExplanationPayload } from "@/lib/orchestrator/types";

export function parseExplanationCachePayload(
  explanationFr: string | undefined,
): TCachedExplanationPayload | null {
  if (!explanationFr?.trim()) {
    return null;
  }

  try {
    const parsed = JSON.parse(explanationFr) as TCachedExplanationPayload;

    if (parsed.explanation) {
      return parsed;
    }
  } catch {
    // explanation_fr est du texte brut (anciennes entrées)
  }

  return {
    explanation: explanationFr,
    translation: "",
    suffix: "",
    suffixExplanation: "",
  };
}
