export interface ReturnContext {
  from: string | null;
  textId: string | null;
}

type SearchParamsLike = {
  get: (key: string) => string | null;
};

export function parseReturnContext(
  searchParams: SearchParamsLike,
): ReturnContext {
  return {
    from: searchParams.get("from"),
    textId: searchParams.get("textId"),
  };
}

export function buildReturnQuery(from: string, textId?: string): string {
  const params = new URLSearchParams({ from });
  if (textId) {
    params.set("textId", textId);
  }
  return `?${params.toString()}`;
}

export function appendReturnQuery(
  href: string,
  from: string,
  textId?: string,
): string {
  const query = buildReturnQuery(from, textId);
  return href.includes("?") ? `${href}&${query.slice(1)}` : `${href}${query}`;
}

export function resolveReaderBackNavigation(
  context: ReturnContext,
  fallback: { href: string; label: string } = {
    href: "/vocabulary",
    label: "Vocabulaire",
  },
): { href: string; label: string } {
  if (context.from === "reader" && context.textId) {
    return { href: `/reader/${context.textId}`, label: "Retour à la lecture" };
  }

  if (context.from === "library") {
    return { href: "/library", label: "Bibliothèque" };
  }

  if (context.from === "home") {
    return { href: "/", label: "Accueil" };
  }

  return fallback;
}
