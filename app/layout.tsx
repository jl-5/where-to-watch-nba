import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Where to Watch NBA Games",
  description:
    "Browse the 2025-26 nationally televised NBA schedule with team, network, and timezone filters.",
  icons: {
    icon: "https://a.espncdn.com/i/teamlogos/leagues/500/nba.png",
    shortcut: "https://a.espncdn.com/i/teamlogos/leagues/500/nba.png",
    apple: "https://a.espncdn.com/i/teamlogos/leagues/500/nba.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
