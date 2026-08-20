#!/usr/bin/env python3
"""
Chiffrage D3 — formes gold / user_vocabulary ambiguës sous OpenRussian.

Ambiguïté = forme (strip accent + ё→е + lower) dans ≥ 2 entrées OR
distinctes (lemma_bare × POS).

Override curé = au moins un des lemmes ambigus (bare) apparaît dans
morphology/curated/ (present-verbs, pronouns, forms, invariables, preps,
numéraux, fixed expressions).

Usage :
  python3 scripts/morphology-audit/measure-d3-ambiguity.py
  python3 scripts/morphology-audit/measure-d3-ambiguity.py --vocab-lemmas /tmp/uv-lemmas.json

Aucune écriture en base, aucun pip install.
"""

from __future__ import annotations

import argparse
import importlib.util
import json
import re
import sys
from dataclasses import dataclass
from pathlib import Path

AUDIT_DIR = Path(__file__).resolve().parent
ROOT = AUDIT_DIR.parents[1]
CURATED_DIR = ROOT / "src" / "lib" / "knowledge" / "morphology" / "curated"


def _load_run_audit():
    path = AUDIT_DIR / "run-audit.py"
    spec = importlib.util.spec_from_file_location("run_audit_mod", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Impossible de charger {path}")
    mod = importlib.util.module_from_spec(spec)
    sys.modules["run_audit_mod"] = mod
    spec.loader.exec_module(mod)
    return mod


@dataclass
class AmbiguityHit:
    form: str
    n_entries: int
    lemmas: list[str]
    curated: bool
    curated_by: str


def load_curated_lemma_bares(strip_stress) -> dict[str, str]:
    out: dict[str, str] = {}

    def add(raw: str, source: str) -> None:
        key = strip_stress(raw)
        if key and key not in out:
            out[key] = source

    pv = (CURATED_DIR / "present-verbs.ts").read_text(encoding="utf-8")
    for m in re.finditer(r'lemma:\s*"([^"]+)"', pv):
        add(m.group(1), "present-verbs.ts")

    pr = (CURATED_DIR / "pronouns.ts").read_text(encoding="utf-8")
    for m in re.finditer(r'lemma:\s*"([^"]+)"', pr):
        add(m.group(1), "pronouns.ts")
    for m in re.finditer(r'(?:plain|withN):\s*"([^"]+)"', pr):
        add(m.group(1), "pronouns.ts")

    forms = (CURATED_DIR / "forms.ts").read_text(encoding="utf-8")
    for m in re.finditer(r'"([А-Яа-яЁё́\u0301\-]+)"', forms):
        add(m.group(1), "forms.ts")

    for fname in (
        "invariable-words.ts",
        "preposition-government.ts",
        "genitive-numerals.ts",
        "fixed-expressions.ts",
    ):
        path = CURATED_DIR / fname
        if not path.exists():
            continue
        text = path.read_text(encoding="utf-8")
        for m in re.finditer(r'"([а-яёА-ЯЁ\-]+)"', text):
            add(m.group(1), fname)

    return out


def curated_covers(lemmas: list[str], curated: dict[str, str]) -> tuple[bool, str]:
    for lemma_pos in lemmas:
        bare = lemma_pos.split("|", 1)[0]
        if bare in curated:
            return True, curated[bare]
    return False, ""


def analyze_forms(forms: set[str], form_index, curated, strip_stress, label: str):
    ambiguous: list[AmbiguityHit] = []
    without: list[AmbiguityHit] = []

    for form in sorted(forms, key=lambda s: strip_stress(s)):
        key = strip_stress(form)
        entries = form_index.get(key, [])
        unique: dict[str, object] = {}
        for e in entries:
            unique[f"{e.lemma_bare}|{e.pos}"] = e
        if len(unique) < 2:
            continue
        lemmas = sorted(unique.keys())
        covered, by = curated_covers(lemmas, curated)
        hit = AmbiguityHit(form, len(unique), lemmas, covered, by)
        ambiguous.append(hit)
        if not covered:
            without.append(hit)

    print(f"\n=== {label} ===")
    print(f"Formes distinctes analysées : {len(forms)}")
    print(f"Ambiguës (≥2 entrées OR)     : {len(ambiguous)}")
    print(f"  dont override curé         : {len(ambiguous) - len(without)}")
    print(f"  SANS paradigme complet (D3): {len(without)}")
    if without:
        print("\nListe SANS override (D3 bloquerait le paradigme complet) :")
        for h in without:
            print(f"  {h.form}  → {h.n_entries} : {', '.join(h.lemmas)}")
    if ambiguous and len(ambiguous) <= 40:
        print("\nToutes ambiguës (avec statut curé) :")
        for h in ambiguous:
            flag = f"CURÉ:{h.curated_by}" if h.curated else "SANS"
            print(f"  [{flag}] {h.form} → {', '.join(h.lemmas)}")
    elif ambiguous:
        print(f"\n(Ambiguës curées : {len(ambiguous) - len(without)} — détail omis si >40 total)")
        curated_hits = [h for h in ambiguous if h.curated]
        for h in curated_hits[:15]:
            print(f"  [CURÉ:{h.curated_by}] {h.form} → {', '.join(h.lemmas)}")
        if len(curated_hits) > 15:
            print(f"  … +{len(curated_hits) - 15} curées")

    return ambiguous, without


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--vocab-lemmas", type=Path, default=None)
    args = parser.parse_args()

    audit = _load_run_audit()
    print("Chargement OpenRussian…")
    _entries, form_index = audit.load_openrussian()
    curated = load_curated_lemma_bares(audit.strip_stress)
    print(f"Clés curées (bare) : {len(curated)}")

    gold: set[str] = set()
    for path in audit.migration_files():
        for _title, content in audit.extract_texts_from_sql(path):
            for token in audit.tokenize_russian(content):
                gold.add(token)
    analyze_forms(gold, form_index, curated, audit.strip_stress, "Textes gold (11)")

    if args.vocab_lemmas and args.vocab_lemmas.exists():
        raw = json.loads(args.vocab_lemmas.read_text(encoding="utf-8"))
        vocab = {audit.strip_stress(str(x)) for x in raw if str(x).strip()}
        analyze_forms(
            vocab, form_index, curated, audit.strip_stress, "user_vocabulary"
        )
    else:
        print(
            "\n=== user_vocabulary ===\n"
            "Fichier --vocab-lemmas absent — export lecture seule requis."
        )

    return 0


if __name__ == "__main__":
    sys.exit(main())
