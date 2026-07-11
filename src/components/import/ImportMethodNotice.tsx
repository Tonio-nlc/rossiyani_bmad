interface ImportMethodNoticeProps {
  className?: string;
}

export function ImportMethodNotice({ className }: ImportMethodNoticeProps) {
  return (
    <aside
      className={
        className ??
        "rounded-[12px] border border-border/70 bg-bg/40 p-4 text-[13px] leading-relaxed text-ink-2"
      }
    >
      <p>
        Les traductions phrase par phrase ne sont pas générées à l&apos;import.
        Explore chaque mot pendant la lecture — comme dans tes textes Rossiyani.
      </p>
    </aside>
  );
}
