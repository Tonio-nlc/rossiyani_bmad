#!/usr/bin/env python3
"""
M3a Phase A — dry-run appariement OpenRussian × public.lemmas (+ pending).
Lecture seule CSV locaux + JSON stdin des lemmes Rossiyani.
Aucune écriture en base. Stdlib uniquement.

Usage :
  npx tsx scripts/morphology-audit/export-lemmas-for-or-dryrun.ts \\
    | python3 scripts/morphology-audit/dryrun-openrussian-match.py
"""

from __future__ import annotations

import csv
import json
import sys
from collections import defaultdict
from dataclasses import dataclass, field
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from canonicalize_lemma_form import (  # noqa: E402
    canonicalize_lemma_form,
    canonicalize_openrussian_form,
    has_stress_mark,
    lemma_bare,
    strip_stress_mark,
)

AUDIT_DIR = Path(__file__).resolve().parent
DATA_DIR = AUDIT_DIR / "data"

CSV_FILES = {
    "nouns.csv": "noun",
    "verbs.csv": "verb",
    "adjectives.csv": "adjective",
    "others.csv": "other",
}

META_COLUMNS = {
    "bare",
    "accented",
    "translations_en",
    "translations_de",
    "gender",
    "partner",
    "animate",
    "indeclinable",
    "sg_only",
    "pl_only",
    "aspect",
    "comparative",
    "superlative",
}


@dataclass
class OrEntry:
    bare: str
    accented_raw: str
    accented_canon: str | None
    pos: str
    form_cells: list[str] = field(default_factory=list)
    form_canon_count: int = 0


def load_openrussian() -> dict[str, list[OrEntry]]:
    """Index OR par bare (clé = bare CSV tel quel, déjà sans apostrophe)."""
    by_bare: dict[str, list[OrEntry]] = defaultdict(list)

    for filename, pos in CSV_FILES.items():
        path = DATA_DIR / filename
        if not path.exists():
            raise SystemExit(f"CSV manquant : {path}")

        with path.open(encoding="utf-8", newline="") as fh:
            reader = csv.DictReader(fh, delimiter="\t")
            for row in reader:
                bare = (row.get("bare") or "").strip()
                accented_raw = (row.get("accented") or "").strip()
                if not bare:
                    continue

                accented_canon: str | None = None
                if accented_raw:
                    try:
                        accented_canon = canonicalize_openrussian_form(accented_raw)
                    except ValueError:
                        accented_canon = None

                form_cells: list[str] = []
                form_ok = 0
                for col, val in row.items():
                    if col in META_COLUMNS or not val or not str(val).strip():
                        continue
                    raw = str(val).strip()
                    # Cellules multi-formes séparées par , ou ;
                    parts = [
                        p.strip()
                        for p in raw.replace(";", ",").split(",")
                        if p.strip()
                    ]
                    for part in parts:
                        form_cells.append(part)
                        try:
                            canonicalize_openrussian_form(part)
                            form_ok += 1
                        except ValueError:
                            pass

                by_bare[bare].append(
                    OrEntry(
                        bare=bare,
                        accented_raw=accented_raw,
                        accented_canon=accented_canon,
                        pos=pos,
                        form_cells=form_cells,
                        form_canon_count=form_ok,
                    )
                )

    return by_bare


def rossiyani_display_form(form: str) -> str:
    """Même pipeline sans apostrophe (formes déjà U+0301 ou nues)."""
    from canonicalize_lemma_form import (
        assert_lemma_form_charset,
        strip_monosyllable_stress,
    )

    step = canonicalize_lemma_form(form)
    assert_lemma_form_charset(step)
    return strip_monosyllable_stress(step)


