import { cn } from "@/lib/utils";

/** Page-width wrapper. `narrow` is for reading-width content (forms, articles). */
export function Container({
  className,
  narrow,
  ...props
}: React.ComponentProps<"div"> & { narrow?: boolean }) {
  return (
    <div
      className={cn("mx-auto w-full px-4 sm:px-6", narrow ? "max-w-3xl" : "max-w-6xl", className)}
      {...props}
    />
  );
}

/** Small uppercase mono label used above section headings. */
export function Eyebrow({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn("font-mono text-xs font-medium tracking-widest text-brand uppercase", className)}
      {...props}
    />
  );
}
