import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QueryViz AI — Conversational Business Intelligence",
  description: "Turn natural language into instant interactive dashboards powered by AI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ height: "100%" }}>
      <body style={{ height: "100%", margin: 0, overflow: "hidden" }}>{children}</body>
    </html>
  );
}
