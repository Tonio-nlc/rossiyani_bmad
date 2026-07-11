import { z } from "zod";

import { IMPORT_LIMITS } from "./constants";

export const importSourceSchema = z.enum(["paste", "txt"]);

export const importPreviewRequestSchema = z.object({
  title: z.string().max(IMPORT_LIMITS.maxTitleLength).optional(),
  rawText: z.string(),
  source: importSourceSchema,
});

export const importSaveRequestSchema = importPreviewRequestSchema.extend({
  title: z.string().trim().min(1).max(IMPORT_LIMITS.maxTitleLength),
  level: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]),
});

export type ImportPreviewRequest = z.infer<typeof importPreviewRequestSchema>;
export type ImportSaveRequest = z.infer<typeof importSaveRequestSchema>;
