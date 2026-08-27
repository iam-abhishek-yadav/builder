import { cn } from "@/lib/utils";

const COLORS = [
  "bg-[#0b1c30] text-white",
  "bg-[#1a56db] text-white",
  "bg-[#345c4a] text-white",
  "bg-[#6b3f2a] text-white",
  "bg-[#d3e4fe] text-[#0b1c30]",
  "bg-[#c5ddd0] text-[#0b1c30]",
  "bg-[#e8d4c4] text-[#0b1c30]",
  "bg-[#d4c8e8] text-[#0b1c30]",
];

function logoClass(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  const compact = name.replace(/[^A-Za-z0-9]/g, "");
  return (compact.slice(0, 2) || name.trim().slice(0, 2) || "?").toUpperCase();
}

export function LaunchLogo({
  name,
  size = "md",
}: {
  name: string;
  size?: "md" | "lg";
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl font-semibold tracking-tight",
        size === "lg" ? "size-16 text-xl" : "size-14 text-[0.95rem]",
        logoClass(name),
      )}
    >
      {initials(name)}
    </div>
  );
}
