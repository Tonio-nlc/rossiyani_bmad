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

const loginSchema = z.object({
  email: z.string().email("Veuillez entrer un email valide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const validation = loginSchema.safeParse({ email, password });

    if (!validation.success) {
      setError(validation.error.issues[0]?.message ?? "Formulaire invalide");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword(
        {
          email: validation.data.email,
          password: validation.data.password,
        },
      );

      if (signInError) {
        setError(translateAuthError(signInError.message));
        return;
      }

      if (!data.user) {
        setError("Une erreur est survenue, veuillez réessayer");
        return;
      }

      const { profile, error: profileError } = await ensureUserProfile(
        supabase,
        data.user,
      );

      if (profileError || !profile) {
        setError(
          translateAuthError(
            profileError ?? "Impossible de charger votre profil",
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
            Bon retour
          </CardTitle>
          <CardDescription className="text-ink-2">
            Continuez votre progression en russe
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Votre mot de passe"
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
              {isLoading ? "Connexion..." : "Se connecter →"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-2">
            Pas encore de compte ?{" "}
            <Link
              href="/register"
              className="font-medium text-accent hover:underline"
            >
              S&apos;inscrire
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
