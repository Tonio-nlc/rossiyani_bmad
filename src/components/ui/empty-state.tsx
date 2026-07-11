import type { ReactNode } from "react";
import Link from "next/link";

import { CARD_BASE_CLASS } from "@/components/ui/card-styles";
import { BTN_PRIMARY_CLASS } from "@/lib/design/classes";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  dashed?: boolean;
  className?: string;
}

/**
 * État vide canonique — une seule implémentation.
 */
export function EmptyState({
  title,
  description,
  icon,
  action,
  dashed = true,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        CARD_BASE_CLASS,
        "flex flex-col items-center justify-center text-center",
        dashed && "border-dashed",
        className,
      )}
    >
      {icon ? <div className="mb-4">{icon}</div> : null}
      <p className="text-base font-bold text-ink">{title}</p>
      {description ? (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-2">
          {description}
        </p>
      ) : null}
      {action ? (
        action.href ? (
          <Link href={action.href} className={cn(BTN_PRIMARY_CLASS, "mt-5")}>
            {action.label}
          </Link>
        ) : (
          <button
            type="button"
            onClick={action.onClick}
            className={cn(BTN_PRIMARY_CLASS, "mt-5")}
          >
            {action.label}
          </button>
        )
      ) : null}
    </div>
  );
}
