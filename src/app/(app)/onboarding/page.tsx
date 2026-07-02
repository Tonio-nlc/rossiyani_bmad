import Link from "next/link";

export default function OnboardingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-2xl font-semibold text-brand-text-primary">
        Onboarding — bientôt disponible
      </h1>
      <p className="mt-4">
        <Link
          href="/library"
          className="font-medium text-brand-primary hover:underline"
        >
          Accéder à la bibliothèque →
        </Link>
      </p>
    </div>
  );
}
