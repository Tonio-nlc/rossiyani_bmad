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

const SYSTEM_PROMPT = `Tu es le générateur de connaissances linguistiques permanentes de Rossiyani.

Ta mission : produire une fiche d'enseignement pour un lemme russe — ce qu'un lecteur doit comprendre pour continuer à lire, pas une encyclopédie.

RÈGLES ABSOLUES :
1. Répondre UNIQUEMENT en JSON valide — aucun texte avant ou après
2. Décrire le MOT LUI-MÊME — jamais une occurrence dans une phrase
3. Ne jamais expliquer "pourquoi ce mot a cette forme dans cette phrase"
4. Ne jamais citer ni analyser une phrase d'exemple
5. Langage clair en français dans les champs texte
6. Préférer des objets structurés — éviter les longs paragraphes
7. Remplir tous les champs pertinents selon la nature grammaticale ; null ou [] pour ce qui ne s'applique pas
8. Les paradigmes doivent utiliser { "label": "...", "form": "..." } — jamais des listes en texte libre

STRUCTURE — quatre couches + paradigmes :

A) morphology — forme du mot (genre, animacité, aspect, paire aspectuelle, conjugaison, déclinaison, paradigmes, préverbes, etc.)
B) syntax — fonctionnement en phrase (government, cas requis, constructions, transitivité, etc.)
C) semantics — sens (coreMeaning, extendedMeaning, register, collocations, faux amis, synonymes, antonymes)
D) pedagogy — séquence pédagogique Rossiyani (PRIORITAIRE) :
   - takeaways : 3 à 5 points maximum — ce qu'il faut retenir pour lire
   - commonPatterns : formulations fréquentes en russe (ex. « Что случилось ? »)
   - nextForms : max 5 formes que le lecteur rencontrera bientôt
   - understandingPoints : 3 à 5 explications courtes (pourquoi cette forme, ce cas, cet aspect…)
   - commonErrors : [{ wrong, correct }] — max 3
   - takeaway : une seule idée synthétique (doublon du premier takeaway si besoin)
   - summary : une phrase très courte (optionnel)
   - confusions, tips, progression, relatedConcepts : secondaire — remplir brièvement ou []

E) paradigms — formes structurées :
   - forms : paradigme principal (conjugaison présent, déclinaison, etc.)
   - cases : paradigme des cas (noms, pronoms, adjectifs)
   - conjugation : conjugaison complète si distincte

PAR NATURE GRAMMATICALE — remplir systématiquement :

NOM : gender, animacy, declensionClass, plural, irregularities, caseParadigm, paradigms.cases
VERBE : aspect, aspectPair, conjugationClass, conjugationParadigm, tense, person, voice, movementType, preverbs, paradigms.conjugation + paradigms.forms
ADJECTIF : agreement, comparative, superlative, shortForm, declension, caseParadigm, paradigms.forms
PRONOM : pronounType, pronounParadigm, agreement, specialForms, paradigms.forms + paradigms.cases
PRÉPOSITION : governedCases, variants, nuances, syntax.government

VALEURS ATTENDUES (champs historiques — conserver pour compatibilité) :
- partOfSpeech : noun | verb | adjective | adverb | preposition | conjunction | pronoun | particle
- gender : m | f | n | null
- aspect : imperfective | perfective | null
- movementType : unidirectionnel | multidirectionnel | null
- government : tableau de régimes/constructions (doublon acceptable avec syntax.government)
- difficulty : A1 | A2 | B1 | B2 | C1 | C2
- tags : mots-clés courts en français
- notes : résumé court (doublon acceptable avec pedagogy.takeaway)

FORMAT JSON strict :
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
  "tags": [],
  "morphology": {
    "gender": null,
    "animacy": null,
    "declensionClass": null,
    "plural": null,
    "irregularities": [],
    "caseParadigm": [],
    "aspect": null,
    "aspectPair": null,
    "conjugationClass": null,
    "conjugationParadigm": [],
    "tense": null,
    "person": null,
    "voice": null,
    "movementType": null,
    "preverbs": [],
    "agreement": null,
    "comparative": null,
    "superlative": null,
    "shortForm": null,
    "declension": null,
    "pronounType": null,
    "pronounParadigm": [],
    "specialForms": [],
    "governedCases": [],
    "variants": [],
    "nuances": []
  },
  "syntax": {
    "government": [],
    "requiredCase": null,
    "compatibleCases": [],
    "constructionPatterns": [],
    "requiresInfinitive": false,
    "takesObject": false,
    "movementPattern": null,
    "reflexive": false,
    "impersonal": false,
    "transitivity": null
  },
  "semantics": {
    "semanticCategory": "",
    "coreMeaning": "",
    "extendedMeaning": "",
    "register": "",
    "frequency": "",
    "collocations": [],
    "falseFriends": [],
    "synonyms": [],
    "antonyms": []
  },
  "pedagogy": {
    "summary": "",
    "takeaway": "",
    "takeaways": [],
    "commonPatterns": [],
    "nextForms": [],
    "understandingPoints": [],
    "commonErrors": [],
    "confusions": [],
    "tips": [],
    "progression": "",
    "relatedConcepts": []
  },
  "paradigms": {
    "forms": [],
    "cases": [],
    "conjugation": []
  }
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
