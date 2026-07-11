import {
  LESSON_SCHEMA_CAPTION_CLASS,
  LESSON_SCHEMA_PADDING_CLASS,
  LESSON_SCHEMA_SHELL_CLASS,
} from "@/lib/design/lesson-composition";
import { cn } from "@/lib/utils";

interface SchemaDiagramProps {
  svgContent: string;
  caption: string;
  variant?: "default" | "climax";
}

/** Schéma = illustration intégrée dans le flux de lecture */
export function SchemaDiagram({
  svgContent,
  caption,
  variant = "default",
}: SchemaDiagramProps) {
  return (
    <figure className={cn(variant === "climax" && "mx-auto w-full max-w-reading")}>
      <div
        className={cn(
          LESSON_SCHEMA_SHELL_CLASS,
          LESSON_SCHEMA_PADDING_CLASS,
          "flex justify-center overflow-x-auto [&_svg]:h-auto [&_svg]:max-w-full",
        )}
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
      {caption ? (
        <figcaption className={LESSON_SCHEMA_CAPTION_CLASS}>
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
