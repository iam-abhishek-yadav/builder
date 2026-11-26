import Link from "next/link";
import { Suspense } from "react";
import { Rocket } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { HeaderAuth } from "@/components/auth/header-auth";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Rocket className="size-5" />
          Builder One Stop
        </Link>
        <nav className="flex items-center gap-1 text-sm text-muted-foreground">
          <Link href="/" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            Launchpad
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/launch" className={buttonVariants({ size: "sm" })}>
            Launch
          </Link>
          {/* Reading auth needs request data, so it sits behind Suspense (Cache Components). */}
          <Suspense fallback={<Skeleton className="size-8 rounded-full" />}>
            <HeaderAuthServer />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

async function HeaderAuthServer() {
  const { userId } = await auth();
  return <HeaderAuth serverSignedIn={Boolean(userId)} />;
}
