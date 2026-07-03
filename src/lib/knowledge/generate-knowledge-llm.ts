import OpenAI from "openai";

import { parseKnowledgeLlmJson } from "@/lib/knowledge/parse-knowledge-json";
import type { TKnowledgeLlmPayload } from "@/types/knowledge";

const SYSTEM_PROMPT = `Tu es le générateur de connaissances linguistiques permanentes de Rossiyani.

Ta mission : décrire ce qu'EST un mot russe — sa nature grammaticale, son usage et ses propriétés stables.

RÈGLES ABSOLUES :
1. Répondre UNIQUEMENT en JSON valide — aucun texte avant ou après
2. Décrire le MOT LUI-MÊME — jamais une occurrence dans une phrase
3. Ne jamais expliquer "pourquoi ce mot a cette forme dans cette phrase"
4. Ne jamais citer ni analyser une phrase d'exemple
5. Utiliser un langage clair en français dans les champs texte (notes, tags, register, semanticCategory)
6. Remplir uniquement les champs pertinents ; utiliser null pour ce qui ne s'applique pas (genre pour un verbe, aspect pour un nom, movementType hors verbes de mouvement)

VALEURS ATTENDUES :
- partOfSpeech : noun | verb | adjective | adverb | preposition | conjunction | pronoun | particle
- gender : m | f | n | null
- aspect : imperfective | perfective | null
- movementType : unidirectionnel | multidirectionnel | null (verbes de mouvement uniquement)
- government : tableau de régimes ou constructions gouvernées (ex: ["accusatif", "préposition в + prépositionnel"])
- difficulty : A1 | A2 | B1 | B2 | C1 | C2
- tags : mots-clés courts en français (ex: ["mouvement", "quotidien"])

FORMAT DE RÉPONSE JSON strict :
{
  "partOfSpeech": "",
  "gender": null,
  "aspect": null,
  "movementType": null,
  "government": [],
  "semanticCategory": "",
  "register": "",
  "difficulty": "",
  "notes": "",
  "tags": []
}`;

export async function generateKnowledgeFromLlm(
  lemmaForm: string,
): Promise<TKnowledgeLlmPayload> {
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

  return parseKnowledgeLlmJson(outputText);
}
