interface ImportLimitsNoticeProps {
  className?: string;
}

export function ImportLimitsNotice({ className }: ImportLimitsNoticeProps) {
  return (
    <aside
      className={
        className ??
        "rounded-[12px] border border-border/70 bg-bg/40 p-4 text-[13px] leading-relaxed text-ink-2"
      }
    >
      <p>
        ℹ️ Formats acceptés : copier-coller et .txt (UTF-8). Maximum 15 000 mots
        par texte. PDF et EPUB : bientôt.
      </p>
    </aside>
  );
}
