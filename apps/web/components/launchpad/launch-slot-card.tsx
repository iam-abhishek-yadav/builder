import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LaunchSlotCard({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <div className="my-2 rounded-2xl bg-linear-to-b from-[#f3ddd4] via-[#f6e6dc] to-[#f3f1eb] px-6 py-10 text-center">
      <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
        Open slot
      </p>
      <p className="font-display mt-3 text-2xl font-semibold tracking-tight">
        Put your project on this week’s board
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        One launch per week. Upvotes, comments, and offers to buy — in public.
      </p>
      <Button
        variant="outline"
        className="mt-6 h-9 border-[#0b1c30] bg-background px-4"
        nativeButton={false}
        render={<Link href={href} />}
      >
        {label}
        <ArrowRight data-icon="inline-end" />
      </Button>
    </div>
  );
}
