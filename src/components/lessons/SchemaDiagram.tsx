interface SchemaDiagramProps {
  svgContent: string;
  caption: string;
}

export function SchemaDiagram({ svgContent, caption }: SchemaDiagramProps) {
  return (
    <figure>
      <div
        className="flex justify-center overflow-x-auto rounded-[14px] border border-border bg-bg p-4 md:p-6 [&_svg]:max-w-full [&_svg]:h-auto"
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
