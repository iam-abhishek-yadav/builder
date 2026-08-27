import Link from "next/link";
import { AppShell } from "@/components/shell/app-shell";

export default function LaunchNotFound() {
  return (
    <AppShell>
      <div className="py-10">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Launch not found
        </h1>
        <p className="mt-2 text-muted-foreground">
          That project is not on Launchpad.
        </p>
        <Link
          href="/launchpad"
          className="mt-6 inline-block text-sm font-medium underline"
        >
          Back to this week
        </Link>
      </div>
    </AppShell>
  );
}
