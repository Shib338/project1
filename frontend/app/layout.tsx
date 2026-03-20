import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QueryViz AI — Conversational Business Intelligence",
  description: "Turn natural language into instant interactive dashboards powered by AI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
