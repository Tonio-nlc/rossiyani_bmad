"use client";

import { useMutation } from "@tanstack/react-query";

import type {
  TSentenceBuilderRequest,
  TSentenceBuilderResult,
} from "@/types/practice";

async function evaluateSentence(
  request: TSentenceBuilderRequest,
): Promise<TSentenceBuilderResult> {
  const response = await fetch("/api/practice/sentence-builder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const payload = (await response.json()) as { error?: string };
    throw new Error(payload.error ?? "Impossible d'évaluer cette phrase");
  }

  return response.json() as Promise<TSentenceBuilderResult>;
}

export function useSentenceBuilder() {
  const mutation = useMutation({
    mutationFn: evaluateSentence,
  });

  return {
    evaluate: mutation.mutate,
    result: mutation.data ?? null,
    isLoading: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}
