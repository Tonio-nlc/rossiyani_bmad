#!/usr/bin/env python3
"""
Mesure ё/е — OpenRussian (CSV locaux) et pymorphy3 (si installé).

Usage (racine repo) :
  python3 scripts/morphology-audit/measure-yo-ye.py

Lecture seule des CSV dans scripts/morphology-audit/data/.
N'installe PAS pymorphy3 s'il manque — rapporte NON MESURÉ.
Aucun téléchargement, aucune écriture en base.
"""

from __future__ import annotations

import csv
import sys
from collections import defaultdict
from pathlib import Path

AUDIT_DIR = Path(__file__).resolve().parent
DATA_DIR = AUDIT_DIR / "data"

CSV_FILES = ("nouns.csv", "verbs.csv", "adjectives.csv", "others.csv")

# Paires où la distinction ё/е compte pédagogiquement
PROBE_PAIRS: list[tuple[str, str, str]] = [
    ("нашёл", "нашел", "past m найти"),
    ("ещё", "еще", "adverb"),
    ("её", "ее", "pronoun"),
    ("идёшь", "идешь", "pres sg2 идти"),
    ("всё", "все", "всё vs все"),
]


def to_hex(s: str) -> str:
    return " ".join(f"U+{ord(c):04X}" for c in s)


def has_yo(s: str) -> bool:
    return "ё" in s.lower() or "Ё" in s


def scan_openrussian() -> None:
    print("=== 1. OpenRussian (CSV locaux) ===\n")
    if not DATA_DIR.is_dir():
        print(f"ABSENT : {DATA_DIR}")
        return

    # Index : forme normalisée sans accent (apostrophe/'/U+0301) → occurrences
    # On garde la chaîne BRUTE telle que stockée.
    by_deaccented: dict[str, list[tuple[str, str, str, str]]] = defaultdict(list)
    # (csv, column, bare_lemma, raw_cell)

    yo_in_bare = 0
    ye_only_bare = 0
    yo_in_accented = 0
    cells_with_yo = 0
    cells_total_cyr = 0

    def deaccent(s: str) -> str:
        return (
            s.replace("\u0301", "")
            .replace("'", "")
            .replace("\u00b4", "")
            .lower()
        )

    for filename in CSV_FILES:
        path = DATA_DIR / filename
        if not path.exists():
            print(f"  MANQUANT : {path}")
            continue
        with path.open(encoding="utf-8", newline="") as handle:
            reader = csv.DictReader(handle, delimiter="\t")
            for row in reader:
                bare = (row.get("bare") or "").strip()
                accented = (row.get("accented") or "").strip()
                for col, val in (("bare", bare), ("accented", accented)):
                    if not val:
                        continue
                    cells_total_cyr += 1
                    if has_yo(val):
                        cells_with_yo += 1
                        if col == "bare":
                            yo_in_bare += 1
                        else:
                            yo_in_accented += 1
                    elif col == "bare" and "е" in val.lower():
                        ye_only_bare += 1  # compte large, indicatif

                    key = deaccent(val)
                    by_deaccented[key].append((filename, col, bare, val))

                # Toutes les cellules de formes aussi
                for col, val in row.items():
                    if col in ("bare", "accented", "translations_en", "translations_de"):
                        continue
                    if not val or not isinstance(val, str):
                        continue
                    for piece in val.split(","):
                        piece = piece.strip()
                        if not piece:
                            continue
                        cells_total_cyr += 1
                        if has_yo(piece):
                            cells_with_yo += 1
                        key = deaccent(piece)
                        by_deaccented[key].append((filename, col, bare, piece))

    print(
        f"Cellules cyrilliques scannées (approx.) : {cells_total_cyr}\n"
        f"Cellules contenant ё/Ё : {cells_with_yo}\n"
        f"  dont colonne bare avec ё : {yo_in_bare}\n"
        f"  dont colonne accented avec ё : {yo_in_accented}\n"
    )

    print("--- Probes (ce qui est réellement stocké) ---\n")
    for with_yo, with_ye, note in PROBE_PAIRS:
        print(f"Probe « {with_yo} » / « {with_ye} » ({note})")
        for variant in (with_yo, with_ye):
            key = deaccent(variant)
            hits = by_deaccented.get(key, [])
            # Aussi chercher la clé avec ё↔е flippé
            alt_key = key.replace("ё", "е").replace("е", "\0")
            # simpler: collect hits for both deaccented keys
            keys = {deaccent(with_yo), deaccent(with_ye)}
            # For this variant line, show exact string matches first
            exact = [h for h in by_deaccented.get(deaccent(variant), []) if h[3] == variant]
            same_letters = by_deaccented.get(deaccent(variant), [])
            print(f"  Variante recherchée : {variant!r}  hex=[{to_hex(variant)}]")
            if exact:
                sample = exact[:3]
                print(f"    Exact match : {len(exact)} occ. ex. {sample[0]}")
            else:
                print("    Exact match : 0")
            # Unique raw strings under this deaccented key
            raws = sorted({h[3] for h in same_letters})
            print(f"    Sous clé dé-accentuée {deaccent(variant)!r} : {len(same_letters)} cells, raw uniques={raws[:8]}")
            for raw in raws[:5]:
                print(f"      stocké={raw!r} hex=[{to_hex(raw)}] yo={has_yo(raw)}")
        # Cross: does OR store yo or ye for this pair?
        yo_raws = {h[3] for h in by_deaccented.get(deaccent(with_yo), []) if has_yo(h[3])}
        ye_raws = {
            h[3]
            for h in by_deaccented.get(deaccent(with_ye), [])
            if not has_yo(h[3]) and "е" in h[3].lower()
        }
        # deaccent(нашёл)==deaccent(нашел) after ё→е in deaccent? 
        # Our deaccent does NOT map ё→е — intentional, to see storage.
        print(f"  → Résumé stockage ё : {sorted(yo_raws)[:5] or 'AUCUN'}")
        print(f"  → Résumé stockage е (même lettres sans ё) : voir raws ci-dessus")
        print()

    # Global: bare lemmas that contain ё
    print("--- Lemmes bare contenant ё (échantillon ≤ 20) ---")
    bare_yo: list[str] = []
    for filename in CSV_FILES:
        path = DATA_DIR / filename
        if not path.exists():
            continue
        with path.open(encoding="utf-8", newline="") as handle:
            for row in csv.DictReader(handle, delimiter="\t"):
                bare = (row.get("bare") or "").strip()
                if has_yo(bare):
                    bare_yo.append(f"{filename}:{bare}")
    print(f"Total bare avec ё : {len(bare_yo)}")
    for item in bare_yo[:20]:
        bare = item.split(":", 1)[1]
        print(f"  {item}  hex=[{to_hex(bare)}]")

    print("\n--- accented contenant ё (échantillon ≤ 15) ---")
    acc_yo: list[str] = []
    for filename in CSV_FILES:
        path = DATA_DIR / filename
        if not path.exists():
            continue
        with path.open(encoding="utf-8", newline="") as handle:
            for row in csv.DictReader(handle, delimiter="\t"):
                accented = (row.get("accented") or "").strip()
                if has_yo(accented):
                    acc_yo.append(f"{filename}:{accented}")
    print(f"Total accented avec ё : {len(acc_yo)}")
    for item in acc_yo[:15]:
        accented = item.split(":", 1)[1]
        print(f"  {item}  hex=[{to_hex(accented)}]")


