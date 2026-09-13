import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Vilo AI — Programmatic AI Video Generation",
  description:
    "Create programmatic Remotion videos using AI without expensive voiceover APIs.",
  keywords: [
    "AI Video Generator",
    "Remotion",
    "Programmatic Video",
    "React Video",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className="min-h-screen bg-slate-950 text-slate-100 antialiased font-sans">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
