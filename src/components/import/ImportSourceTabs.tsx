import { PillGroup } from "@/components/ui/pill";

export type ImportSourceTab = "paste" | "file";

interface ImportSourceTabsProps {
  value: ImportSourceTab;
  onChange: (value: ImportSourceTab) => void;
}

const TABS = [
  { value: "paste" as const, label: "Coller un texte" },
  { value: "file" as const, label: "Importer un .txt" },
];

export function ImportSourceTabs({ value, onChange }: ImportSourceTabsProps) {
  return (
    <PillGroup
      options={TABS}
      value={value}
      onChange={onChange}
      role="tablist"
      ariaLabel="Source du texte"
    />
  );
}
