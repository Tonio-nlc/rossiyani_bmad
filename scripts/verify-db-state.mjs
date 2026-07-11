#!/usr/bin/env node
/**
 * Vérifie que la base distante contient le schéma et les seeds essentiels.
 * Attendu après migrations 001–008 sur base vierge.
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const root = path.resolve(import.meta.dirname, "..");
const envPath = path.join(root, ".env.local");
const env = Object.fromEntries(
  fs
    .readFileSync(envPath, "utf8")
    .split("\n")
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const i = line.indexOf("=");
      return [line.slice(0, i), line.slice(i + 1)];
    }),
);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
);

const REQUIRED_TABLES = [
  "word_families",
  "lemmas",
  "word_forms",
  "grammar_patterns",
  "explanation_cache",
  "texts",
  "user_profiles",
  "user_progress",
  "user_vocabulary",
  "srs_reviews",
  "linguistic_knowledge",
  "review_history",
  "lesson_paths",
  "lessons",
  "user_lesson_progress",
];

const EXPECTED_MIN = {
  texts: 5,
  lesson_paths: 5,
  lessons: 10,
};

let failed = false;

for (const table of REQUIRED_TABLES) {
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error(`✗ ${table}: ${error.message}`);
    failed = true;
    continue;
  }

  const min = EXPECTED_MIN[table];
  const ok = min === undefined || count >= min;
  console.log(`${ok ? "✓" : "✗"} ${table}: ${count}${min !== undefined ? ` (min ${min})` : ""}`);
  if (!ok) failed = true;
}

const { data: texts } = await supabase
  .from("texts")
  .select("title, content_annotated");

for (const text of texts ?? []) {
  const sentences = text.content_annotated?.sentences?.length ?? 0;
  const ok = sentences > 0;
  console.log(
    `${ok ? "✓" : "✗"} text "${text.title}": ${sentences} traductions phrase`,
  );
  if (!ok) failed = true;
}

process.exit(failed ? 1 : 0);
