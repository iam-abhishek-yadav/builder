import type { Metadata } from "next";
import { Hanken_Grotesk, Source_Serif_4 } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Builder — Your Career, All in One Place",
  description:
    "Build stunning profiles, high-conversion resumes, and beautiful portfolios designed to land your dream role.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(hanken.variable, sourceSerif.variable, "h-full")}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
