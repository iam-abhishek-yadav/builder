"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Show } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function GetStartedButton({
  children,
  className,
  size = "lg",
}: {
  children: ReactNode;
  className?: string;
  size?: "default" | "sm" | "lg";
}) {
  return (
    <>
      <Show when="signed-out">
        <Button
          size={size}
          nativeButton={false}
          render={<Link href="/sign-up" />}
          className={className}
        >
          {children}
        </Button>
      </Show>
      <Show when="signed-in">
        <Button
          size={size}
          nativeButton={false}
          render={<Link href="/outreach" />}
          className={className}
        >
          {children}
        </Button>
      </Show>
    </>
  );
}
