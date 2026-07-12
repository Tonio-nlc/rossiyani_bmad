# RC 1 — Audit UX — Buglist

> **Recensement uniquement** — aucune correction dans cette phase.  
> Auditeur : parcours nouvel utilisateur (`rc.ux.audit+1783793450@test.local`)  
> Date : 2026-07-11 · Environnement : `localhost:3000` (dev)

## Parcours couverts

| # | Parcours | Couverture RC 1 bis |
|---|----------|---------------------|
| 1 | **Boucle Rossiyani** — Library → Reader → Explorer → Lesson → retour Reader → fin texte | ✅ Complet (texte `В булочной`) |
| 2 | **Import** — coller → Preview → Lire maintenant → Reader ; Mes imports | ✅ Complet |
| 3 | **Desktop QA** — 1280 / 1440 / 1680 / 1920 | ✅ Partiel (pas de débordement horizontal ; scrolls à surveiller) |
| 4 | Onboarding → Home/Library | ✅ (session précédente) |
| 5 | Vocabulary / Review / Practice | ✅ (session précédente) |

## Légende gravité

| Niveau | Signification |
|--------|---------------|
| **Bloquant** | Empêche de terminer un parcours essentiel |
| **Majeur** | Confusion forte ou erreur pédagogique |
| **Mineur** | Friction, incohérence, polish |
| **Cosmétique** | Détail visuel sans impact fonctionnel |

---

## Tickets

