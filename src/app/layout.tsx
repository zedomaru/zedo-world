import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zaki's Portfolio",
  description: "Hi I'm Zaki, software engineer from Indonesia",
  keywords: ["portfolio", "game", "developer", "software engineer", "interactive", "2D"],
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
