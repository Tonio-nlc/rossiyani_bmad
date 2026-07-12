import {
  formatAspectLabel,
  formatGenderLabel,
  formatMovementLabel,
  formatPosLabel,
} from "@/lib/vocabulary/format-linguistic-labels";
import type { TVocabularyLinguisticProfile } from "@/types/vocabulary";

interface LinguisticProfileSectionProps {
  profile: TVocabularyLinguisticProfile;
}

function ProfileBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <div className="text-[15px] leading-relaxed text-ink-2">{children}</div>
    </div>
  );
}

function buildNatureSummary(profile: TVocabularyLinguisticProfile): string | null {
  const pos = formatPosLabel(profile.partOfSpeech);

  if (!pos) {
    return null;
  }

  const gender = formatGenderLabel(profile.gender);
  const aspect = formatAspectLabel(profile.aspect);

  if (profile.partOfSpeech === "noun" && gender) {
    return `C'est un ${pos.toLowerCase()} ${gender.toLowerCase()}.`;
  }

  if (profile.partOfSpeech === "verb") {
    const parts = [`C'est un ${pos.toLowerCase()}`];

    if (aspect) {
      parts.push(`à l'aspect ${aspect.toLowerCase()}`);
    }

    return `${parts.join(" ")}.`;
  }

  if (profile.partOfSpeech === "adjective" && gender) {
    return `C'est un ${pos.toLowerCase()} qui s'accorde en genre avec le nom qu'il qualifie (${gender.toLowerCase()} dans sa forme de base).`;
  }

  return `C'est un ${pos.toLowerCase()}.`;
}

export function LinguisticProfileSection({
  profile,
}: LinguisticProfileSectionProps) {
  const natureSummary = buildNatureSummary(profile);
  const movementLabel = formatMovementLabel(profile.movementType);
  const hasGovernment = profile.government.length > 0;
  const hasNotes = Boolean(profile.notes?.trim());
  const hasRegister = Boolean(profile.register?.trim());
  const hasSemanticCategory = Boolean(profile.semanticCategory?.trim());

  if (
    !natureSummary &&
    !movementLabel &&
    !hasGovernment &&
    !hasNotes &&
    !hasRegister &&
    !hasSemanticCategory
  ) {
    return null;
  }

  return (
    <section className="space-y-6">
      <h2 className="text-lg font-semibold text-ink">Ce mot en russe</h2>

      {natureSummary ? (
        <p className="text-[15px] leading-relaxed text-ink-2">{natureSummary}</p>
      ) : null}

      {profile.partOfSpeech === "verb" && movementLabel ? (
        <ProfileBlock title="Verbe de mouvement">
          <p>
            Ce verbe est <strong className="font-medium text-ink">{movementLabel}</strong>{" "}
            — il décrit un déplacement dans une direction précise, ou des allers-retours
            selon le type.
          </p>
        </ProfileBlock>
      ) : null}

      {hasGovernment ? (
        <ProfileBlock
          title={
            profile.partOfSpeech === "verb"
              ? "Conjugaison et constructions"
              : profile.partOfSpeech === "noun"
                ? "Déclinaison et emplois"
                : "Emplois grammaticaux"
          }
        >
          <ul className="list-disc space-y-1.5 pl-5">
            {profile.government.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </ProfileBlock>
      ) : null}

      {hasSemanticCategory ? (
        <ProfileBlock title="Sens">
          <p>{profile.semanticCategory}</p>
        </ProfileBlock>
      ) : null}

      {hasRegister ? (
        <ProfileBlock title="Registre">
          <p>{profile.register}</p>
        </ProfileBlock>
      ) : null}

      {hasNotes ? (
        <ProfileBlock title="À retenir">
          <p>{profile.notes}</p>
        </ProfileBlock>
      ) : null}
    </section>
  );
}