| ID | Page | Gravité | Screenshot | Description |
| -- | ---- | ------- | ---------- | ----------- |
| RC-001 | Onboarding / étape 1 | ~~**Majeur**~~ **Fermé** | [RC-003](./screenshots/RC-003-onboarding-step1.png) | Traduction française incorrecte du 2ᵉ exemple : affiche « Macha voit Anna » alors que `Машу видит Анна` = « Anna voit Macha ». **Corrigé RC 2** — voir clôture ci-dessous. |
| RC-002 | Onboarding / étape 3 | **Mineur** | [RC-004](./screenshots/RC-004-onboarding-word-split.png) | `Машу` affiché « Маш у » (espace radical/terminaison). |
| RC-003 | Onboarding / étape 3 | ~~**Mineur**~~ **Fermé** | — | Labels aria cassés : `\" fait l'action \"` au lieu d'un libellé lisible. **Corrigé RC 2** (aria-label explicites sur les mots cliquables). |
| RC-004 | Login | ~~**Bloquant**~~ **Fermé** | [RC-002](./screenshots/RC-002-login-stuck.png) | User sans `user_profiles` : bouton bloqué « Connexion… ». **Corrigé RC 2** — voir clôture ci-dessous. |
| RC-005 | Login / Register | **Mineur** | [RC-001](./screenshots/RC-001-login-page.png) | Hydratation React (`login/page.tsx` L79) — à vérifier en prod. |
| RC-006 | Onboarding / fin | **Mineur** | — | « Commencer à lire → » redirige vers `/library` et non Home / premier texte. |
| RC-007 | Bibliothèque | **Mineur** | — | Clic carte : navigation effective après ~2 s (latence). Re-test 2026-07-11 : `В булочной` → Reader OK. **Non bloquant** en re-test ; possible race avec chargement client ou overlay hydration. |
| RC-008 | Bibliothèque | **Mineur** | — | Collections EN (`Everyday Russian`, etc.) vs UI FR. |
| RC-009 | Bibliothèque | **Cosmétique** | — | Pluriel coupé dans aria : « 11 résultat s », « 9 texte s ». |
| RC-010 | Global (`PageHeader`) | ~~**Bloquant**~~ **Fermé** | [RC-011](./screenshots/RC-011-lessons-hydration.png) | Hydratation React `PageHeader.tsx` L41 — reproduit sur Library, Import, Lessons, Reader. **Corrigé RC 2** — voir clôture ci-dessous. |
| RC-011 | Leçons (détail) | — | — | Parcours `fondations-du-russe` / `les-six-cas` OK par URL. **Pas de bug.** |
| RC-012 | Reader | **Mineur** | — | Logs dev `Failed to fetch RSC payload` — à vérifier en prod. |
| RC-013 | Reader → Explorer | — | [RC-023](./screenshots/RC-023-explorer-open.png) · [RC-026](./screenshots/RC-026-explorer-lesson-bridge.png) | **OK** : ouverture, explication, Sauvegarder, bridge Approfondir **si** le texte est lié à une leçon (`В булочной` + `хлеб` → accusatif). `В метро` : pas d'Approfondir — **comportement attendu** (`TEXT_LESSON_LINKS.md` : #3 non lié). |
| RC-014 | Reader → Lesson → retour | — | [RC-027](./screenshots/RC-027-lesson-from-reader.png) | **OK** : `?from=reader&textId=…`, barre « ← Retour à la lecture », CTA « Relire le texte → », retour Reader. **Friction** : scroll non restauré (voir RC-024). |
| RC-015 | Vocabulaire | — | — | Empty state correct. **Pas de bug.** |
| RC-016 | Révision | — | — | Empty state correct. **OK.** |
| RC-017 | Pratique | — | — | Page cohérente. **OK.** |
| RC-018 | Import | — | — | Page cohérente, CTA désactivé si vide, quotas affichés (`0/20`, `x/15 000`). **OK.** |
| RC-019 | Import → Preview → Reader | — | [RC-029](./screenshots/RC-029-import-preview.png) | **OK** : coller 33 mots → Analyser → Preview → « Lire maintenant » → Reader `Mon texte`. Enregistrement auto dans Mes imports (82 % lu). |
| RC-020 | Navigation globale | **Mineur** | — | Hamburger « Ouvrir le menu » visible en desktop dans certains snapshots — vérifier breakpoint 1280+. |
| RC-021 | Auth | — | [RC-001](./screenshots/RC-001-login-page.png) | Logo auth = navbar. **OK post-5.6.** |
| RC-022 | Reader / clic mot | ~~**Majeur**~~ **Fermé** | [RC-024](./screenshots/RC-024-explorer-desktop-1440.png) | Hydratation React au clic mot : `Sentence.tsx` L165 (et historiquement `Word.tsx` L115). Overlay dev + aria mot coupé (`ваго́ н`). **Corrigé RC 2** — voir clôture ci-dessous. |
| RC-023 | Bibliothèque | **Mineur** | — | Flash « 0 résultat » / collections « 0 texte » avant fin du fetch `useTexts()` (~2 s). Pas de skeleton sur compteur. |
| RC-024 | Reader ↔ Lesson | **Mineur** | — | Après retour depuis leçon, `scrollTop = 0` — position de lecture non restaurée (mot cliqué peut rester surligné). |
| RC-025 | Reader / fin texte | — | [RC-028](./screenshots/RC-028-reader-fin-texte.png) | Section « Tu viens de rencontrer » + liens leçons : **OK** sur `В булочной` (4 leçons liées). |
| RC-026 | Import / Mes imports | — | — | Texte importé visible, quota `1/20`, progression affichée. Renommer / supprimer / recherche : **non testés en détail** cette session. |
| RC-027 | Desktop QA | — | — | 1280–1920 : pas de débordement horizontal détecté sur Reader. Explorer panel fixe 520px OK. Double scroll : 2 zones scrollables sur Reader (page + colonne) — **à valider visuellement** ; pas de régression flagrante. |

---

## Synthèse

| Gravité | Nombre |
|---------|--------|
| Bloquant | 0 |
| Majeur | 0 |
| Mineur | 10 |
| Cosmétique | 1 |
| OK / non bug | 8 |

### Bloquants RC 2 (ordre fondateur)

1. ~~**RC-004**~~ — Login bloqué sans profil ✅
2. ~~**RC-010**~~ — Hydratation `PageHeader` (global) ✅
3. ~~**RC-001**~~ — Erreur pédagogique onboarding ✅
4. ~~**RC-022**~~ — Hydratation Reader au clic mot ✅

*(RC-007 retiré des bloquants après re-test.)*