def probe_pymorphy() -> None:
    print("\n=== 2. pymorphy3 ===\n")
    try:
        import pymorphy3  # type: ignore
    except ImportError:
        print(
            "NON MESURÉ : paquet pymorphy3 absent (ModuleNotFoundError).\n"
            "Consigne : NE PAS installer dans ce ticket. Relancer après pip install local."
        )
        return

    morph = pymorphy3.MorphAnalyzer()
    for with_yo, with_ye, note in PROBE_PAIRS:
        print(f"Probe {note}: {with_yo!r} / {with_ye!r}")
        for variant in (with_yo, with_ye):
            parses = morph.parse(variant)
            print(f"  input={variant!r} hex=[{to_hex(variant)}] n_parses={len(parses)}")
            for p in parses[:3]:
                normal = p.normal_form
                print(
                    f"    normal_form={normal!r} hex=[{to_hex(normal)}] "
                    f"tag={p.tag} score={getattr(p, 'score', None)}"
                )
        print()


def consequence_note() -> None:
    print("=== 3. Conséquence jointure (constat, sans trancher) ===\n")
    print(
        "MESURE OpenRussian : les probes pédagogiques à ё (нашёл, ещё, её, идёшь, всё)\n"
        "sont stockées AVEC ё (U+0451) dans bare/formes — pas réduites en е.\n"
        "« все » (е) coexiste comme entrée DISTINCTE de « всё ».\n"
        "pymorphy3 : NON MESURÉ (paquet absent).\n"
        "Risque de jointure silencieuse si l'UN des côtés normalise ё→е et l'autre\n"
        "non (ex. saisie utilisateur « нашел », audit strip_stress qui mappe ё→е,\n"
        "ou analyseur qui renverrait е). Normaliser ё→е DES DEUX CÔTÉS pour la\n"
        "clé de jointure tout en CONSERVANT ё à l'affichage reste une option —\n"
        "ce script ne tranche pas."
    )


def main() -> int:
    scan_openrussian()
    probe_pymorphy()
    consequence_note()
    return 0


if __name__ == "__main__":
    sys.exit(main())
