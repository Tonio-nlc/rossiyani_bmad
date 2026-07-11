import Link from "next/link";

import { lessonsIndexHref } from "@/lib/lessons/lesson-nav";

export default function LessonsNotFound() {
  return (
    <div className="mx-auto max-w-content px-4 py-12 text-center md:px-10">
      <h1 className="font-serif text-2xl text-ink">Page introuvable</h1>
      <p className="mt-2 text-sm text-ink-3">
        Ce parcours ou cette leçon n&apos;existe pas.
      </p>
      <Link
        href={lessonsIndexHref()}
        className="mt-6 inline-block text-sm font-semibold text-accent hover:text-accent-deep"
      >
        Retour aux leçons
      </Link>
    </div>
  );
}
