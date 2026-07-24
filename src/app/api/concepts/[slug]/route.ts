import { NextResponse } from "next/server";

import {
  ensureConceptGraphHydrated,
  getConceptBySlug,
} from "@/lib/knowledge/concept-graph";
import { composeCanonicalConceptScenario } from "@/lib/knowledge/teaching-engine";
import { createClient } from "@/lib/supabase/server";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * Scénario canonique d'un concept (phénomène) — sans bridge lemme.
 * Destiné à l'ouverture depuis l'ExplorerPanel du Reader.
 * Une route page `/concepts/[slug]` dédiée reste à créer plus tard.
 */
export async function GET(_request: Request, { params }: RouteParams) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  await ensureConceptGraphHydrated();

  const concept = getConceptBySlug(slug);

  if (!concept) {
    return NextResponse.json({ error: "Concept introuvable" }, { status: 404 });
  }

  const scenario = composeCanonicalConceptScenario(concept);

  return NextResponse.json({
    concept: {
      id: concept.id,
      slug: concept.slug,
      title: concept.title,
      summary: concept.summary,
      coreIdea: concept.coreIdea,
    },
    scenario,
  });
}
