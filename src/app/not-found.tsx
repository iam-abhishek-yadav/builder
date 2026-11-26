import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="space-y-3 px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold">Not found</h1>
      <p className="text-muted-foreground">That page doesn&apos;t exist (or hasn&apos;t launched yet).</p>
      <Link href="/" className={buttonVariants({ variant: "outline" })}>
        Back home
      </Link>
    </div>
  );
}
