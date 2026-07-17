import { buildRawLearningCard } from "@/lib/knowledge/pedagogy/composers/base-composer";
import { assertLearningCardIntegrity } from "@/lib/knowledge/pedagogy/integrity/integrity-gate";
import { applyPedagogicalStrategy } from "@/lib/knowledge/pedagogy/strategy/sanitize-learning-card";
import type { TPedagogicalStrategy } from "@/lib/knowledge/pedagogy/strategy/strategy-types";
import type { TComposeLearningCardInput } from "@/lib/knowledge/pedagogy/compose-types";
import type { TLearningCard } from "@/types/learning-card";

export function composeWithStrategy(
  input: TComposeLearningCardInput,
  strategy: TPedagogicalStrategy,
): TLearningCard {
  const raw = buildRawLearningCard(input);
  const sanitized = applyPedagogicalStrategy(raw, strategy);

  return assertLearningCardIntegrity(sanitized, strategy);
}
