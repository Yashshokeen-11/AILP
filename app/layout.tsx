import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LearnAI - Personalized Learning Platform",
  description: "Master concepts from first principles with personalized AI teaching",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

