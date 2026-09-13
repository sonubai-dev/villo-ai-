import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth/auth-provider";

export const metadata: Metadata = {
  title: "Vilo AI — Turn ideas, images and documents into AI videos",
  description:
    "Create realistic AI presenter videos from images, presentations, documents, and scripts. The intuitive AI video creation operating system for creators and businesses.",
  keywords: [
    "AI Video Generator",
    "AI Avatars",
    "Talking Avatar",
    "Lip-sync AI",
    "Image to Video",
    "Presentation to Video",
    "AI Video Editor",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
