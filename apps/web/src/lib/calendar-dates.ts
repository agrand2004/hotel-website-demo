const DAY_MS = 86_400_000;

export function isCalendarDate(value: string | undefined): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

/** Validation for editable ISO date fields without the browser's native picker. */
export function dateInputError(value: string, min: string, max = "9999-12-31"): string {
  if (!value) return ""; // The required attribute handles empty inputs.
  if (!isCalendarDate(value)) return "Enter a valid date in YYYY-MM-DD format.";
  if (value < min) return `Choose a date on or after ${min}.`;
  if (value > max) return `Choose a date on or before ${max}.`;
  return "";
}

export function addDays(value: string, days: number): string {
  return new Date(Date.parse(`${value}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);
}

/** Keep the day when possible; January 31 advances to the last day of February. */
export function addMonths(value: string, months: number): string {
  const date = new Date(`${value}T00:00:00Z`);
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + months);
  const end = new Date(date);
  end.setUTCMonth(end.getUTCMonth() + 1, 0);
  date.setUTCDate(Math.min(day, end.getUTCDate()));
  return date.toISOString().slice(0, 10);
}

export function mondayIndex(value: string): number {
  return (new Date(`${value}T00:00:00Z`).getUTCDay() + 6) % 7;
}

export function calendarDays(value: string): string[] {
  const first = `${value.slice(0, 7)}-01`;
  const start = addDays(first, -mondayIndex(first));
  return Array.from({ length: 42 }, (_, index) => addDays(start, index));
}

export function stayNights(checkIn: string, checkOut: string): number {
  return (Date.parse(`${checkOut}T00:00:00Z`) - Date.parse(`${checkIn}T00:00:00Z`)) / DAY_MS;
}
