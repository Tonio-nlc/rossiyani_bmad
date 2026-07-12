#!/usr/bin/env tsx
/**
 * RC-017 — Knowledge Bootstrap
 * Usage: npm run knowledge:bootstrap [-- --force] [-- --limit=50] [-- --only=P0] [-- --dry-run]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { runKnowledgeBootstrap } from "@/lib/knowledge/bootstrap/run-bootstrap";
import type {
  TBootstrapOptions,
  TBootstrapPriority,
} from "@/lib/knowledge/bootstrap/types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

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

function parseArgs(argv: string[]): TBootstrapOptions {
  const options: TBootstrapOptions = {
    force: false,
    dryRun: false,
  };

  for (const arg of argv) {
    if (arg === "--force") {
      options.force = true;
      continue;
    }

    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    if (arg.startsWith("--limit=")) {
      const value = Number(arg.slice("--limit=".length));

      if (Number.isFinite(value) && value > 0) {
        options.limit = value;
      }

      continue;
    }

    if (arg.startsWith("--only=")) {
      const value = arg.slice("--only=".length).toUpperCase();

      if (value === "P0" || value === "P1" || value === "P2") {
        options.only = value as TBootstrapPriority;
      }
    }
  }

  return options;
}

function formatEta(ms: number): string {
  const seconds = Math.round(ms / 1000);

  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;

  return `${minutes}m ${remainder}s`;
}

function printSummary(report: Awaited<ReturnType<typeof runKnowledgeBootstrap>>) {
  const { totals, normalization } = report;

  console.log("");
  console.log("Bootstrap complete");
  console.log("==================");
  console.log(`${totals.candidates} lemmes`);
  console.log(`${totals.generated} OK`);
  console.log(`${totals.skipped} ignorés (déjà v2)`);

  if (totals.dryRun > 0) {
    console.log(`${totals.dryRun} dry-run`);
  }

  console.log(`${totals.validation} validation`);
  console.log(`${totals.timeout} timeout`);

  if (totals.error > 0) {
    console.log(`${totals.error} erreur(s)`);
  }

  if (normalization.payloadsNormalized > 0) {
    console.log(`${normalization.payloadsNormalized} payloads normalisés`);

    const categories = Object.entries(normalization.byCategory).sort(([left], [right]) =>
      left.localeCompare(right, "fr"),
    );

    for (const [category, count] of categories) {
      console.log(`${count} ${category}`);
    }
  }

  console.log("");
  console.log(
    `Couverture P0 : ${report.coverage.p0.enriched}/${report.coverage.p0.total}`,
  );
  console.log(
    `Couverture P1 : ${report.coverage.p1.enriched}/${report.coverage.p1.total}`,
  );
  console.log(
    `Couverture P2 : ${report.coverage.p2.enriched}/${report.coverage.p2.total}`,
  );
  console.log("");
  console.log("Rapport : docs/knowledge/bootstrap-report.md");
}

async function main() {
  loadEnvFile(path.join(root, ".env.local"));

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY ||
    !process.env.OPENAI_API_KEY ||
    !process.env.OPENAI_MODEL
  ) {
    console.error(
      "Variables requises : NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY, OPENAI_MODEL",
    );
    process.exit(1);
  }

  const options = parseArgs(process.argv.slice(2));

  console.log("Knowledge Bootstrap — RC-017");
  console.log(
    `force=${options.force} dry-run=${options.dryRun} only=${options.only ?? "all"} limit=${options.limit ?? "none"}`,
  );
  console.log("");

  const report = await runKnowledgeBootstrap(options, {
    onItemLog: (line) => {
      console.log(line);
    },
    onProgress: (progress) => {
      if (progress.index % 5 === 0 || progress.index === progress.total) {
        console.log(
          `Progress ${progress.index}/${progress.total} · succès ${progress.successRate}% · ETA ${formatEta(progress.etaMs)}`,
        );
      }
    },
  });

  printSummary(report);

  if (report.totals.validation + report.totals.timeout + report.totals.error > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
