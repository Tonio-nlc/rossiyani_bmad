import Link from "next/link";

interface ReaderHeaderProps {
  collectionLabel: string;
  title: string;
  level: string;
  readingTimeMinutes: number;
  exploredCount: number;
  percentRead: number;
}

export function ReaderHeader({
  collectionLabel,
  title,
  level,
  readingTimeMinutes,
  exploredCount,
  percentRead,
}: ReaderHeaderProps) {
  const exploredLabel = `${exploredCount} mot${exploredCount > 1 ? "s" : ""} exploré${exploredCount > 1 ? "s" : ""}`;

  return (
    <header className="sticky top-14 z-40 border-b border-[#E8E4DC] bg-white py-3">
      <div className="px-10">
        <div className="mx-auto max-w-[680px]">
          <nav className="flex flex-wrap items-center text-[13px] text-[#A8A8A8]">
            <Link href="/library" className="hover:text-[#5A5A5A]">
              Bibliothèque
            </Link>
            <span style={{ color: "#A8A8A8", margin: "0 6px" }}>·</span>
            <span>{collectionLabel}</span>
            <span style={{ color: "#A8A8A8", margin: "0 6px" }}>·</span>
            <span className="font-russian">{title}</span>
          </nav>

          <h1
            className="font-russian font-bold text-[#0E0E0E]"
            style={{
              fontSize: 22,
              marginTop: 6,
              marginBottom: 4,
            }}
          >
            {title}
          </h1>

          <div className="flex items-center justify-between gap-4 text-[13px] text-[#5A5A5A]">
            <span className="flex flex-wrap items-center gap-2">
              <span className="rounded-[5px] border border-[#E8E4DC] px-2 py-0.5 text-[11px] font-bold text-[#0E0E0E]">
                {level}
              </span>
              <span>
                {readingTimeMinutes} min · {exploredLabel}
              </span>
            </span>
            <span className="shrink-0 font-medium text-[#0E0E0E]">
              {percentRead}% lu
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
