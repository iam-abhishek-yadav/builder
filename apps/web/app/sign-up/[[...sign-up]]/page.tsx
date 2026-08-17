import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import {
  AuthSplitLayout,
  clerkAuthAppearance,
} from "@/components/auth/auth-split-layout";

export const metadata: Metadata = {
  title: "Get started | Builder",
  description:
    "Create a Builder account to generate recruiter outreach from your resume.",
};

export default function SignUpPage() {
  return (
    <AuthSplitLayout
      title="Create your account"
      subtitle="Start turning job posts into send-ready recruiter emails."
    >
      <SignUp
        path="/sign-up"
        routing="path"
        signInUrl="/sign-in"
        fallbackRedirectUrl="/outreach"
        appearance={clerkAuthAppearance}
      />
    </AuthSplitLayout>
  );
}
