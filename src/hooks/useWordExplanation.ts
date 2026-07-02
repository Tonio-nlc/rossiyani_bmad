"use client";

import { useMutation } from "@tanstack/react-query";

import type { TWordExplanationRequest } from "@/types/orchestrator";
import type { TWordExplanationResponseExtended } from "@/lib/orchestrator/types";

async function fetchExplanation(
  request: TWordExplanationRequest,
): Promise<TWordExplanationResponseExtended> {
  const response = await fetch("/api/word/explain", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const payload = (await response.json()) as { error?: string };
    throw new Error(payload.error ?? "Impossible d'expliquer ce mot");
  }

  return response.json() as Promise<TWordExplanationResponseExtended>;
}

export function useWordExplanation() {
  const mutation = useMutation({
    mutationFn: fetchExplanation,
  });

  return {
    explain: mutation.mutate,
    explainAsync: mutation.mutateAsync,
    explanation: mutation.data ?? null,
    isLoading: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}
