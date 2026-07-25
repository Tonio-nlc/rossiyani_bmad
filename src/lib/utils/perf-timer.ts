/**
 * Chronométrage par étape — activable en dev uniquement (mêmes conventions
 * que `logKnowledge`). Diagnostic de performance Reader/sauvegarde
 * (explain + vocabulaire) : aucune donnée sensible, juste des durées en ms.
 */
const PERF_DEBUG =
  process.env.NODE_ENV === "development" || process.env.PERF_DEBUG === "1";

export interface TPerfMark {
  /** Logue la durée depuis le dernier mark (ou le début) + le cumul. */
  (step: string): void;
}

export function createPerfTimer(scope: string): TPerfMark {
  if (!PERF_DEBUG) {
    return () => undefined;
  }

  const start = performance.now();
  let last = start;

  return (step: string) => {
    const now = performance.now();
    console.log(
      `[perf] ${scope} · ${step} : ${(now - last).toFixed(0)} ms (total ${(now - start).toFixed(0)} ms)`,
    );
    last = now;
  };
}
