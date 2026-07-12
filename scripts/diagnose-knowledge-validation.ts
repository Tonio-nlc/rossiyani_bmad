#!/usr/bin/env tsx
/**
 * RC-018 diagnostic — payload LLM brut + erreurs Zod détaillées.
 * Usage: tsx scripts/diagnose-knowledge-validation.ts [lemmaForm...]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import OpenAI from "openai";

import { knowledgeLlmResponseSchema } from "@/lib/knowledge/profile-schema";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const DEFAULT_FAILING = [
  "окно",
  "ехать",
  "хлеб",
  "идти",
  "поезд",
  "или",
  "медленно",
];

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    if (!line || line.startsWith("#")) continue;
    const index = line.indexOf("=");
    if (index === -1) continue;
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

function loadSystemPrompt(): string {
  const source = fs.readFileSync(
    path.join(root, "src/lib/knowledge/generate-knowledge-llm.ts"),
    "utf8",
  );
  const match = source.match(
    /const SYSTEM_PROMPT = `([\s\S]*?)`;/,
  );
  if (!match?.[1]) {
    throw new Error("SYSTEM_PROMPT introuvable");
  }
  return match[1];
}

function extractJsonPayload(content: string): string {
  const trimmed = content.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced?.[1]) return fenced[1].trim();
  const objectMatch = trimmed.match(/\{[\s\S]*\}/);
  if (objectMatch?.[0]) return objectMatch[0];
  return trimmed;
}

function repairJsonPayload(content: string): string {
  return content
    .replace(/,\s*([}\]])/g, "$1")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"');
}

interface ZodIssueSummary {
  path: string;
  code: string;
  message: string;
  received?: unknown;
  expected?: unknown;
}

function summarizeIssues(issues: ZodIssueSummary[]): string {
  return issues
    .map((issue) => `${issue.path || "(root)"}: ${issue.message}`)
    .join(" | ");
}

async function diagnoseLemma(
  client: OpenAI,
  model: string,
  instructions: string,
  lemmaForm: string,
) {
  const response = await client.responses.create({
    model,
    instructions,
    input: `Lemme russe : ${lemmaForm}`,
  });

  const raw = response.output_text?.trim() ?? "";
  const extracted = extractJsonPayload(raw);
  const repaired = repairJsonPayload(extracted);

  let jsonParseError: string | null = null;
  let parsed: unknown = null;
  let usedCandidate = "";

  for (const candidate of [extracted, repaired]) {
    try {
      parsed = JSON.parse(candidate);
      jsonParseError = null;
      usedCandidate = candidate === extracted ? "extracted" : "repaired";
      break;
    } catch (error) {
      jsonParseError =
        error instanceof Error ? error.message : String(error);
    }
  }

  const zodResult = parsed
    ? knowledgeLlmResponseSchema.safeParse(parsed)
    : null;

  const zodIssues: ZodIssueSummary[] =
    zodResult && !zodResult.success
      ? zodResult.error.issues.map((issue) => ({
          path: issue.path.join("."),
          code: issue.code,
          message: issue.message,
          received: "received" in issue ? issue.received : undefined,
          expected: "expected" in issue ? issue.expected : undefined,
        }))
      : [];

  const record =
    parsed && typeof parsed === "object"
      ? (parsed as Record<string, unknown>)
      : null;

  return {
    lemmaForm,
    usedCandidate,
    jsonParseError,
    zodSuccess: zodResult?.success ?? false,
    zodIssues,
    zodIssueSummary: summarizeIssues(zodIssues),
    sampleFields: record
      ? {
          partOfSpeech: record.partOfSpeech,
          gender: record.gender,
          aspect: record.aspect,
          movementType: record.movementType,
          difficulty: record.difficulty,
          pedagogyProgression: (record.pedagogy as Record<string, unknown> | undefined)
            ?.progression,
          morphologyMovement: (
            record.morphology as Record<string, unknown> | undefined
          )?.movementType,
          morphologyGender: (record.morphology as Record<string, unknown> | undefined)
            ?.gender,
        }
      : null,
    fullRaw: raw,
    fullParsed: parsed,
  };
}

function groupIssues(
  results: Awaited<ReturnType<typeof diagnoseLemma>>[],
) {
  const groups = new Map<
    string,
    { count: number; lemmas: string[]; example: ZodIssueSummary }
  >();

  for (const result of results) {
    if (result.zodSuccess || result.jsonParseError) continue;

    for (const issue of result.zodIssues) {
      const key = `${issue.path} :: ${issue.message}`;
      const existing = groups.get(key);

      if (existing) {
        existing.count += 1;
        existing.lemmas.push(result.lemmaForm);
      } else {
        groups.set(key, {
          count: 1,
          lemmas: [result.lemmaForm],
          example: issue,
        });
      }
    }
  }

  return [...groups.entries()]
    .map(([key, value]) => ({ key, ...value }))
    .sort((a, b) => b.count - a.count);
}

async function main() {
  loadEnvFile(path.join(root, ".env.local"));

  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL;

  if (!apiKey || !model) {
    console.error("OPENAI_API_KEY et OPENAI_MODEL requis");
    process.exit(1);
  }

  const lemmas = process.argv.slice(2);
  const targets = lemmas.length > 0 ? lemmas : DEFAULT_FAILING;
  const client = new OpenAI({ apiKey });
  const instructions = loadSystemPrompt();
  const results = [];

  for (const lemma of targets) {
    console.log(`\n=== ${lemma} ===`);
    const result = await diagnoseLemma(client, model, instructions, lemma);
    results.push(result);

    if (result.jsonParseError) {
      console.log("JSON:", result.jsonParseError);
    } else if (result.zodSuccess) {
      console.log("ZOD: OK");
    } else {
      console.log("ZOD ISSUES:");
      for (const issue of result.zodIssues) {
        console.log(
          `  ${issue.path}: ${issue.message} (received=${JSON.stringify(issue.received)})`,
        );
      }
    }
    console.log("Fields:", JSON.stringify(result.sampleFields));
  }

  const grouped = groupIssues(results);

  console.log("\n=== GROUPED CAUSES ===");
  for (const group of grouped) {
    console.log(
      `[${group.count}x] ${group.key} — ex: ${group.lemmas.slice(0, 5).join(", ")}`,
    );
  }

  const outDir = path.join(root, "docs/knowledge");
  fs.mkdirSync(outDir, { recursive: true });

  const jsonPath = path.join(outDir, "validation-diagnostic.json");
  fs.writeFileSync(
    jsonPath,
    JSON.stringify({ results, grouped }, null, 2),
    "utf8",
  );

  const mdPath = path.join(outDir, "RC-018-VALIDATION-DIAGNOSIS.md");
  const md = renderReport(results, grouped);
  fs.writeFileSync(mdPath, md, "utf8");

  console.log(`\nJSON: ${jsonPath}`);
  console.log(`Report: ${mdPath}`);
}

function renderReport(
  results: Awaited<ReturnType<typeof diagnoseLemma>>[],
  grouped: ReturnType<typeof groupIssues>,
): string {
  const success = results.filter((r) => r.zodSuccess).length;
  const jsonErrors = results.filter((r) => r.jsonParseError).length;
  const zodErrors = results.filter(
    (r) => !r.zodSuccess && !r.jsonParseError,
  ).length;

  let md = `# RC-018 — Diagnostic validation Knowledge Bootstrap\n\n`;
  md += `> Généré le ${new Date().toLocaleString("fr-FR")}\n\n`;
  md += `## Résumé échantillon (${results.length} lemmes)\n\n`;
  md += `- Zod OK : ${success}\n`;
  md += `- Erreurs JSON : ${jsonErrors}\n`;
  md += `- Erreurs Zod : ${zodErrors}\n\n`;

  md += `## Causes regroupées\n\n`;
  if (grouped.length === 0) {
    md += `_Aucune erreur Zod dans l'échantillon._\n\n`;
  } else {
    for (const group of grouped) {
      md += `### [${group.count}×] \`${group.key}\`\n\n`;
      md += `- **Chemin** : \`${group.example.path}\`\n`;
      md += `- **Code** : \`${group.example.code}\`\n`;
      md += `- **Message** : ${group.example.message}\n`;
      if (group.example.received !== undefined) {
        md += `- **Reçu** : \`${JSON.stringify(group.example.received)}\`\n`;
      }
      if (group.example.expected !== undefined) {
        md += `- **Attendu** : \`${JSON.stringify(group.example.expected)}\`\n`;
      }
      md += `- **Lemmes** : ${group.lemmas.join(", ")}\n\n`;
    }
  }

  md += `## Détail par lemme\n\n`;
  for (const result of results) {
    md += `### ${result.lemmaForm}\n\n`;
    if (result.jsonParseError) {
      md += `**JSON parse error** : ${result.jsonParseError}\n\n`;
    } else if (result.zodSuccess) {
      md += `**Statut** : ✅ Zod OK\n\n`;
      md += `\`\`\`json\n${JSON.stringify(result.sampleFields, null, 2)}\n\`\`\`\n\n`;
    } else {
      md += `**Statut** : ❌ Zod\n\n`;
      for (const issue of result.zodIssues) {
        md += `- \`${issue.path}\` — ${issue.message}`;
        if (issue.received !== undefined) {
          md += ` (reçu: \`${JSON.stringify(issue.received)}\`)`;
        }
        md += `\n`;
      }
      md += `\n**Champs observés** :\n\n`;
      md += `\`\`\`json\n${JSON.stringify(result.sampleFields, null, 2)}\n\`\`\`\n\n`;
      md += `<details><summary>Payload brut LLM</summary>\n\n\`\`\`json\n${result.fullRaw.slice(0, 4000)}\n\`\`\`\n\n</details>\n\n`;
    }
  }

  return md;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
