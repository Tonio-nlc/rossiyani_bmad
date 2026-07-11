import Link from "next/link";

export default function VocabularyEntryNotFound() {
  return (
    <div className="mx-auto max-w-content px-4 py-12 text-center">
      <h1 className="text-2xl font-semibold text-ink">
        Mot introuvable
      </h1>
      <p className="mt-2 text-ink-2">
        Ce mot n&apos;est pas dans votre vocabulaire ou n&apos;existe pas.
      </p>
      <Link
        href="/vocabulary"
        className="mt-6 inline-block text-sm font-medium text-accent hover:underline"
      >
        Retour au vocabulaire
      </Link>
    </div>
  );
}
