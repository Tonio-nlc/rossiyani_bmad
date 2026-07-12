import { generateKnowledgeFromLlm } from "@/lib/knowledge/generate-knowledge-llm";
import {
  buildUpsertFromLlmPayload,
  upsertKnowledge,
} from "@/lib/knowledge/upsert-knowledge";
import type { TNormalizationEvent } from "@/lib/knowledge/normalize-knowledge-payload";
import type { TKnowledgeQualityReport } from "@/lib/knowledge/quality/quality-types";
import { KNOWLEDGE_PROFILE_VERSION } from "@/types/knowledge";
import { createAdminClient } from "@/lib/supabase/admin";

const DEFAULT_TIMEOUT_MS = 90_000;

export class KnowledgeBootstrapTimeoutError extends Error {
  constructor(lemmaForm: string) {
    super(`Timeout LLM pour le lemme « ${lemmaForm} »`);
    this.name = "KnowledgeBootstrapTimeoutError";
  }
}

function isValidationError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.message.includes("JSON") ||
    error.message.includes("analysé") ||
    error.message.includes("normalisation") ||
    error.message.includes("Zod") ||
    error.message.includes("invalid")
  );
}

function isTimeoutError(error: unknown): boolean {
  if (error instanceof KnowledgeBootstrapTimeoutError) {
    return true;
  }

  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();

  return (
    message.includes("timeout") ||
    message.includes("timed out") ||
    message.includes("etimedout") ||
    message.includes("econnreset")
  );
}

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  lemmaForm: string,
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new KnowledgeBootstrapTimeoutError(lemmaForm));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

export async function assertBootstrapSchema(): Promise<void> {
  const admin = createAdminClient();

  const { error } = await admin
    .from("linguistic_knowledge")
    .select("profile_version")
    .limit(1);

  if (error?.message.includes("profile_version")) {
    throw new Error(
      "Migration 003_knowledge_layer_enrichment.sql requise. Exécutez : npm run db:push",
    );
  }

  if (error) {
    throw new Error(error.message);
  }
}

export async function getKnowledgeProfileVersion(
  lemmaId: string,
): Promise<number | null> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("linguistic_knowledge")
    .select("profile_version, validated")
    .eq("lemma_id", lemmaId)
    .maybeSingle();

  if (error) {
    if (error.message.includes("profile_version")) {
      return null;
    }

    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return data.profile_version ?? (data.validated ? 1 : null);
}

export async function generateAndUpsertKnowledge(
  lemmaId: string,
  lemmaForm: string,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<{
  knowledge: Awaited<ReturnType<typeof upsertKnowledge>>;
  normalizationEvents: TNormalizationEvent[];
  qualityReport: TKnowledgeQualityReport;
}> {
  const generated = await withTimeout(
    generateKnowledgeFromLlm(lemmaForm),
    timeoutMs,
    lemmaForm,
  );

  const knowledge = await upsertKnowledge(
    buildUpsertFromLlmPayload(lemmaId, generated.payload),
  );

  return {
    knowledge,
    normalizationEvents: generated.normalizationEvents,
    qualityReport: generated.qualityReport,
  };
}

export async function shouldSkipLemma(
  lemmaId: string,
  force: boolean,
): Promise<boolean> {
  if (force) {
    return false;
  }

  const profileVersion = await getKnowledgeProfileVersion(lemmaId);

  return profileVersion !== null && profileVersion >= KNOWLEDGE_PROFILE_VERSION;
}

export function classifyBootstrapError(error: unknown): "validation" | "timeout" | "error" {
  if (isValidationError(error)) {
    return "validation";
  }

  if (isTimeoutError(error)) {
    return "timeout";
  }

  return "error";
}

export function getBootstrapErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}
