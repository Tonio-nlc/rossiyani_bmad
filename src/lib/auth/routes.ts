export const AUTH_ROUTES = ["/login", "/register"] as const;

export const PROTECTED_ROUTE_PREFIXES = [
  "/library",
  "/reader",
  "/vocabulary",
  "/lessons",
  "/practice",
  "/onboarding",
] as const;

export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.includes(pathname as (typeof AUTH_ROUTES)[number]);
}

export function isProtectedRoute(pathname: string): boolean {
  if (pathname === "/") {
    return true;
  }

  return PROTECTED_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
