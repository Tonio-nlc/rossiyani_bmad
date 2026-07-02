export function extractTranslation(explanationFr: string | undefined): string {
  if (!explanationFr) {
    return "";
  }

  try {
    const parsed = JSON.parse(explanationFr) as { translation?: string };

    if (parsed.translation) {
      return parsed.translation;
    }
  } catch {
    // explanation_fr est du texte brut
  }

  return "";
}
