const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "User already registered": "Un compte existe déjà avec cet email",
  "Password should be at least 6 characters":
    "Le mot de passe doit faire au moins 8 caractères",
  "Invalid login credentials": "Email ou mot de passe incorrect",
};

export function translateAuthError(message: string): string {
  return AUTH_ERROR_MESSAGES[message] ?? "Une erreur est survenue, veuillez réessayer";
}
