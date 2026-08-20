import OpenAI from "openai";
import { z } from "zod";

import type { TLlmExplanationPayload } from "@/lib/orchestrator/types";

const ALLOWED_FUNCTIONAL_ROLES = [
  "subject",
  "object_direct",
  "object_indirect",
  "possession",
  "location",
  "time",
  "manner",
] as const;

const SYSTEM_PROMPT = `Tu es l'orchestrateur linguistique de Rossiyani.

Ta mission : expliquer pourquoi un mot russe a une forme précise dans une phrase précise.

RÈGLES ABSOLUES :
1. Répondre UNIQUEMENT en JSON valide — aucun texte avant ou après
2. L'explication répond TOUJOURS à "pourquoi CE MOT a CETTE FORME dans CETTE PHRASE"
3. Ne jamais donner d'information grammaticale sans expliquer son rôle dans le sens
4. Utiliser un langage simple — pas de jargon brut sans explication immédiate
5. L'explication est en français, 2-3 phrases maximum
6. Si un bloc "FAIT GRAMMATICAL CERTAIN" accompagne le mot : ce fait est vérifié
   manuellement et absolu — ta prose (explanation) doit le respecter sans jamais
   le contredire (ex. ne jamais qualifier de "possessif" un mot que ce fait
   décrit comme un pronom personnel). Rédige toujours la prose toi-même, mais
   à l'intérieur de cette contrainte.

SYSTÈME DE COULEURS FONCTIONNELLES (noms / pronoms / adjectifs uniquement) :
- "blue"   → sujet (fait l'action)
- "coral"  → objet direct (subit l'action)
- "green"  → valeur technique pour les rôles location ou time (le serveur dérive
  le rôle réel ; n'utilise JAMAIS la couleur pour décider entre lieu et temps
  dans ta prose — suis le FAIT GRAMMATICAL CERTAIN / les faits curés)
- "violet" → possession ou relation entre mots
- "amber"  → destinataire (à qui, pour qui)
Les VERBES n'ont PAS de rôle fonctionnel : mettre quand même une valeur technique
parmi les 7 (obligatoire pour le schéma) — le serveur l'ignorera pour les verbes.

FAITS CURÉS SUR LE GÉNITIF (vérifiés manuellement — ta prose ne doit jamais les contredire ;
le serveur dérive certains badges à part, ne les invente pas toi-même) :
- у + pronom personnel au génitif = le possesseur ou l'expérienceur, pas un lieu
- после + génitif = postériorité temporelle
- numéral + génitif = quantité comptée
- без + génitif = privation
- до свидания = formule d'adieu figée, ne pas analyser la terminaison

INVARIABLES : les conjonctions, particules, prépositions et adverbes invariables
n'ont PAS de badge pédagogique (pas de terminaison fléchie) : mettre quand même
un rôle et une couleur techniques parmi les valeurs autorisées (obligatoire pour
le schéma) — le serveur les effacera ensuite.

FORMAT DE RÉPONSE JSON strict :
{
  "lemma": "INFINITIF / forme de dictionnaire — JAMAIS la forme conjuguée cliquée. Ex. пойдём → пойти́ ; нашёл → найти́ ; читаешь → чита́ть",
  "lemmaStressed": "lemme avec accent tonique U+0301 ex: пойти́, найти́",
  "translation": "traduction française de la FORME RENCONTRÉE dans cette phrase (pas du lemme seul). Ex. меня́ dans « У меня́ боли́т » → « moi » (pas « je ») ; часо́в après un numéral → sens pluriel / quantité (pas seulement « heure » au singulier)",
  "functionalRole": "UN SEUL de ces 7 rôles EXACTEMENT — subject | object_direct | object_indirect | possession | location | time | manner. AUCUNE autre valeur n'est acceptée. Si le mot ne correspond pas exactement à un de ces rôles, choisir le plus proche parmi les 7. Règles de choix : Adjectif épithète qui décrit un nom sujet → subject. Adjectif épithète qui décrit un nom objet → object_direct. Adjectif attribut du sujet → subject. Complément de lieu (avec на, в, у, к...) → location. Complément de temps → time. Adverbe de manière → manner. Objet indirect (avec à, pour, дать кому) → object_indirect. Relation génitif de possession → possession",
  "functionColor": "blue|coral|green|violet|amber",
  "explanation": "2-3 phrases expliquant pourquoi ce mot a cette forme dans cette phrase",
  "suffix": "la terminaison grammaticale qui CHANGE selon le rôle. Pour les mots INVARIABLES (adverbes, prépositions, conjonctions, particules, certains noms étrangers) : retourner une chaîne vide \"\". Ne jamais retourner une terminaison arbitraire pour un mot invariable. Pour les mots fléchis : la terminaison exacte sans le radical, ex: а, у, ого — pas de tiret obligatoire",
  "suffixExplanation": "ce que cette terminaison signale en une phrase simple"
}

ACCENT TONIQUE :
- Utiliser le caractère Unicode ́ (U+0301, combining acute) APRÈS la voyelle accentuée
- Exemples : пого\u0301да, рабо\u0301та, идти\u0301, челове\u0301к`;

