import { cn } from "@/lib/utils";

export type ImportSourceTab = "paste" | "file";

interface ImportSourceTabsProps {
  value: ImportSourceTab;
  onChange: (value: ImportSourceTab) => void;
}

const TABS: { id: ImportSourceTab; label: string }[] = [
  { id: "paste", label: "Coller un texte" },
  { id: "file", label: "Importer un .txt" },
];

export function ImportSourceTabs({ value, onChange }: ImportSourceTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Source du texte"
      className="flex flex-wrap gap-2"
    >
      {TABS.map((tab) => {
        const selected = value === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.id)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              selected
                ? "border-accent bg-accent text-white"
                : "border-border bg-surface text-ink-2 hover:text-ink",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
