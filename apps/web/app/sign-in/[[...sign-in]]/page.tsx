import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import {
  AuthSplitLayout,
  clerkAuthAppearance,
} from "@/components/auth/auth-split-layout";

export const metadata: Metadata = {
  title: "Log in | Builder",
  description: "Log in to write recruiter outreach from your resume.",
};

export default function SignInPage() {
  return (
    <AuthSplitLayout
      title="Welcome back"
      subtitle="Log in to keep writing personalized recruiter emails from your resume."
    >
      <SignIn
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/outreach"
        appearance={clerkAuthAppearance}
      />
    </AuthSplitLayout>
  );
}
