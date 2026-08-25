export function formatMonthYear(value: string) {
  const match = /^(\d{4})-(\d{2})/.exec(value.trim());
  if (!match) {
    return value.trim();
  }
  const date = new Date(Number(match[1]), Number(match[2]) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function formatDateRange(
  start: string,
  end: string,
  current = false,
) {
  const from = start ? formatMonthYear(start) : "";
  const to = current ? "Present" : end ? formatMonthYear(end) : "";
  if (from && to) {
    return `${from} – ${to}`;
  }
  return from || to;
}