### Règle RC

**1 ticket = 1 correction = 1 build = retour buglist.**  
Pas de « tant qu'on y est », pas de redesign.

---

## RC 1 bis — checklist

- [x] Reader → clic mot → Explorer complet
- [x] Reader → lien Leçon → retour Reader (scroll : friction RC-024)
- [x] Fin texte → « Tu viens de rencontrer »
- [x] Import : coller → Preview → Reader
- [x] Import → Mes imports (via Lire maintenant)
- [x] Desktop 1280 / 1440 / 1680 / 1920 (partiel)
- [x] Console : hydratation React récurrente (dev)

**RC 1 gelé** — 2026-07-11. **RC 2 ouvert** — RC-004 fermé 2026-07-11, RC-010 + RC-022 fermés 2026-07-12, RC-001 fermé 2026-07-12.

---

## RC-004 — Clôture RC 2

**Cause racine**

Le handler login (`login/page.tsx`) appelait `signInWithPassword` puis `router.push("/")` sans :
1. créer le `user_profiles` manquant (contrairement à `register/page.tsx`) ;
2. réinitialiser `isLoading` sur le chemin succès (`finally` absent) ;
3. gérer les erreurs profil / réseau avec un message explicite.

Résultat cas 2 : auth OK, profil absent → navigation incertaine, bouton bloqué sur « Connexion… ».

**Correction**

- `src/lib/auth/ensure-user-profile.ts` — crée le profil si absent (même logique que register).
- `login/page.tsx` — `ensureUserProfile` après sign-in, redirect `/` ou `/onboarding`, `try/catch/finally`.
- `register/page.tsx` — refactor vers `ensureUserProfile` (pas de changement comportemental).
- `onboarding/page.tsx` — `.maybeSingle()` au lieu de `.single()`.
- `api/onboarding/complete` — `ensureUserProfile` avant update (évite UPDATE sur ligne absente).

**Pourquoi cela ne cassera pas autre chose**

- Middleware inchangé : la logique onboarding reste la source de vérité côté routes.
- `ensureUserProfile` est idempotent (SELECT puis INSERT si absent).
- Register conserve le même flux, code mutualisé.
- Erreurs DB/réseau remontent à l'UI au lieu d'un spinner infini.

**Build OK** — `npm run build` ✓ (2026-07-11)

**Ticket fermé** ✅

---

## RC-010 — Clôture RC 2

**Cause racine**

1. **TanStack Query v5 — `isLoading` ≠ `isPending` en SSR**  
   Sur les pages client (`library`, Home, etc.), le HTML SSR est généré avec `isPending=true` mais `isFetching=false` → `isLoading=false` → contenu « vide » (ex. « 0 résultat », pas de skeleton). Au premier paint client, `isFetching=true` → `isLoading=true` → skeletons. React signale l'écart au premier nœud divergent, souvent `PageHeader.tsx` L41 (badge trailing), alors que la source est le hook de données.

2. **Reader — segmentation de graphèmes non déterministe (secondaire, lié RC-022)**  
   `segmentGraphemes()` utilisait `Intl.Segmenter` quand disponible, avec repli manuel sinon → écarts SSR/client sur le découpage radical/terminaison dans `Word.tsx`.

**Correction**

- `useTexts.ts`, `useHomeData.ts`, `useVocabulary.ts` — exposer `isLoading` via `query.isPending` (pas `query.isLoading`).
- `library/page.tsx` — skeleton sur le badge `PageHeader` et le compteur « Vos textes » tant que `isLoading`.
- `russian.ts` — boucle de graphèmes déterministe uniquement (suppression branche `Intl.Segmenter`).

**Pourquoi cela ne cassera pas autre chose**

- Le comportement métier des requêtes est inchangé ; seul le signal « en chargement » est aligné SSR/client.
- Les skeletons remplacent un flash « 0 » par un placeholder neutre — pas de logique fetch nouvelle.
- La segmentation russe reste locale et pure ; le repli manuel couvre tous les environnements de la même façon.

**Vérification**

