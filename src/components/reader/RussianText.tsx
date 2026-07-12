import { displayRussianGraphemes } from "@/lib/russian/display-russian";
import { cn } from "@/lib/utils";

export interface RussianTextProps {
  children: string;
  className?: string;
}

/**
 * Rendu russe aligné sur le pipeline displayRussian (RC-020).
 */
export function RussianText({ children, className }: RussianTextProps) {
  const graphemes = displayRussianGraphemes(children);

  return (
    <span className={cn("font-russian", className)}>
      {graphemes.map((grapheme, index) => (
        <span key={`${index}-${grapheme}`} className="inline">
          {grapheme}
        </span>
      ))}
    </span>
  );
}

export { displayRussian, displayRussianGraphemes } from "@/lib/russian/display-russian";
