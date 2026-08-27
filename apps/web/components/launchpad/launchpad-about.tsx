import { MessageSquare, Package, Rocket } from "lucide-react";

export function LaunchpadAbout() {
  return (
    <div className="rounded-2xl border border-[#0f6b45]/25 bg-[#d9f0e3]/35 p-5">
      <h2 className="font-medium tracking-tight">What is Launchpad?</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        A weekly board for projects. One launch per person, every week. The
        board resets Monday, 00:00 UTC.
      </p>
      <ul className="mt-4 grid gap-2.5 text-sm">
        <li className="flex items-start gap-2 text-foreground/90">
          <Rocket className="mt-0.5 size-4 shrink-0 text-[#0f6b45]" />
          Ship one project and get it in front of other builders
        </li>
        <li className="flex items-start gap-2 text-foreground/90">
          <MessageSquare className="mt-0.5 size-4 shrink-0 text-[#0f6b45]" />
          Collect comments and upvotes
        </li>
        <li className="flex items-start gap-2 text-foreground/90">
          <Package className="mt-0.5 size-4 shrink-0 text-[#0f6b45]" />
          Receive offers to buy — only you see who is serious
        </li>
      </ul>
    </div>
  );
}
