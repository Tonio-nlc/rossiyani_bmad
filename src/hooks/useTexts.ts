"use client";

import { useQuery } from "@tanstack/react-query";

import type { TTextWithProgress } from "@/types/reader";

export interface TTextFilters {
  level?: string;
  collection?: string;
}

async function fetchTexts(filters: TTextFilters): Promise<TTextWithProgress[]> {
  const params = new URLSearchParams();

  if (filters.level) {
    params.set("level", filters.level);
  }

  if (filters.collection) {
    params.set("collection", filters.collection);
  }

  const queryString = params.toString();
  const response = await fetch(
    queryString ? `/api/texts?${queryString}` : "/api/texts",
  );

  if (!response.ok) {
    throw new Error("Impossible de charger les textes");
  }

  return response.json() as Promise<TTextWithProgress[]>;
}

export function useTexts(filters: TTextFilters = {}) {
  const query = useQuery({
    queryKey: ["texts", filters],
    queryFn: () => fetchTexts(filters),
  });

  // isPending (pas isLoading) : aligne SSR et hydratation.
  // En SSR, fetchStatus = "idle" → isLoading serait false alors que isPending = true.
  const isLoading = query.isPending;

  return {
    texts: query.data ?? [],
    isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
