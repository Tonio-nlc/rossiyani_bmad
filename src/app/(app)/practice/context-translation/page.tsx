import { ContextTranslation } from "@/components/practice/ContextTranslation";
import { PracticeBreadcrumb } from "@/components/practice/PracticeBreadcrumb";
import { PageBody } from "@/components/ui/PageBody";
import { PageHeader } from "@/components/ui/PageHeader";

export default function ContextTranslationPage() {
  return (
    <div>
      <PageHeader
        eyebrow="PRATIQUE"
        title="Traduction contextualisée"
        subtitle="Traduisez le sens, pas les mots — pensez comme un locuteur natif."
        width="content"
        leading={<PracticeBreadcrumb current="Traduction contextualisée" />}
      />
      <PageBody width="content">
        <ContextTranslation />
      </PageBody>
    </div>
  );
}
