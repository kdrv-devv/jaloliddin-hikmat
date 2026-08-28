const MONTHS = [
  "yanvar",
  "fevral",
  "mart",
  "aprel",
  "may",
  "iyun",
  "iyul",
  "avgust",
  "sentabr",
  "oktabr",
  "noyabr",
  "dekabr",
];

/** "14-avgust, 2026" */
export function formatDate(value: string | Date | null): string {
  if (!value) return "sanasiz";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "sanasiz";
  return `${date.getDate()}-${MONTHS[date.getMonth()]}, ${date.getFullYear()}`;
}

/** "14-avgust" — used where the year is already implied by the grouping. */
export function formatDayMonth(value: string | Date | null): string {
  if (!value) return "sanasiz";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "sanasiz";
  return `${date.getDate()}-${MONTHS[date.getMonth()]}`;
}

export function toDateInputValue(value: string | Date | null): string {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

/** Uzbek prose reads at roughly 180 words per minute. */
export function readingMinutes(markdown: string): number {
  const words = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*_\-\[\]()!`]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** 1234 -> "1 234" (uzilmaydigan probel bilan). */
export function formatCount(value: number): string {
  return Math.max(0, Math.round(value))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, "\u00A0");
}

export function viewsLabel(count: number): string {
  return `${formatCount(count)} ko’rish`;
}

export function readingLabel(minutes: number): string {
  return `${minutes} daqiqa o’qish`;
}
