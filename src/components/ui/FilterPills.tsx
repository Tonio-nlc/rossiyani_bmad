import { PillGroup } from "@/components/ui/pill";

interface FilterPillsProps<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
}

/** @deprecated Prefer `PillGroup` — conservé pour compatibilité des imports existants. */
export function FilterPills<T extends string>({
  options,
  value,
  onChange,
}: FilterPillsProps<T>) {
  return <PillGroup options={options} value={value} onChange={onChange} />;
}

export { PillGroup };
