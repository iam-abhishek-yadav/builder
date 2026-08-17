import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";
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
  title: "Builder — Recruiter Outreach from Your Resume",
  description:
    "Paste a job description, use your saved resume, and generate a personalized recruiter cold email you can copy into your inbox.",
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
      <body className="flex min-h-full flex-col">
        <ClerkProvider
          appearance={{ theme: shadcn }}
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
          signInFallbackRedirectUrl="/outreach"
          signUpFallbackRedirectUrl="/outreach"
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
