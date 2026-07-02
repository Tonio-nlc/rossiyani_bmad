"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface SaveWordInput {
  lemmaId: string;
  explanationCacheId?: string;
  textId?: string;
}

async function fetchSavedLemmaIds(): Promise<string[]> {
  const response = await fetch("/api/vocabulary");

  if (!response.ok) {
    throw new Error("Impossible de charger le vocabulaire");
  }

  const payload = (await response.json()) as { lemmaIds: string[] };
  return payload.lemmaIds;
}

async function saveWordRequest(input: SaveWordInput) {
  const response = await fetch("/api/vocabulary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const payload = (await response.json()) as { error?: string };
    throw new Error(payload.error ?? "Impossible de sauvegarder le mot");
  }

  return response.json();
}

export function useVocabulary() {
  const queryClient = useQueryClient();

  const savedQuery = useQuery({
    queryKey: ["vocabulary", "lemmaIds"],
    queryFn: fetchSavedLemmaIds,
  });

  const saveMutation = useMutation({
    mutationFn: saveWordRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["vocabulary", "lemmaIds"] });
    },
  });

  return {
    savedLemmaIds: savedQuery.data ?? [],
    saveWord: saveMutation.mutate,
    saveWordAsync: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    isLoading: savedQuery.isLoading,
    error: savedQuery.error ?? saveMutation.error,
  };
}
