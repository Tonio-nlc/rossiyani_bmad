import { ArrowLeftRight, Pencil } from "lucide-react";
import Link from "next/link";

const PAGE_CONTAINER_STYLE = {
  minHeight: "100vh",
  backgroundColor: "#F0FAF4",
  padding: "48px 24px",
  maxWidth: "900px",
  margin: "0 auto",
} as const;

const TITLE_STYLE = {
  fontSize: "2rem",
  fontWeight: "700",
  color: "#1C1C1A",
  marginBottom: "8px",
} as const;

const SUBTITLE_STYLE = {
  fontSize: "1rem",
  color: "#6B6B67",
  marginBottom: "48px",
} as const;

const GRID_STYLE = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: "24px",
  maxWidth: "900px",
} as const;

const CARD_STYLE = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E5E3DC",
  borderRadius: "12px",
  padding: "32px",
  cursor: "pointer",
  display: "block",
  textDecoration: "none",
} as const;

const ICON_STYLE = {
  width: "24px",
  height: "24px",
  color: "#1E3A5F",
  marginBottom: "16px",
} as const;

const CARD_TITLE_STYLE = {
  fontSize: "1.125rem",
  fontWeight: "600",
  color: "#1C1C1A",
  marginBottom: "8px",
} as const;

const CARD_DESCRIPTION_STYLE = {
  fontSize: "0.875rem",
  color: "#6B6B67",
  marginBottom: "24px",
  lineHeight: "1.5",
} as const;

const CARD_LINK_STYLE = {
  fontSize: "0.875rem",
  color: "#1E3A5F",
  textDecoration: "none",
} as const;

const PRACTICE_MODES = [
  {
    href: "/practice/sentence-builder",
    icon: Pencil,
    title: "Constructeur de phrases",
    description:
      "Composez une phrase en russe. Rossiyani analyse votre grammaire en contexte.",
  },
  {
    href: "/practice/context-translation",
    icon: ArrowLeftRight,
    title: "Traduction contextualisée",
    description:
      "Traduisez le sens, pas les mots. Pensez comme un locuteur natif.",
  },
] as const;

export default function PracticePage() {
  return (
    <div style={PAGE_CONTAINER_STYLE}>
      <h1 style={TITLE_STYLE}>Pratique</h1>
      <p style={SUBTITLE_STYLE}>Renforcez ce que vous avez lu.</p>

      <div style={GRID_STYLE}>
        {PRACTICE_MODES.map((mode) => (
          <Link key={mode.href} href={mode.href} style={CARD_STYLE}>
            <mode.icon style={ICON_STYLE} aria-hidden="true" />
            <h2 style={CARD_TITLE_STYLE}>{mode.title}</h2>
            <p style={CARD_DESCRIPTION_STYLE}>{mode.description}</p>
            <span style={CARD_LINK_STYLE}>Ouvrir →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
