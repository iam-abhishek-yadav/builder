import Link from "next/link";

export default function LaunchNotFound() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-20 sm:px-8">
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        Launch not found
      </h1>
      <p className="mt-2 text-muted-foreground">
        That project is not on Launchpad.
      </p>
      <Link href="/launchpad" className="mt-6 inline-block text-sm font-medium underline">
        Back to this week
      </Link>
    </main>
  );
}
