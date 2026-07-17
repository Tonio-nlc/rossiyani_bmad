import { getAllConcepts } from "@/lib/knowledge/concept-graph/registry";
import { validateTeachingScenarioContent } from "@/lib/knowledge/teaching-engine/scenario-quality-rules";
import type { TTeachingScenarioQualityReport } from "@/types/teaching-scenario";

export interface TConceptCatalogQualityReport {
  totalConcepts: number;
  validConcepts: number;
  invalidConcepts: string[];
  reports: Record<string, TTeachingScenarioQualityReport>;
}

export function validateConceptCatalog(): TConceptCatalogQualityReport {
  const concepts = getAllConcepts();
  const reports: Record<string, TTeachingScenarioQualityReport> = {};
  const invalidConcepts: string[] = [];

  for (const concept of concepts) {
    if (!concept.teachingScenario) {
      invalidConcepts.push(concept.id);
      reports[concept.id] = {
        valid: false,
        issues: [
          {
            severity: "error",
            code: "SCENARIO_MISSING",
            message: "Teaching Scenario absent",
          },
        ],
      };
      continue;
    }

    const report = validateTeachingScenarioContent(
      concept.teachingScenario,
      concept.id,
    );

    reports[concept.id] = report;

    if (!report.valid) {
      invalidConcepts.push(concept.id);
    }
  }

  return {
    totalConcepts: concepts.length,
    validConcepts: concepts.length - invalidConcepts.length,
    invalidConcepts,
    reports,
  };
}
