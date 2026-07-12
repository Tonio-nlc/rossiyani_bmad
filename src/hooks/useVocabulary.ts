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

  const payload = (await response.json()) as {
    words: Array<{ id: string }>;
  };

  return payload.words.map((word) => word.id);
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
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: ["vocabulary", "lemmaIds"] });

      const previousLemmaIds = queryClient.getQueryData<string[]>([
        "vocabulary",
        "lemmaIds",
      ]);

      queryClient.setQueryData<string[]>(
        ["vocabulary", "lemmaIds"],
        (current = []) =>
          current.includes(input.lemmaId)
            ? current
            : [...current, input.lemmaId],
      );

      return { previousLemmaIds };
    },
    onError: (_error, _input, context) => {
      if (context?.previousLemmaIds) {
        queryClient.setQueryData(
          ["vocabulary", "lemmaIds"],
          context.previousLemmaIds,
        );
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["vocabulary", "lemmaIds"] });
    },
  });

  return {
    savedLemmaIds: savedQuery.data ?? [],
    saveWord: saveMutation.mutate,
    saveWordAsync: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    isLoading: savedQuery.isPending,
    error: savedQuery.error ?? saveMutation.error,
  };
}
