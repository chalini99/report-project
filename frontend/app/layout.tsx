import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Medical Insight AI",
  description: "AI-powered medical report analysis",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
