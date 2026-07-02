import { createHash } from "crypto";

export function computeContextHash(surface: string, sentence: string): string {
  const normalized = `${surface.toLowerCase()}::${sentence.trim().toLowerCase()}`;

  return createHash("sha256").update(normalized).digest("hex").slice(0, 32);
}
