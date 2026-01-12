import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portfolio Game | Interactive 2D Portfolio",
  description: "Explore my portfolio in a Pokemon-style 2D game world! Navigate through buildings to discover my biodata, experience, projects, and contact information.",
  keywords: ["portfolio", "game", "developer", "interactive", "2D"],
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
