#!/usr/bin/env tsx
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { collectBootstrapLemmas } from "@/lib/knowledge/bootstrap/collect-lemmas";
import {
  generateAndUpsertKnowledge,
  getBootstrapErrorMessage,
} from "@/lib/knowledge/bootstrap/generate-lemma";
import { summarizeNormalizationEvents } from "@/lib/knowledge/normalize-knowledge-payload";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const FAILED = process.argv.slice(2);

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    if (!line || line.startsWith("#")) {
      continue;
    }

    const index = line.indexOf("=");

    if (index === -1) {
      continue;
    }

    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim();

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

async function main() {
  loadEnvFile(path.join(root, ".env.local"));

  const all = await collectBootstrapLemmas("P0");
  const targets = FAILED.length
    ? all.filter((item) => FAILED.includes(item.form))
    : all;

  let ok = 0;
  let fail = 0;
  const errors: string[] = [];
  const norm: Record<string, number> = {};

  for (const item of targets) {
    try {
      const result = await generateAndUpsertKnowledge(item.lemmaId, item.form);
      ok += 1;

      if (result.normalizationEvents.length > 0) {
        const counts = summarizeNormalizationEvents(result.normalizationEvents);

        for (const [key, count] of Object.entries(counts)) {
          norm[key] = (norm[key] ?? 0) + count;
        }
      }

      console.log(`OK ${item.form} (${result.normalizationEvents.length} events)`);
    } catch (error) {
      fail += 1;
      const message = getBootstrapErrorMessage(error);
      errors.push(`${item.form}: ${message}`);
      console.log(`FAIL ${item.form}: ${message}`);
    }
  }

  console.log("---");
  console.log(`retry OK ${ok} fail ${fail} of ${targets.length}`);

  if (errors.length > 0) {
    console.log(errors.join("\n"));
  }

  if (Object.keys(norm).length > 0) {
    console.log("norm", norm);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