def main() -> None:
    raw = sys.stdin.read()
    # Ignore éventuel bruit dotenv sur stdout avant le JSON.
    start = raw.find("{")
    if start < 0:
        raise SystemExit("Pas de JSON sur stdin")
    payload = json.loads(raw[start:])
    lemmas = payload["lemmas"]  # [{id, form, sources: ['lemmas'|'pending']}]
    curated = payload.get("curated_lemmas", [])  # [{lemma_bare, lemma_stressed, pos}]

    or_by_bare = load_openrussian()

    found = 0
    missing: list[str] = []
    accent_diffs: list[dict] = []
    total_forms = 0
    homonym_lemmas = 0
    matched_entries_for_forms: list[OrEntry] = []

    for lem in lemmas:
        form = lem["form"]
        try:
            bare = lemma_bare(form)
            display = rossiyani_display_form(form)
        except ValueError:
            missing.append(f"{form} (charset)")
            continue

        hits = or_by_bare.get(bare, [])
        if not hits:
            # Essai : bare OR parfois sans capitalisation différente
            hits = or_by_bare.get(bare.lower(), []) if bare != bare.lower() else []
        if not hits:
            missing.append(bare)
            continue

        found += 1
        if len(hits) > 1:
            homonym_lemmas += 1

        # Accent : comparer display Rossiyani vs OR accented_canon (1re entrée
        # si homonymie — on liste aussi les variantes OR).
        or_accents = []
        for h in hits:
            if h.accented_canon:
                or_accents.append(h.accented_canon)
            matched_entries_for_forms.append(h)
            total_forms += h.form_canon_count

        # Diff si Rossiyani a un accent (ou pas) différent de TOUTE variante OR
        # canonique, ou si OR a un accent et Rossiyani une autre position.
        if or_accents:
            if display not in or_accents:
                # Différence réelle d'accent / présence
                accent_diffs.append(
                    {
                        "bare": bare,
                        "rossiyani": display,
                        "openrussian": or_accents,
                        "or_pos": [h.pos for h in hits],
                        "homonym": len(hits) > 1,
                    }
                )

    # --- A3 curated collision ---
    curated_covered = 0
    curated_form_agree = 0
    curated_form_diverge: list[dict] = []
    curated_missing_or: list[str] = []

    for c in curated:
        bare = c["lemma_bare"]
        hits = or_by_bare.get(bare, []) or or_by_bare.get(bare.lower(), [])
        if not hits:
            curated_missing_or.append(bare)
            continue
        curated_covered += 1
        stressed = c.get("lemma_stressed")
        or_accents = [h.accented_canon for h in hits if h.accented_canon]
        if stressed is None:
            # Rossiyani missing stress — OK si OR aussi monosyllabe nu, sinon signal
            if not or_accents or all(not has_stress_mark(a) for a in or_accents):
                curated_form_agree += 1
            else:
                curated_form_diverge.append(
                    {
                        "bare": bare,
                        "curated": None,
                        "openrussian": or_accents,
                        "note": "curated stress missing, OR has stress",
                    }
                )
        else:
            try:
                c_disp = rossiyani_display_form(stressed)
            except ValueError:
                c_disp = stressed
            if c_disp in or_accents:
                curated_form_agree += 1
            else:
                curated_form_diverge.append(
                    {
                        "bare": bare,
                        "curated": c_disp,
                        "openrussian": or_accents,
                    }
                )

    report = {
        "a2": {
            "lemmas_input": len(lemmas),
            "found": found,
            "missing": len(missing),
            "missing_sample": missing[:40],
            "accent_diffs_n": len(accent_diffs),
            "accent_diffs": accent_diffs,
            "total_inflected_forms_or_would_provide": total_forms,
            "homonym_lemma_count": homonym_lemmas,
            "note_homonym": "bare présent dans ≥2 entrées OR (POS/sens distincts)",
            "join_key": "strip U+0301 / apostrophe via canonicalize ; ё CONSERVÉ (pas ё→е)",
        },
        "a3": {
            "curated_lemmas": len(curated),
            "covered_by_or": curated_covered,
            "not_in_or": len(curated_missing_or),
            "not_in_or_list": curated_missing_or,
            "lemma_accent_agree": curated_form_agree,
            "lemma_accent_diverge": curated_form_diverge,
            "precedence": "curated > openrussian (non négociable)",
        },
    }

    json.dump(report, sys.stdout, ensure_ascii=False, indent=2)
    print(file=sys.stderr)
    print(
        f"A2: {found}/{len(lemmas)} trouvés, {len(missing)} absents, "
        f"{len(accent_diffs)} accents ≠, {total_forms} formes OR, "
        f"{homonym_lemmas} homonymes bare",
        file=sys.stderr,
    )
    print(
        f"A3: {curated_covered}/{len(curated)} curés dans OR, "
        f"{len(curated_form_diverge)} divergences accent lemme",
        file=sys.stderr,
    )


if __name__ == "__main__":
    main()
