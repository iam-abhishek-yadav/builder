import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Sign up" };

export default function SignUpPage() {
  return (
    <div className="flex justify-center pt-10">
      <Suspense>
        <SignUp />
      </Suspense>
    </div>
  );
}
