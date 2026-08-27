const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export type LaunchWeek = {
  start: string;
  end: string;
  year: number;
  week: number;
  href: string;
  label: string;
  range: string;
  isCurrent: boolean;
};

function utcDate(isoDate: string) {
  return new Date(`${isoDate}T00:00:00.000Z`);
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addUtcDays(isoDate: string, days: number) {
  const date = utcDate(isoDate);
  date.setUTCDate(date.getUTCDate() + days);
  return toIsoDate(date);
}

function formatUtcDay(isoDate: string) {
  const date = utcDate(isoDate);
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}`;
}

export function currentWeekStart(now = new Date()) {
  const date = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const day = date.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setUTCDate(date.getUTCDate() + diff);
  return toIsoDate(date);
}

function mondayFromIsoWeek(year: number, week: number) {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const monday = new Date(jan4);
  monday.setUTCDate(jan4.getUTCDate() - (jan4Day - 1) + (week - 1) * 7);
  return toIsoDate(monday);
}

function isoWeekFromMonday(start: string) {
  const monday = utcDate(start);
  const thursday = new Date(monday);
  thursday.setUTCDate(thursday.getUTCDate() + 3);
  const year = thursday.getUTCFullYear();
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const week1Monday = new Date(jan4);
  week1Monday.setUTCDate(jan4.getUTCDate() - (jan4Day - 1));
  const week =
    Math.round((monday.getTime() - week1Monday.getTime()) / 604800000) + 1;
  return { year, week };
}

export function weekStartFromDate(isoDate: string) {
  const date = utcDate(isoDate);
  const day = date.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setUTCDate(date.getUTCDate() + diff);
  return toIsoDate(date);
}

export function parseWeekParam(value?: string | null) {
  if (!value) {
    return currentWeekStart();
  }
  const match = /^(\d{4})-W(\d{1,2})$/i.exec(value.trim());
  if (match) {
    const year = Number(match[1]);
    const week = Number(match[2]);
    if (week >= 1 && week <= 53) {
      return mondayFromIsoWeek(year, week);
    }
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return weekStartFromDate(value);
  }
  return currentWeekStart();
}

export function getLaunchWeek(start = currentWeekStart()): LaunchWeek {
  const current = currentWeekStart();
  const clamped = start > current ? current : start;
  const { year, week } = isoWeekFromMonday(clamped);
  const end = addUtcDays(clamped, 6);
  const padded = String(week).padStart(2, "0");
  return {
    start: clamped,
    end,
    year,
    week,
    href: `/launchpad?week=${year}-W${padded}`,
    label: `Week ${week}`,
    range: `${formatUtcDay(clamped)} – ${formatUtcDay(end)}`,
    isCurrent: clamped === current,
  };
}

export function adjacentWeeks(week: LaunchWeek) {
  const previous = getLaunchWeek(addUtcDays(week.start, -7));
  const next = week.isCurrent ? null : getLaunchWeek(addUtcDays(week.start, 7));
  return { previous, next };
}
