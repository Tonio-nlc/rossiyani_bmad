import type { ReactNode } from "react";
import Link from "next/link";

import { EMPTY_STATE_SHELL_CLASS } from "@/components/ui/card-styles";
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
        EMPTY_STATE_SHELL_CLASS,
        "items-center justify-center text-center",
        dashed && "border-dashed",
        className,
      )}
    >
      {icon ? <div className="mb-3">{icon}</div> : null}
      <p className="text-base font-bold text-ink">{title}</p>
      {description ? (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-2">
          {description}
        </p>
      ) : null}
      {action ? (
        action.href ? (
          <Link href={action.href} className={cn(BTN_PRIMARY_CLASS, "mt-4")}>
            {action.label}
          </Link>
        ) : (
          <button
            type="button"
            onClick={action.onClick}
            className={cn(BTN_PRIMARY_CLASS, "mt-4")}
          >
            {action.label}
          </button>
        )
      ) : null}
    </div>
  );
}