const llmResponseSchema = z.object({
  lemma: z.string().min(1),
  lemmaStressed: z.string().min(1).optional(),
  translation: z.string().min(1),
  functionalRole: z.enum(ALLOWED_FUNCTIONAL_ROLES),
  functionColor: z.string().min(1),
  explanation: z.string().min(1),
  suffix: z.string(),
  suffixExplanation: z.string(),
});

/** Échec de parsing de la réponse LLM — causes séparées (JSON vs Zod). */
export class LlmResponseParseError extends Error {
  readonly kind: "json" | "zod";
  /** Réponse brute du modèle (pour journal prefill / diagnostic). */
  readonly raw: string;
  readonly zodDetails?: string;

  constructor(kind: "json" | "zod", raw: string, zodDetails?: string) {
    const message =
      kind === "json"
        ? "Réponse LLM invalide : JSON illisible"
        : zodDetails
          ? `Réponse LLM invalide : schéma Zod rejeté (${zodDetails})`
          : "Réponse LLM invalide : schéma Zod rejeté";
    super(message);
    this.name = "LlmResponseParseError";
    this.kind = kind;
    this.raw = raw;
    this.zodDetails = zodDetails;
  }
}

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

function formatZodIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
    .join("; ");
}

function parseLlmJson(content: string): TLlmExplanationPayload {
  const extracted = extractJsonPayload(content);
  const attempts = [extracted, repairJsonPayload(extracted)];

  let sawJsonParseFailure = false;
  let lastZodError: z.ZodError | null = null;

  for (const candidate of attempts) {
    let data: unknown;

    try {
      data = JSON.parse(candidate);
    } catch {
      sawJsonParseFailure = true;
      continue;
    }

    try {
      return llmResponseSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        lastZodError = error;
      }

      continue;
    }
  }

  if (lastZodError) {
    throw new LlmResponseParseError(
      "zod",
      content,
      formatZodIssues(lastZodError),
    );
  }

  if (sawJsonParseFailure) {
    throw new LlmResponseParseError("json", content);
  }

  throw new LlmResponseParseError("json", content);
}

/**
 * Timeout par tentative — évite qu'un appel LLM accroché bloque l'Explorer
 * indéfiniment (le SDK OpenAI attend sinon plusieurs minutes par défaut).
 */
const LLM_REQUEST_TIMEOUT_MS = 20_000;
/** 1 essai + 2 reprises silencieuses, backoff court — étape 3 robustesse clic mot. */
const LLM_MAX_ATTEMPTS = 3;
const LLM_RETRY_BACKOFF_MS = [300, 900];

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callWordExplanationOnce(
  surface: string,
  sentence: string,
  curatedFactHint?: string,
): Promise<TLlmExplanationPayload> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY manquante");
  }

  if (!model) {
    throw new Error("OPENAI_MODEL manquante");
  }

  // maxRetries: 0 — le retry est géré explicitement par generateWordExplanation
  // (backoff court et visible en dev) plutôt que par le retry interne du SDK,
  // pour un nombre de tentatives prévisible côté utilisateur.
  const client = new OpenAI({
    apiKey,
    timeout: LLM_REQUEST_TIMEOUT_MS,
    maxRetries: 0,
  });

  const input = curatedFactHint
    ? `Mot : ${surface}\nPhrase : ${sentence}\n${curatedFactHint}`
    : `Mot : ${surface}\nPhrase : ${sentence}`;

  const response = await client.responses.create({
    model,
    instructions: SYSTEM_PROMPT,
    input,
  });

  const outputText = response.output_text?.trim();

  if (!outputText) {
    throw new Error("Réponse LLM vide");
  }

  return parseLlmJson(outputText);
}

/**
 * Retry silencieux (timeout / erreur réseau / JSON invalide passager) avant
 * de faire remonter l'échec — l'utilisateur ne doit voir "Impossible de
 * charger ce mot" qu'après épuisement des tentatives.
 *
 * `curatedFactHint` (optionnel) : fait grammatical déjà résolu de façon
 * déterministe (pronom ou déclencheur génitif via
 * resolveCuratedFactPromptHint) et injecté dans le prompt — le LLM rédige
 * toujours la prose, mais ne peut plus lui inventer un statut grammatical
 * différent (ex. qualifier меня́ de "possessif", ou после + génitif de "lieu").
 */
export async function generateWordExplanation(
  surface: string,
  sentence: string,
  curatedFactHint?: string,
): Promise<TLlmExplanationPayload> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= LLM_MAX_ATTEMPTS; attempt += 1) {
    try {
      return await callWordExplanationOnce(surface, sentence, curatedFactHint);
    } catch (error) {
      lastError = error;

      if (process.env.NODE_ENV === "development") {
        console.warn(
          `[LLM explain] Tentative ${attempt}/${LLM_MAX_ATTEMPTS} échouée pour « ${surface} »`,
          error instanceof Error ? error.message : error,
        );
      }

      const backoff = LLM_RETRY_BACKOFF_MS[attempt - 1];

      if (attempt < LLM_MAX_ATTEMPTS && backoff !== undefined) {
        await wait(backoff);
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Échec de l'explication LLM après plusieurs tentatives");
}
