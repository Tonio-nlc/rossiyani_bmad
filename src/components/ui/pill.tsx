import { cn } from "@/lib/utils";

export interface PillOption<T extends string> {
  value: T;
  label: string;
}

interface PillGroupProps<T extends string> {
  options: readonly PillOption<T>[] | readonly T[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  /** Labels from raw string options (value === label) */
  getLabel?: (value: T) => string;
  role?: "tablist" | "group";
  ariaLabel?: string;
}

function normalizeOptions<T extends string>(
  options: readonly PillOption<T>[] | readonly T[],
  getLabel?: (value: T) => string,
): PillOption<T>[] {
  if (options.length === 0) {
    return [];
  }

  const first = options[0];

  if (typeof first === "string") {
    return (options as readonly T[]).map((value) => ({
      value,
      label: getLabel ? getLabel(value) : value,
    }));
  }

  return options as PillOption<T>[];
}

/**
 * Filtre / onglet unique — remplace FilterPills, VocabularyFilterPills, ImportSourceTabs.
 */
export function PillGroup<T extends string>({
  options,
  value,
  onChange,
  className,
  getLabel,
  role = "group",
  ariaLabel,
}: PillGroupProps<T>) {
  const items = normalizeOptions(options, getLabel);

  return (
    <div
      role={role}
      aria-label={ariaLabel}
      className={cn("flex flex-wrap gap-2", className)}
    >
      {items.map((option) => {
        const selected = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            role={role === "tablist" ? "tab" : undefined}
            aria-selected={role === "tablist" ? selected : undefined}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              selected
                ? "border-accent bg-accent text-white"
                : "border-border bg-surface text-ink-2 hover:text-ink",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
