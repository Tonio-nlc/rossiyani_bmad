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

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: validation.data.email,
      password: validation.data.password,
    });

    if (signInError) {
      setError(translateAuthError(signInError.message));
      setIsLoading(false);
      return;
    }

    router.refresh();
    router.push("/");
  }

  return (
    <div className="w-full max-w-[400px]">
      <RossiyaniLogo />

      <Card className="border-brand-border bg-brand-card shadow-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-brand-text-primary">
            Bon retour
          </CardTitle>
          <CardDescription className="text-brand-text-secondary">
            Continuez votre progression en russe
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              className="h-10 w-full bg-brand-primary text-white hover:bg-brand-primary/90"
            >
              {isLoading ? "Connexion..." : "Se connecter →"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-brand-text-secondary">
            Pas encore de compte ?{" "}
            <Link
              href="/register"
              className="font-medium text-brand-primary hover:underline"
            >
              S&apos;inscrire
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
