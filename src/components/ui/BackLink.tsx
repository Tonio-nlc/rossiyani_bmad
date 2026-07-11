import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface BackLinkProps {
  href: string;
  label: string;
  className?: string;
}

export function BackLink({ href, label, className }: BackLinkProps) {
  return (
    <Link
      href={href}
      className={
        className ??
        "inline-flex items-center gap-2 text-[13px] font-medium text-ink-3 transition-colors hover:text-ink"
      }
    >
      <ArrowLeft className="size-4 shrink-0" aria-hidden="true" />
      {label}
    </Link>
  );
}
