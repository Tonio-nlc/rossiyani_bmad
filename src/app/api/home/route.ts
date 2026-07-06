import { NextResponse } from "next/server";

import { getHomeData } from "@/lib/home/get-home-data";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const data = await getHomeData(user.id);
    return NextResponse.json(data);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Une erreur est survenue lors du chargement de l'accueil";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
