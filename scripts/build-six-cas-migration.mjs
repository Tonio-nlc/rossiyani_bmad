#!/usr/bin/env node
/**
 * Génère la migration SQL à partir des JSON dans docs/lessons/content/six-cas/
 * Usage: node scripts/build-six-cas-migration.mjs > supabase/migrations/016_lessons_six_cas_v2.sql
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const dir = path.join(root, "docs/lessons/content/six-cas");

function sqlEscape(str) {
  return str.replace(/'/g, "''");
}

const files = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith(".json"))
  .sort();

let sql = `-- ============================================
-- Story 3.3 — Les six cas : réécriture éditoriale v2
-- ============================================
-- Source : docs/lessons/content/six-cas/*.json
-- Pipeline : docs/lessons/PIPELINE.md
-- Liens textes : docs/lessons/TEXT_LESSON_LINKS.md
-- Généré par : node scripts/build-six-cas-migration.mjs

ALTER TABLE lessons
  ADD COLUMN IF NOT EXISTS related_texts JSONB NOT NULL DEFAULT '[]'::jsonb;

`;

for (const file of files) {
  const lesson = JSON.parse(
    fs.readFileSync(path.join(dir, file), "utf8"),
  );
  const blocksJson = sqlEscape(JSON.stringify(lesson.contentBlocks));
  const relatedJson = sqlEscape(
    JSON.stringify(lesson.relatedTexts ?? []),
  );
  const title = sqlEscape(lesson.title);

  sql += `UPDATE lessons
SET
  title = '${title}',
  content_blocks = '${blocksJson}'::jsonb,
  related_texts = '${relatedJson}'::jsonb,
  updated_at = now()
FROM lesson_paths lp
WHERE lessons.path_id = lp.id
  AND lp.slug = 'les-six-cas'
  AND lessons.slug = '${lesson.slug}';

`;
}

process.stdout.write(sql);
