import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <div className="flex justify-center pt-10">
      <Suspense>
        <SignIn />
      </Suspense>
    </div>
  );
}
