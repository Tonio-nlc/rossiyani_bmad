import { cn } from "@/lib/utils";

type BrandMarkSize = "sm" | "md" | "lg";

const SIZE_CLASS: Record<BrandMarkSize, { box: string; letter: string }> = {
  sm: { box: "size-7 rounded-[8px]", letter: "text-sm" },
  md: { box: "size-8 rounded-[9px]", letter: "text-base" },
  lg: { box: "size-10 rounded-[10px]", letter: "text-lg" },
};

interface RossiyaniBrandMarkProps {
  size?: BrandMarkSize;
  className?: string;
}

/** Marque Rossiyani — Р sur fond ink. Source unique favicon · navbar · auth */
export function RossiyaniBrandMark({
  size = "md",
  className,
}: RossiyaniBrandMarkProps) {
  const scale = SIZE_CLASS[size];

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center bg-ink",
        scale.box,
        className,
      )}
      aria-hidden="true"
    >
      <span
        className={cn("font-serif italic leading-none text-white", scale.letter)}
      >
        Р
      </span>
    </span>
  );
}
