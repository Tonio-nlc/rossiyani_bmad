import { z } from "zod";

const comparisonSchema = z.object({
  fromForm: z.string().min(1),
  toForm: z.string().min(1),
  explanation: z.string().optional(),
});

const visualSchema = z
  .object({
    nodes: z.array(z.string()),
    layout: z.enum(["vertical", "horizontal", "comparison"]).optional(),
    caption: z.string().optional(),
  })
  .nullable()
  .optional();

/**
 * Schéma Zod — géométrie variable.
 * Seuls fact/contrast/memoryAnchor sont exigés (via normalize + Gate).
 * Les autres slots sont optionnels.
 */
export const teachingScenarioContentSchema = z
  .object({
    fact: z.string().optional(),
    contrast: z.array(comparisonSchema).optional(),
    memoryAnchor: z.string().min(1),
    hook: z.string().optional(),
    hookWithSurface: z.string().optional(),
    question: z.string().optional(),
    intuition: z.string().optional(),
    visual: visualSchema,
    commonMistake: z.string().optional(),
    reuse: z.array(z.string()).optional(),
    explanation: z.array(z.string()).optional(),
    comparison: z.array(comparisonSchema).optional(),
  })
  .refine(
    (value) =>
      Boolean(value.fact?.trim()) ||
      Boolean(value.explanation?.some((item) => item.trim())),
    { message: "fact (ou explanation legacy) requis", path: ["fact"] },
  )
  .refine(
    (value) =>
      (value.contrast?.length ?? 0) > 0 || (value.comparison?.length ?? 0) > 0,
    { message: "contrast (ou comparison legacy) requis", path: ["contrast"] },
  );
