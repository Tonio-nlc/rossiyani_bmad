#!/usr/bin/env node
/**
 * Lanceur de tests portable — évite de dépendre de l'expansion de glob du
 * shell d'exécution (`sh` sans globstar recursif n'étend `**` que sur UN
 * seul niveau de dossier, contrairement à zsh ; `npm run` utilise `sh` par
 * défaut, donc `tsx --test src/lib/knowledge/**\/*.test.ts` dans package.json
 * loupait silencieusement les fichiers *.test.ts à 2 niveaux de profondeur,
 * ex. src/lib/knowledge/morphology/curated/pronouns.test.ts).
 *
 * Usage : node scripts/run-node-tests.mjs <dossier racine> [autres dossiers...]
 * Découvre récursivement tous les *.test.ts sous les dossiers donnés (Node
 * natif, sans dépendance de glob supplémentaire) puis les passe explicitement
 * à `tsx --test`.
 */

import { readdirSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

function collectTestFiles(root) {
  const results = [];
  let entries;

  try {
    entries = readdirSync(root, { withFileTypes: true });
  } catch {
    return results;
  }

  for (const entry of entries) {
    if (entry.name === "node_modules") {
      continue;
    }

    const fullPath = path.join(root, entry.name);

    if (entry.isDirectory()) {
      results.push(...collectTestFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".test.ts")) {
      results.push(fullPath);
    }
  }

  return results;
}

const roots = process.argv.slice(2);

if (roots.length === 0) {
  console.error("Usage : node scripts/run-node-tests.mjs <dossier racine> [...]");
  process.exit(1);
}

const files = roots.flatMap((root) => collectTestFiles(root)).sort();

if (files.length === 0) {
  console.error(`Aucun fichier *.test.ts trouvé sous : ${roots.join(", ")}`);
  process.exit(1);
}

const result = spawnSync("npx", ["tsx", "--test", ...files], { stdio: "inherit" });
process.exit(result.status ?? 1);
