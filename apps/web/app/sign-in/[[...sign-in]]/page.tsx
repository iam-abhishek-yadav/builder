import type { Metadata } from "next";
import Link from "next/link";
import { SignIn } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Log in | Builder",
  description: "Log in to Builder.",
};

export default function SignInPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-12">
      <Link
        href="/"
        className="font-display mb-8 text-2xl font-bold tracking-tight text-foreground"
      >
        Builder
      </Link>
      <SignIn
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/"
      />
    </main>
  );
}
