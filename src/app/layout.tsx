import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display, Noto_Serif } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});

const notoSerif = Noto_Serif({
  subsets: ["cyrillic"],
  weight: ["400", "700"],
  variable: "--font-russian",
});

export const metadata: Metadata = {
  title: {
    default: "Rossiyani",
    template: "%s · Rossiyani",
  },
  description:
    "Environnement de lecture intelligent pour apprendre le russe",
  applicationName: "Rossiyani",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-touch-icon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Rossiyani",
    title: "Rossiyani",
    description:
      "Environnement de lecture intelligent pour apprendre le russe",
  },
  twitter: {
    card: "summary",
    title: "Rossiyani",
    description:
      "Environnement de lecture intelligent pour apprendre le russe",
  },
  appleWebApp: {
    capable: true,
    title: "Rossiyani",
    statusBarStyle: "default",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${dmSans.variable} ${dmSerifDisplay.variable} ${notoSerif.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
