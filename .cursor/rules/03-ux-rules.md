# Rossiyani — UX et système de design

---

## Philosophie visuelle

L'interface doit s'effacer derrière le contenu.
L'utilisateur ne doit jamais penser "quelle fonctionnalité utiliser ?" — il doit penser "je lis du russe."

Références : Apple Books, Kindle, Readwise Reader, Linear.
Anti-références : Duolingo, SaaS coloré, gamification, glassmorphism.

---

## Palette de couleurs — système fonctionnel du Reader

Ces couleurs encodent le RÔLE grammatical des mots dans le Reader.
Elles ne sont utilisées QUE pour les terminaisons et annotations linguistiques.

```css
/* Couleurs fonctionnelles — à définir dans globals.css */
--color-role-subject: #3B82F6;        /* Bleu — sujet, fait l'action */
--color-role-object: #EF7C5A;         /* Coral — objet direct, subit l'action */
--color-role-location: #22C55E;       /* Vert — lieu et temps */
--color-role-possession: #A78BFA;     /* Violet — possession et relation */
--color-role-recipient: #F59E0B;      /* Ambre — destinataire */

/* Couleurs UI générales */
--color-primary: #1E3A5F;             /* Bleu marine — CTAs principaux */
--color-surface: #FAFAF9;             /* Fond général — légèrement chaud */
--color-surface-card: #FFFFFF;        /* Fond des cartes */
--color-border: #E5E3DC;              /* Bordures subtiles */
--color-text-primary: #1C1C1A;        /* Texte principal */
--color-text-secondary: #6B6B67;      /* Texte secondaire */
--color-text-muted: #9C9A93;          /* Texte désactivé / hints */
```

---

## Typographie

```css
/* Police principale */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

/* Hiérarchie */
--text-xs: 0.75rem;     /* 12px — labels, badges */
--text-sm: 0.875rem;    /* 14px — corps secondaire */
--text-base: 1rem;      /* 16px — corps principal */
--text-lg: 1.125rem;    /* 18px — sous-titres */
--text-xl: 1.25rem;     /* 20px — titres de section */
--text-2xl: 1.5rem;     /* 24px — titres de page */
--text-3xl: 1.875rem;   /* 30px — grands titres */

/* Texte russe dans le Reader — toujours plus grand */
--text-russian-reading: 1.5rem;   /* 24px minimum pour la lecture */
--text-russian-ui: 1.125rem;      /* 18px pour les exemples dans les fiches */

/* Police pour le texte cyrillique */
font-family: 'PT Serif', 'Georgia', serif;  /* Pour le texte russe dans le Reader */
```

---

## Composants clés — comportement attendu

### Reader — le composant principal

Structure HTML attendue :
```
<ReaderContainer>
  <TextHeader title level progress />
  <TextBody>
    <Sentence> (une par paragraphe sémantique)
      <Word
        surface="женщину"
        lemmaId="..."
        functionalRole="object_direct"    ← détermine la couleur
        functionColor="coral"
        isClickable={true}
        onWordClick={handleWordClick}
      />
    </Sentence>
  </TextBody>
  <ExplorerPanel word={selectedWord} sentence={currentSentence} />
</ReaderContainer>
```

Comportement :
- La terminaison colorée (pas le mot entier) — le radical reste en texte normal
- Cliquer un mot → ExplorerPanel s'ouvre à droite (desktop) ou en bas (mobile)
- ExplorerPanel reçoit TOUJOURS la phrase complète, pas juste le mot
- L'explication affichée répond à "pourquoi CE MOT a CETTE FORME dans CETTE PHRASE"

### ExplorerPanel — l'explication contextuelle

Structure de l'explication attendue (JSON depuis l'orchestrateur) :
```typescript
interface WordExplanation {
  word: string;                    // "женщину"
  lemma: string;                   // "женщина"
  translation: string;             // "femme"
  functionalRole: string;          // "object_direct"
  functionColor: string;           // "coral"
  explanation: string;             // "Ce mot est à l'accusatif parce que..."
  sentenceContext: string;         // phrase complète
  wordInSentenceHighlighted: string; // la phrase avec le mot mis en évidence
  relatedForms?: WordForm[];       // autres formes possibles du même mot
  familyMembers?: LemmaBasic[];    // famille de mots si pertinent
}
```

L'ExplorerPanel affiche dans cet ordre :
1. Le mot en grand (surface + lemme)
2. La traduction française
3. **L'explication contextuelle** (le plus important — jamais cacher ou réduire)
4. Les autres formes possibles avec leurs contextes
5. La famille de mots si applicable

### Système de navigation

```
Nav principale (desktop) :
Home | Library | Reader | Vocabulary | Lessons | Practice | [Search] [Profil]

Nav mobile :
Bottom tab bar : Home | Library | Reader | Vocabulary | Practice
```

---

## Règles UX absolues

1. **Jamais de jargon linguistique brut** dans l'UI utilisateur — "nominatif" peut apparaître mais toujours suivi de son explication en langage courant
2. **Le Reader est prioritaire** — sur mobile, il prend 100% de l'écran ; l'ExplorerPanel est un drawer qui slide depuis le bas
3. **Les accents toniques sont toujours affichés** sur le texte russe dans le Reader (данные avec accent = да́нные)
4. **Jamais de loading spinner** sur l'explication d'un mot — skeleton loader uniquement, pour ne pas casser la fluidité de lecture
5. **Le bouton "Sauvegarder le mot"** est toujours visible dans l'ExplorerPanel, sans scroll
6. **Les erreurs ne cassent pas la lecture** — si l'orchestrateur échoue, afficher "Réessayer" dans l'ExplorerPanel, le texte reste lisible
7. **Responsive first** — tester chaque composant Reader sur 375px (iPhone SE) avant desktop

---

## Onboarding — 5 écrans maximum

L'onboarding est déclenché uniquement à la première connexion.
Chaque écran = un concept. Pas de quiz, pas de test de niveau à ce stade.

1. **Écran 1** — "Le russe change les mots selon leur rôle" (illustration simple)
2. **Écran 2** — "Les couleurs dans le Reader signalent la fonction" (démo interactive des couleurs)
3. **Écran 3** — "Cliquez sur un mot pour comprendre son rôle dans la phrase" (démo cliquable)
4. **Écran 4** — "Sauvegardez les mots qui vous intéressent" (démo du bouton Save)
5. **Écran 5** — "On commence par lire — pas par mémoriser" + bouton "Choisir mon premier texte"

Durée cible : 3 minutes maximum.
