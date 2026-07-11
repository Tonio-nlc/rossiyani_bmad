import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface LessonBridgeCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

/** Carte secondaire — pont Reader ↔ Lessons, ne doit pas interrompre la lecture */
export function LessonBridgeCard({
  title,
  children,
  className,
}: LessonBridgeCardProps) {
  return (
    <aside
      className={cn(
        "rounded-[12px] border border-border/70 bg-bg/40 p-5 md:p-6",
        className,
      )}
    >
      <p className="text-[11px] font-bold tracking-[0.06em] text-ink-3 uppercase">
        {title}
      </p>
      <div className="mt-4 space-y-3">{children}</div>
    </aside>
  );
}

interface LessonBridgeLinkProps {
  href: string;
  label: string;
  cta: string;
}

export function LessonBridgeLink({ href, label, cta }: LessonBridgeLinkProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-1 rounded-[10px] border border-border/60 bg-surface px-4 py-3 transition-colors hover:border-accent-border hover:bg-accent-light/30"
    >
      <span className="text-sm font-medium leading-snug text-ink group-hover:text-accent">
        {label}
      </span>
      <span className="text-[13px] font-semibold text-accent">{cta}</span>
    </Link>
  );
}
