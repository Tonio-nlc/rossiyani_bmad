import Link from "next/link";

import type { ImportError } from "@/lib/import/types";
import { cn } from "@/lib/utils";

interface ImportErrorBannerProps {
  errors: ImportError[];
  onRetry?: () => void;
  className?: string;
}

function getBannerTone(code: ImportError["code"]): "amber" | "neutral" {
  if (
    code === "NOT_RUSSIAN" ||
    code === "IMPORT_QUOTA_EXCEEDED" ||
    code === "DAILY_IMPORT_LIMIT_EXCEEDED"
  ) {
    return "amber";
  }

  return "neutral";
}

export function ImportErrorBanner({
  errors,
  onRetry,
  className,
}: ImportErrorBannerProps) {
  if (errors.length === 0) {
    return null;
  }

  const primary = errors[0];
  const tone = getBannerTone(primary.code);

  return (
    <div
      role="alert"
      className={cn(
        "rounded-[12px] border p-4 text-[13px] leading-relaxed",
        tone === "amber"
          ? "border-amber/30 bg-amber/10 text-ink"
          : "border-border/70 bg-bg/40 text-ink-2",
        className,
      )}
    >
      <p className="font-semibold text-ink">⚠ {primary.message}</p>
      {errors.slice(1).map((error) => (
        <p key={error.code} className="mt-2">
          {error.message}
        </p>
      ))}

      <div className="mt-3 flex flex-wrap items-center gap-3">
        {primary.code === "NOT_RUSSIAN" && onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="text-sm font-semibold text-accent hover:underline"
          >
            Réessayer
          </button>
        )}

        {primary.code === "IMPORT_QUOTA_EXCEEDED" && (
          <Link
            href="/library#mes-imports"
            className="text-sm font-semibold text-accent hover:underline"
          >
            Voir mes imports
          </Link>
        )}
      </div>
    </div>
  );
}
