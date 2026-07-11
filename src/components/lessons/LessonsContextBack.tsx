import { BackLink } from "@/components/ui/BackLink";
import {
  parseReturnContext,
  resolveReaderBackNavigation,
} from "@/lib/navigation/return-context";

interface LessonsContextBackProps {
  from?: string;
  textId?: string;
}

export function LessonsContextBack({ from, textId }: LessonsContextBackProps) {
  const returnContext = parseReturnContext({
    get: (key) => {
      if (key === "from") return from ?? null;
      if (key === "textId") return textId ?? null;
      return null;
    },
  });

  if (returnContext.from !== "reader" || !returnContext.textId) {
    return null;
  }

  const backNavigation = resolveReaderBackNavigation(returnContext);

  return (
    <div className="border-b border-border bg-surface px-4 py-3 md:px-10">
      <div className="mx-auto max-w-[1080px]">
        <BackLink
          href={backNavigation.href}
          label={backNavigation.label}
        />
      </div>
    </div>
  );
}
