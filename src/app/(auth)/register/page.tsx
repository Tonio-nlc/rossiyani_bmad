"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

import { RossiyaniLogo } from "@/components/auth/RossiyaniLogo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ensureUserProfile } from "@/lib/auth/ensure-user-profile";
import { translateAuthError } from "@/lib/auth/errors";
import { createClient } from "@/lib/supabase/client";

const registerSchema = z.object({
  displayName: z.string().min(1, "Le prénom est requis"),
  email: z.string().email("Veuillez entrer un email valide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit faire au moins 8 caractères"),
});

export default function RegisterPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const validation = registerSchema.safeParse({ displayName, email, password });

    if (!validation.success) {
      setError(validation.error.issues[0]?.message ?? "Formulaire invalide");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: validation.data.email,
        password: validation.data.password,
      });

      if (signUpError) {
        setError(translateAuthError(signUpError.message));
        return;
      }

      if (!data.user) {
        setError("Une erreur est survenue, veuillez réessayer");
        return;
      }

      const { profile, error: profileError } = await ensureUserProfile(
        supabase,
        data.user,
        { displayName: validation.data.displayName },
      );

      if (profileError || !profile) {
        setError(
          translateAuthError(
            profileError ?? "Impossible de créer votre profil",
          ),
        );
        return;
      }

      router.refresh();
      router.push(profile.onboarding_completed ? "/" : "/onboarding");
    } catch {
      setError(
        "Une erreur réseau est survenue. Vérifiez votre connexion et réessayez.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[400px]">
      <RossiyaniLogo className="mb-8" />

      <Card className="border-border bg-surface shadow-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-ink">
            Créer un compte
          </CardTitle>
          <CardDescription className="text-ink-2">
            Commencez à comprendre le russe
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="displayName"
                className="text-sm font-medium text-ink"
              >
                Prénom
              </label>
              <Input
                id="displayName"
                type="text"
                autoComplete="given-name"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Votre prénom"
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-ink"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="vous@exemple.com"
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-ink"
              >
                Mot de passe
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Minimum 8 caractères"
                disabled={isLoading}
                required
              />
            </div>

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="h-10 w-full bg-accent text-white hover:bg-accent/90"
            >
              {isLoading ? "Création en cours..." : "Créer mon compte →"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-2">
            Déjà un compte ?{" "}
            <Link
              href="/login"
              className="font-medium text-accent hover:underline"
            >
              Se connecter
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
