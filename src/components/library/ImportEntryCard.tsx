import { Plus } from "lucide-react";
import Link from "next/link";

import { CARD_BASE_CLASS } from "@/components/ui/card-styles";

export function ImportEntryCard() {
  return (
    <Link
      href="/import"
      className={`flex flex-col justify-center border-dashed ${CARD_BASE_CLASS}`}
    >
      <div className="mb-4 flex size-[38px] items-center justify-center rounded-lg bg-accent-light text-accent">
        <Plus className="size-5" aria-hidden="true" />
      </div>
      <h3 className="text-sm font-bold text-ink">Importer un texte</h3>
      <p className="mt-2 text-xs leading-relaxed text-ink-3">
        Coller ou charger un fichier .txt
      </p>
    </Link>
  );
}
