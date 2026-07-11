import { BackLink } from "@/components/ui/BackLink";
import {
  parseReturnContext,
  resolveReaderBackNavigation,
} from "@/lib/navigation/return-context";
import { ContextBar } from "@/components/ui/ContextBar";

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
    <ContextBar width="dashboard">
      <BackLink
        href={backNavigation.href}
        label={backNavigation.label}
      />
    </ContextBar>
  );
}
