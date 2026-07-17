import OpenAI from "openai";

import { analyzeKnowledgeQuality } from "@/lib/knowledge/quality/quality-analyzer";
import {
  parseKnowledgeLlmJsonWithMeta,
  type TParseKnowledgeResult,
} from "@/lib/knowledge/profile-schema";
import type { TKnowledgeQualityReport } from "@/lib/knowledge/quality/quality-types";
import type { TKnowledgeLlmPayload } from "@/types/knowledge";
import type { TNormalizationEvent } from "@/lib/knowledge/normalize-knowledge-payload";

export interface TKnowledgeGenerationResult {
  payload: TKnowledgeLlmPayload;
  normalizationEvents: TNormalizationEvent[];
  qualityReport: TKnowledgeQualityReport;
}

const SYSTEM_PROMPT = `Tu es le moteur pédagogique concept-centré de Rossiyani.

Rossiyani n'explique pas des mots. Rossiyani explique les mécanismes du russe à travers les mots.

Le lemme est une porte d'entrée. Le vrai sujet est le PHÉNOMÈNE linguistique :
- Conjugaison du présent
- Aspect perfectif
- Possessif réfléchi
- Préfixes des verbes de mouvement
- Déclinaison, etc.

RÈGLES ABSOLUES :
1. JSON valide uniquement
2. pedagogy.concept est PRIORITAIRE — mini-leçon sur un phénomène, pas fiche dictionnaire
3. Chaque phrase répond à : Pourquoi ? / Comment ? / Qu'est-ce que cela change ?
4. 2 paragraphes max dans understand, 40–60 mots chacun
5. retentionPoints : 3 max, réutilisables dans de futures lectures (avec formes russes)
6. morphology/syntax/semantics/paradigms : couche Knowledge (données structurées)

INTERDIT (formulations vides) :
- "Le russe choisit cette forme"
- "Le russe veut exprimer"
- "Cette terminaison indique"
- "Cette forme montre"
- "Le verbe est imperfectif" (définition sans usage)

PRÉFÉRER :
- "Ici, la phrase exige que..."
- "La terminaison -ет signale que c'est « tu » qui agit maintenant"
- "Avec прочитать, l'action est vue comme terminée"

pedagogy.concept (OBLIGATOIRE) :
- phenomenonTitle : nom du phénomène (ex. "Conjugaison du présent")
- understand : 1–2 paragraphes — pourquoi la forme rencontrée existe
- scheme : 3–5 formes en progression verticale (читать → я читаю → ты читаешь)
- contrasts : 2–3 [{ fromForm, toForm, question, explanation }]
- miniTable : tableau minimal ({ title, rows: [{ label, form }] }) — pas encyclopédique
- retentionPoints : 3 idées réutilisables avec formes russes
- family : 3–5 formes liées (читать → прочитать → дочитать)

Aussi : takeaways 3 max, nextForms ≥2, commonPatterns ≥2, understandingPoints 3 max.

FORMAT JSON :
{
  "partOfSpeech": "",
  "pedagogy": {
    "concept": {
      "phenomenonTitle": "",
      "understand": [],
      "scheme": [],
      "contrasts": [{ "fromForm": "", "toForm": "", "question": "", "explanation": "" }],
      "miniTable": { "title": "", "rows": [{ "label": "", "form": "" }] },
      "retentionPoints": [],
      "family": []
    },
    "takeaways": [],
    "nextForms": [],
    "commonPatterns": []
  },
  "morphology": {},
  "syntax": {},
  "semantics": {},
  "paradigms": { "forms": [], "cases": [], "conjugation": [] }
}`;

export async function generateKnowledgeFromLlm(
  lemmaForm: string,
): Promise<TKnowledgeGenerationResult> {
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
    input: `Lemme russe : ${lemmaForm}`,
  });

  const outputText = response.output_text?.trim();

  if (!outputText) {
    throw new Error("Réponse LLM vide");
  }

  const debug = process.env.KNOWLEDGE_NORMALIZE_DEBUG === "1";
  const parsed: TParseKnowledgeResult = parseKnowledgeLlmJsonWithMeta(outputText, {
    lemmaForm,
    debug,
  });

  const qualityReport = analyzeKnowledgeQuality({
    lemmaForm,
    payload: parsed.payload,
  });

  return {
    payload: parsed.payload,
    normalizationEvents: parsed.normalizationEvents,
    qualityReport,
  };
}
