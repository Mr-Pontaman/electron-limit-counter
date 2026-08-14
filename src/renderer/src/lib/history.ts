import type { DailyHistory, HistoryEntry } from "../../../shared/types";

export type YearMonth = {
  year: number;
  month: number;
};

export type ChartDatum = {
  date: string;
  count: number;
  limit: number;
  exceeded: boolean;
};

export const formatDate = (dateStr: string): string => {
  const [, month, day] = dateStr.split("-");
  return `${Number(month)}/${Number(day)}`;
};

export const buildMonthDates = (year: number, month: number): string[] => {
  const daysInMonth = new Date(year, month, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  });
};

export const shiftMonth = (year: number, month: number, delta: number): YearMonth => {
  const totalMonths = year * 12 + (month - 1) + delta;
  return {
    year: Math.floor(totalMonths / 12),
    month: (totalMonths % 12) + 1
  };
};

export const toCurrentMonth = (now = new Date()): YearMonth => ({
  year: now.getFullYear(),
  month: now.getMonth() + 1
});

export const toLatestMonth = (history: DailyHistory): YearMonth => {
  const dates = Object.keys(history).sort();
  if (dates.length === 0) return toCurrentMonth();
  const [year, month] = dates[dates.length - 1].split("-").map(Number);
  return { year, month };
};

export const canGoNextMonth = (year: number, month: number, now = new Date()): boolean =>
  year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1);

export const isCurrentMonth = (year: number, month: number, now = new Date()): boolean =>
  year === now.getFullYear() && month === now.getMonth() + 1;

export const formatMonthLabel = (year: number, month: number, locale: string): string =>
  new Intl.DateTimeFormat(locale, { year: "numeric", month: "long" }).format(
    new Date(year, month - 1)
  );

export const collectItemNames = (history: DailyHistory): string[] => [
  ...new Set(Object.values(history).flatMap((entries) => entries.map((entry) => entry.name)))
];

export const buildChartData = (
  history: DailyHistory,
  itemName: string,
  monthDates: string[]
): ChartDatum[] =>
  monthDates.map((date) => {
    const entry = history[date]?.find((item) => item.name === itemName);
    const count = entry?.count ?? 0;
    const limit = entry?.limit ?? 0;
    return {
      date: formatDate(date),
      count,
      limit,
      exceeded: limit > 0 && count > limit
    };
  });

export const getLatestLimit = (
  history: DailyHistory,
  itemName: string,
  allDates: string[]
): number =>
  allDates
    .map((date) => history[date]?.find((entry) => entry.name === itemName))
    .filter((entry): entry is HistoryEntry => Boolean(entry))
    .at(-1)?.limit ?? 0;
