import Link from "next/link";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { HeaderAuth } from "@/components/auth/header-auth";
import { Container } from "@/components/container";
import { Logo } from "@/components/logo";
import { NavLinks, NavLinksStatic } from "@/components/nav-links";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      <Container className="flex h-14 items-center gap-6">
        <Logo />
        <nav className="flex items-center gap-0.5" aria-label="Main">
          <Suspense fallback={<NavLinksStatic />}>
            <NavLinks />
          </Suspense>
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
      </Container>
    </header>
  );
}

async function HeaderAuthServer() {
  const { userId } = await auth();
  return <HeaderAuth serverSignedIn={Boolean(userId)} />;
}
