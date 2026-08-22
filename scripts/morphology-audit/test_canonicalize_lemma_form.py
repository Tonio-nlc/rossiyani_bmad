#!/usr/bin/env python3
"""
Tests d'équivalence Python ↔ TypeScript (canonicalize-lemma-form + apostrophe OR).

Usage :
  python3 scripts/morphology-audit/test_canonicalize_lemma_form.py

Stdlib uniquement.
"""

from __future__ import annotations

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from canonicalize_lemma_form import (  # noqa: E402
    assert_lemma_form_charset,
    canonicalize_lemma_form,
    canonicalize_openrussian_form,
    convert_openrussian_apostrophe,
    count_russian_vowels,
    has_stress_mark,
    is_allowed_lemma_form_charset,
    lemma_bare,
    strip_monosyllable_stress,
    strip_stress_mark,
)


class TestOpenRussianApostrophe(unittest.TestCase):
    def test_apostrophe_to_u0301(self) -> None:
        self.assertEqual(
            convert_openrussian_apostrophe("го'д"),
            "го\u0301д",
        )
        self.assertEqual(
            convert_openrussian_apostrophe("челове'к"),
            "челове\u0301к",
        )


class TestCharset(unittest.TestCase):
    def test_cyrillic_ok(self) -> None:
        self.assertTrue(is_allowed_lemma_form_charset("сказать"))
        self.assertTrue(is_allowed_lemma_form_charset("по-францу\u0301зски"))

    def test_latin_rejected(self) -> None:
        self.assertFalse(is_allowed_lemma_form_charset("god"))
        with self.assertRaises(ValueError):
            assert_lemma_form_charset("гоd")


class TestMonosyllableAndCases(unittest.TestCase):
    def test_god_monosyllable_stripped(self) -> None:
        """го'д (OR) → une voyelle → forme NUE (piège documenté)."""
        out = canonicalize_openrussian_form("го'д")
        self.assertEqual(out, "год")
        self.assertFalse(has_stress_mark(out))
        self.assertEqual(count_russian_vowels(out), 1)

    def test_chelovek(self) -> None:
        out = canonicalize_openrussian_form("челове'к")
        self.assertEqual(out, "челове\u0301к")
        self.assertTrue(has_stress_mark(out))
        self.assertEqual(lemma_bare(out), "человек")

    def test_vremya(self) -> None:
        out = canonicalize_openrussian_form("вре'мя")
        self.assertEqual(out, "вре\u0301мя")
        self.assertEqual(lemma_bare(out), "время")

    def test_skazat(self) -> None:
        out = canonicalize_openrussian_form("сказа'ть")
        self.assertEqual(out, "сказа\u0301ть")
        self.assertEqual(lemma_bare(out), "сказать")

    def test_muka_homographs(self) -> None:
        """му'ка vs мука' = deux mots différents (positions d'accent)."""
        muka1 = canonicalize_openrussian_form("му'ка")
        muka2 = canonicalize_openrussian_form("мука'")
        self.assertEqual(muka1, "му\u0301ка")
        self.assertEqual(muka2, "мука\u0301")
        self.assertNotEqual(muka1, muka2)
        self.assertEqual(lemma_bare(muka1), lemma_bare(muka2))
        self.assertEqual(lemma_bare(muka1), "мука")

    def test_strip_monosyllable_idempotent_on_bare(self) -> None:
        self.assertEqual(strip_monosyllable_stress("год"), "год")

    def test_polysyllable_keeps_stress(self) -> None:
        form = canonicalize_lemma_form("сказа\u0301ть")
        self.assertEqual(strip_monosyllable_stress(form), form)

    def test_nfc_trim(self) -> None:
        # Combining acute after vowel — already NFC-friendly
        raw = "  сказа\u0301ть  "
        self.assertEqual(canonicalize_lemma_form(raw), "сказа\u0301ть")


class TestBareJoinKey(unittest.TestCase):
    def test_bare_strips_only_stress(self) -> None:
        self.assertEqual(lemma_bare("нашёл"), "нашёл")  # ё conservé
        self.assertEqual(strip_stress_mark("берё\u0301т"), "берёт")


if __name__ == "__main__":
    unittest.main(verbosity=2)
