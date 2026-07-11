# Checklist — Publication d'un texte Reader

Cocher chaque point avant de créer la migration SQL.

---

## Identité & thème

- [ ] Thème dans la liste autorisée V1 ([CHARTE §2](./CHARTE_EDITORIALE.md#2-thèmes-autorisés-v1))
- [ ] Aucun thème interdit V1 (politique, actualité, argot, exercice scolaire…)
- [ ] Le texte raconte une scène crédible — pas une liste de phrases

---

## Niveau & progression

- [ ] Niveau `A1`, `A2` ou `B1` conforme aux critères de la charte
- [ ] **Une seule** difficulté linguistique nouvelle (A1) — documentée en interne
- [ ] Phrases dans la fourchette du niveau (8–15 selon niveau)
- [ ] Vocabulaire adapté ; réutilisation 30 %+ si A2

---

## Structure narrative

- [ ] Titre russe court et évocateur
- [ ] Contexte clair dans les 1–2 premières phrases
- [ ] Progression logique : situation → développement → fin naturelle
- [ ] Pas de moral explicite en fin de texte
- [ ] Question au lecteur (`А ты…?`) : max 1 phrase, optionnel A1

---

## Règles Rossiyani

- [ ] Phénomène linguistique présent et exploitable via l'Explorer
- [ ] Pas de mention explicite d'un cas grammatical dans le texte
- [ ] Pas de dépendance à une leçon préalable
- [ ] Personnages et lieux réalistes

---

## Technique

- [ ] Accents toniques NFC (U+0301) dans `content` et chaque phrase
- [ ] `content_annotated.sentences[]` : `text` + `translationFr` pour chaque phrase
- [ ] `collection` = slug collection V1 officielle
- [ ] `word_count` et `reading_time_minutes` renseignés
- [ ] JSON valide ; apostrophes SQL doublées (`''`)
- [ ] Migration idempotente (upsert par titre)
- [ ] Rendu vérifié sur `/reader/[textId]`

---

## Cohérence éditoriale

- [ ] Collection cohérente avec l'identité de la charte (§6)
- [ ] Vocabulaire récurrent Rossiyani réutilisé si possible (Анна, метро, работа…)
- [ ] Phénomène potentiellement lié à une leçon existante ou future — noté en interne
