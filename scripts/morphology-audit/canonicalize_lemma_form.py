"""
Canonicalisation des formes de lemme — miroir Python de
src/lib/vocabulary/canonicalize-lemma-form.ts (+ conversion apostrophe OR).

Ordre OpenRussian (décision MORPHOLOGY_ENGINE §2.5) :
  1. convert_openrussian_apostrophe  (' → U+0301)
  2. canonicalize_lemma_form         (trim + NFC)
  3. assert_lemma_form_charset       (cyrillique / - / U+0301)
  4. strip_monosyllable_stress       (1 voyelle → retire U+0301)

Stdlib uniquement — aucun pip.
"""

from __future__ import annotations

import unicodedata

STRESS_MARK = "\u0301"
HYPHEN = "-"
OR_APOSTROPHE = "'"

# Voyelles russes (minuscules + majuscules). Ё/ё compte comme une voyelle.
# Miroir exact de RUSSIAN_VOWELS dans canonicalize-lemma-form.ts.
RUSSIAN_VOWELS: frozenset[str] = frozenset(
    {
        "а",
        "е",
        "ё",
        "и",
        "о",
        "у",
        "ы",
        "э",
        "ю",
        "я",
        "А",
        "Е",
        "Ё",
        "И",
        "О",
        "У",
        "Ы",
        "Э",
        "Ю",
        "Я",
    }
)


def to_nfc(text: str) -> str:
    """Miroir de toNfc (utils/russian.ts) : normalize('NFC')."""
    return unicodedata.normalize("NFC", text)


def convert_openrussian_apostrophe(form: str) -> str:
    """
    Apostrophe d'accent OpenRussian ' → combining acute U+0301.
    À appeler EN PREMIER sur les chaînes OR, avant NFC / charset / monosyllabe.
    Ne touche pas aux autres caractères.
    """
    return form.replace(OR_APOSTROPHE, STRESS_MARK)


def is_allowed_lemma_form_charset(form: str) -> bool:
    """
    Miroir de isAllowedLemmaFormCharset :
    chaque caractère ∈ cyrillique U+0400–U+04FF, « - », ou U+0301.
    """
    if len(form) == 0:
        return False
    for char in form:
        cp = ord(char)
        is_cyrillic = 0x0400 <= cp <= 0x04FF
        if not is_cyrillic and char != HYPHEN and char != STRESS_MARK:
            return False
    return True


def assert_lemma_form_charset(form: str) -> None:
    """Miroir de assertLemmaFormCharset — lève ValueError si charset invalide."""
    if not is_allowed_lemma_form_charset(form):
        raise ValueError(
            f"Lemme rejeté : caractère non autorisé dans « {form} » "
            "(seuls cyrillique U+0400–U+04FF, « - » et U+0301 sont admis)"
        )


def canonicalize_lemma_form(form: str) -> str:
    """Miroir de canonicalizeLemmaForm : trim + NFC. Ne touche pas à l'accent."""
    return to_nfc(form.strip())


def count_russian_vowels(form: str) -> int:
    """Miroir de countRussianVowels — U+0301 et consonnes ne comptent pas."""
    return sum(1 for char in form if char in RUSSIAN_VOWELS)


def has_stress_mark(form: str) -> bool:
    """Miroir de hasStressMark : NFD puis présence de U+0301."""
    return STRESS_MARK in unicodedata.normalize("NFD", form)


def strip_stress_mark(form: str) -> str:
    """Miroir de stripStressMark : NFD, retire U+0301, re-NFC."""
    nfd = unicodedata.normalize("NFD", form)
    return to_nfc(nfd.replace(STRESS_MARK, ""))


def strip_monosyllable_stress(form: str) -> str:
    """
    Miroir de stripMonosyllableStress.
    À appeler APRÈS canonicalize_lemma_form. Une seule voyelle russe → retire U+0301.
    """
    if count_russian_vowels(form) != 1:
        return form
    if not has_stress_mark(form):
        return form
    return strip_stress_mark(form)


def canonicalize_openrussian_form(form: str) -> str:
    """
    Pipeline complet pour une forme / lemme OpenRussian (apostrophe).
    Équivalent au point unique d'import batch (§2.5).
    """
    step = convert_openrussian_apostrophe(form)
    step = canonicalize_lemma_form(step)
    assert_lemma_form_charset(step)
    return strip_monosyllable_stress(step)


def lemma_bare(form: str) -> str:
    """Clé de jointure : forme sans U+0301 (après canonicalisation Rossiyani)."""
    return strip_stress_mark(canonicalize_lemma_form(form))
