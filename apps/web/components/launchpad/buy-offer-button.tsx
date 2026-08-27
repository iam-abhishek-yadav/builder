"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { submitBuyOfferAction } from "@/app/launchpad/actions";

export function BuyOfferButton({
  launchId,
  signedIn,
  offered,
  disabled,
}: {
  launchId: string;
  signedIn: boolean;
  offered: boolean;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(submitBuyOfferAction, null);

  useEffect(() => {
    if (state?.ok) {
      setOpen(false);
      router.refresh();
    }
  }, [router, state]);

  if (!signedIn) {
    return (
      <Button
        variant="outline"
        nativeButton={false}
        render={
          <a
            href={`/sign-in?redirect_url=${encodeURIComponent(`/launchpad/${launchId}`)}`}
          />
        }
      >
        Offer to buy
      </Button>
    );
  }

  if (offered) {
    return (
      <Button variant="secondary" type="button" disabled>
        Offer sent
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        Offer to buy
      </Button>
      <DialogContent className="sm:max-w-md">
        <form action={action}>
          <input type="hidden" name="launchId" value={launchId} />
          <DialogHeader>
            <DialogTitle>Offer to buy</DialogTitle>
            <DialogDescription>
              The maker sees your name and this note. No payment is processed
              here — it is a serious interest signal.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            name="note"
            className="mt-4 min-h-24"
            placeholder="Optional note — what you’d use it for, a range, a question."
          />
          {state?.error ? (
            <p className="mt-2 text-sm text-destructive">{state.error}</p>
          ) : null}
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={pending}>
              {pending ? "Sending…" : "Send offer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
