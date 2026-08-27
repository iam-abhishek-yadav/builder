import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/shell/app-shell";

export default function ProfileNotFound() {
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-3xl py-10">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Profile not found
        </h1>
        <p className="mt-2 text-muted-foreground">
          That profile id does not match an account.
        </p>
        <Button
          className="mt-6"
          nativeButton={false}
          render={<Link href="/launchpad" />}
        >
          Back to Launchpad
        </Button>
      </div>
    </AppShell>
  );
}
