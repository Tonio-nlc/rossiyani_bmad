interface SchemaDiagramProps {
  svgContent: string;
  caption: string;
}

export function SchemaDiagram({ svgContent, caption }: SchemaDiagramProps) {
  return (
    <figure className="my-6">
      <div
        className="flex justify-center overflow-x-auto rounded-[14px] border border-border bg-surface p-6"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
      {caption ? (
        <figcaption className="mt-3 text-center text-xs text-ink-3">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
