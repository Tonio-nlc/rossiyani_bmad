import { NextResponse } from "next/server";
import { z } from "zod";

import { IMPORT_LIMITS } from "@/lib/import/constants";
import { createClient } from "@/lib/supabase/server";

const renameSchema = z.object({
  title: z.string().trim().min(1).max(IMPORT_LIMITS.maxTitleLength),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = renameSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Corps de requête invalide" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("texts")
    .update({ title: parsed.data.title })
    .eq("id", id)
    .eq("source", "imported")
    .select("id, title")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Import introuvable" }, { status: 404 });
  }

  return NextResponse.json({ id: data.id, title: data.title });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;

  const { data, error } = await supabase
    .from("texts")
    .delete()
    .eq("id", id)
    .eq("source", "imported")
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Import introuvable" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
