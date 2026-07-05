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

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: validation.data.email,
      password: validation.data.password,
    });

    if (signUpError) {
      setError(translateAuthError(signUpError.message));
      setIsLoading(false);
      return;
    }

    if (!data.user) {
      setError("Une erreur est survenue, veuillez réessayer");
      setIsLoading(false);
      return;
    }

    const { data: existingProfile } = await supabase
      .from("user_profiles")
      .select("onboarding_completed")
      .eq("id", data.user.id)
      .maybeSingle();

    if (!existingProfile) {
      const { error: profileError } = await supabase
        .from("user_profiles")
        .insert({
          id: data.user.id,
          display_name: validation.data.displayName,
          onboarding_completed: false,
        });

      if (profileError) {
        setError(translateAuthError(profileError.message));
        setIsLoading(false);
        return;
      }
    }

    router.refresh();
    router.push(
      existingProfile?.onboarding_completed ? "/" : "/onboarding",
    );
  }

  return (
    <div className="w-full max-w-[400px]">
      <RossiyaniLogo />

      <Card className="border-brand-border bg-brand-card shadow-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-brand-text-primary">
            Créer un compte
          </CardTitle>
          <CardDescription className="text-brand-text-secondary">
            Commencez à comprendre le russe
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="displayName"
                className="text-sm font-medium text-brand-text-primary"
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
                className="text-sm font-medium text-brand-text-primary"
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
                className="text-sm font-medium text-brand-text-primary"
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
              className="h-10 w-full bg-brand-primary text-white hover:bg-brand-primary/90"
            >
              {isLoading ? "Création en cours..." : "Créer mon compte →"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-brand-text-secondary">
            Déjà un compte ?{" "}
            <Link
              href="/login"
              className="font-medium text-brand-primary hover:underline"
            >
              Se connecter
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
