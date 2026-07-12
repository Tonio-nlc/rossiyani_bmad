import { RossiyaniBrandMark } from "@/components/brand/RossiyaniBrandMark";
import { cn } from "@/lib/utils";

interface RossiyaniLogoProps {
  className?: string;
  centered?: boolean;
}

/** Logo complet — marque + wordmark. Auth et pages publiques */
export function RossiyaniLogo({
  className,
  centered = true,
}: RossiyaniLogoProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5",
        centered && "justify-center",
        className,
      )}
    >
      <RossiyaniBrandMark size="lg" />
      <span className="text-2xl font-bold text-ink">Rossiyani</span>
    </div>
  );
}