- `npm run build` ✓ (2026-07-12)
- `next start` (port 3002) : `/library`, `/`, `/lessons`, `/reader/…` — 0 overlay hydratation ; clic mot `хлеб.` OK.

**Ticket fermé** ✅

---

## RC-022 — Clôture RC 2

**Cause racine**

Même segmentation que RC-010 (point 2) : `Intl.Segmenter` produisait un découpage radical/terminaison différent entre serveur et client → structure DOM distincte dans `Word.tsx` (L115) et aria coupé (`ваго́` + `н` au lieu de `ваг` + `о́н`).

**Correction**

- `russian.ts` — `segmentGraphemes()` déterministe (combining marks rattachés au graphème précédent).

**Pourquoi cela ne cassera pas autre chose**

- `splitWordStemAndSuffix`, `splitWordByApiSuffix` et l'onboarding réutilisent la même fonction ; comportement unifié partout.
- Ex. `ваго́н` → `ваг` + `о́н` (plus d'espace fantôme dans l'aria).

**Vérification**

- Prod `next start` : clic mot Reader sans overlay hydratation.
- Test unitaire ad hoc : `splitWordStemAndSuffix('ваго́н')` → `{ stem: 'ваг', suffix: 'о́н' }`.

**Ticket fermé** ✅

---

## RC-001 — Clôture RC 2

**Cause racine**

L'exemple 2 de l'étape 1 (`Машу видит Анна`) avait une traduction calquée sur l'ordre des mots français (« Macha voit Anna ») au lieu du sens russe indiqué par les cas. Le texte explicatif en bas de carte disait pourtant correctement qu'**Анна** voit et **Машу** est vue — contradiction pédagogique immédiate pour un enseignant.

Audit complémentaire (5 écrans) :
- Étape 1 : accord « celui qui est vu » au lieu de « celle qui est vue » (Маша, féminin).
- Étape 3 : rôle du verbe `видит` dupliquait « fait l'action » (réservé au sujet) ; traduction française absente ; aria-labels illisibles (RC-003).
- Étape 4 : phrase russe correcte, traduction française absente pour le contexte de sauvegarde.

**Correction** (`OnboardingFlow.tsx`)

| Écran | Correction |
|-------|------------|
| 1 | Traduction ex. 2 → « Anna voit Macha » ; note de bas de carte → « celle qui est vue » |
| 2 | Aucune erreur (légende couleurs cohérente avec Reader) |
| 3 | Rôle `видит` → « exprime l'action » ; traduction « Anna voit Macha. » ; `aria-label` explicites sur les 3 mots |
| 4 | Traduction du contexte : « Anna entre dans le wagon et s'assoit près de la fenêtre. » |
| 5 | Aucune phrase russe (citation FR uniquement) |

**Pourquoi cela ne cassera pas autre chose**

- Aucun changement de flux, d'étapes ni de données API.
- Les couleurs et rôles restent alignés avec la charte Reader (`blue` = sujet, `coral` = objet).
- Le russe affiché est inchangé ; seules les couches FR et les libellés de rôle sont corrigés.

**Audit pédagogique post-correction**

| Phrase russe | Traduction FR | Couleurs | Rôles | Verdict |
|--------------|---------------|----------|-------|---------|
| `Анна видит Машу` | Anna voit Macha | Анна bleu, -у corail | sujet / objet | ✅ |
| `Машу видит Анна` | Anna voit Macha | -у corail, Анна bleu | objet / sujet | ✅ |
| `Анна видит Машу.` (démo) | Anna voit Macha. | idem + видит souligné | sujet / verbe / objet | ✅ |
| `Анна входит в вагон и садится у окна.` | Anna entre… fenêtre | — (hors démo couleurs) | acc. inanimé, у + gén. | ✅ |

**Build OK** — `npm run build` ✓ (2026-07-12)

**Ticket fermé** ✅

---

## Méthode

Tickets uniquement. Pas de correction pendant RC 1.  
Compte audit : `rc.ux.audit+1783793450@test.local` / `RcAudit2026!`
