"use client";

import { useQuery } from "@tanstack/react-query";

import type { THomeData } from "@/types/home";

async function fetchHomeData(): Promise<THomeData> {
  const response = await fetch("/api/home");

  if (!response.ok) {
    const payload = (await response.json()) as { error?: string };
    throw new Error(payload.error ?? "Impossible de charger l'accueil");
  }

  return response.json() as Promise<THomeData>;
}

export function useHomeData() {
  const query = useQuery({
    queryKey: ["home"],
    queryFn: fetchHomeData,
    staleTime: 60_000,
  });

  // isPending (pas isLoading) : aligne SSR et hydratation — voir useTexts.
  const isLoading = query.isPending;

  return {
    data: query.data ?? null,
    isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
