import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  description: string;
  onRetry?: () => void;
  className?: string;
}

/** État erreur canonique — Story 5.6 UI Freeze */
export function ErrorState({
  title = "Chargement impossible",
  description,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <EmptyState
      title={title}
      description={description}
      dashed={false}
      className={cn("border-destructive/25 bg-surface", className)}
      action={
        onRetry
          ? {
              label: "Réessayer",
              onClick: onRetry,
            }
          : undefined
      }
    />
  );
}
