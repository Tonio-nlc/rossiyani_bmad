import { PracticeBreadcrumb } from "@/components/practice/PracticeBreadcrumb";
import { SentenceBuilder } from "@/components/practice/SentenceBuilder";
import { PageBody } from "@/components/ui/PageBody";
import { PageHeader } from "@/components/ui/PageHeader";

export default function SentenceBuilderPage() {
  return (
    <div>
      <PageHeader
        eyebrow="PRATIQUE"
        title="Constructeur de phrases"
        subtitle="Formulez une phrase à partir de ce que vous avez lu."
        width="content"
        leading={<PracticeBreadcrumb current="Constructeur de phrases" />}
      />
      <PageBody width="content">
        <SentenceBuilder />
      </PageBody>
    </div>
  );
}
