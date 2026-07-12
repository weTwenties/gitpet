import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GitPet — Your GitHub history, alive",
  description:
    "Turn public GitHub activity into a living pixel companion that evolves with how you build.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
