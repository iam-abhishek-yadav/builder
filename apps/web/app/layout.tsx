import type { Metadata } from "next";
import { Hanken_Grotesk, Source_Serif_4 } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";
import { ClerkReady } from "@/components/auth/clerk-ready";
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
  title: "Builder — One-stop platform for builders",
  description:
    "Show up, get hired, launch what you ship, and practice for what is next — from fresher to staff+.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn(hanken.variable, sourceSerif.variable, "h-full")}
    >
      <body className="flex min-h-full flex-col font-sans antialiased">
        <ClerkProvider
          appearance={{
            theme: shadcn,
            variables: { colorBackground: "#f3f1eb" },
          }}
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
          signInFallbackRedirectUrl="/profile"
          signUpFallbackRedirectUrl="/profile"
        >
          <ClerkReady>{children}</ClerkReady>
        </ClerkProvider>
      </body>
    </html>
  );
}
