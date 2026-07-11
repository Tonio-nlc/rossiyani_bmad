interface SchemaDiagramProps {
  svgContent: string;
  caption: string;
  variant?: "default" | "climax";
}

export function SchemaDiagram({
  svgContent,
  caption,
  variant = "default",
}: SchemaDiagramProps) {
  if (variant === "climax") {
    return (
      <figure className="mx-auto w-full max-w-[28rem] px-2 md:max-w-[32rem] md:px-0">
        <div
          className="flex justify-center py-10 md:py-14 [&_svg]:h-auto [&_svg]:max-w-full"
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
        {caption ? (
          <figcaption className="mx-auto mt-8 max-w-[24rem] text-center text-[11px] leading-relaxed tracking-[0.04em] text-ink-3">
            {caption}
          </figcaption>
        ) : null}
      </figure>
    );
  }

  return (
    <figure>
      <div
        className="flex justify-center overflow-x-auto rounded-[14px] border border-border bg-bg p-4 md:p-6 [&_svg]:h-auto [&_svg]:max-w-full"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
      {caption ? (
        <figcaption className="mt-3 text-center text-xs leading-relaxed text-ink-3">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
