import { BookOpen } from "lucide-react";

export function RossiyaniLogo() {
  return (
    <div className="mb-8 flex items-center justify-center gap-2">
      <BookOpen className="size-7 text-brand-primary" aria-hidden="true" />
      <span className="text-2xl font-semibold text-brand-primary">Rossiyani</span>
    </div>
  );
}
