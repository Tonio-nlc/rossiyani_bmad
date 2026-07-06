import { cn } from "@/lib/utils";

interface FilterPillsProps<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
}

export function FilterPills<T extends string>({
  options,
  value,
  onChange,
}: FilterPillsProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
            value === option
              ? "border-[#4F46E5] bg-[#4F46E5] text-white"
              : "border-[#E8E4DC] bg-white text-[#5A5A5A] hover:text-[#0E0E0E]",
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
