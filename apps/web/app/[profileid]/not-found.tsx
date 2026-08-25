import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";

export default function ProfileNotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-20 sm:px-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Profile not found
        </h1>
        <p className="mt-2 text-muted-foreground">
          That profile id does not match an account.
        </p>
        <Button
          className="mt-6"
          nativeButton={false}
          render={<Link href="/" />}
        >
          Back home
        </Button>
      </main>
      <SiteFooter />
    </>
  );
}
