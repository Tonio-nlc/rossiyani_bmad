interface LessonsPathProgressProps {
  completedCount: number;
  totalCount: number;
  pathColor: string;
}

export function LessonsPathProgress({
  completedCount,
  totalCount,
  pathColor,
}: LessonsPathProgressProps) {
  if (totalCount === 0) {
    return null;
  }

  const percentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[12px] text-ink-3">
        <span>
          {completedCount}/{totalCount} leçon{totalCount > 1 ? "s" : ""} terminée
          {completedCount > 1 ? "s" : ""}
        </span>
        <span className="font-medium text-ink-2">{percentage}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-bg">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${percentage}%`,
            backgroundColor: pathColor,
          }}
        />
      </div>
    </div>
  );
}
