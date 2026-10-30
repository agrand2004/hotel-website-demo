const CHF_FORMAT = new Intl.NumberFormat("en-CH", { style: "currency", currency: "CHF", maximumFractionDigits: 0 });
const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

/**
 * Formats an amount of Swiss francs, e.g. `CHF 180`.
 * @param amount - whole francs
 * @returns the formatted price
 */
export function formatChf(amount: number): string {
  return CHF_FORMAT.format(amount);
}

/**
 * Formats a `YYYY-MM-DD` date for display, e.g. `Sat, 14 Nov 2026`.
 * @param isoDate - calendar date
 * @returns the human-readable date
 */
export function formatDate(isoDate: string): string {
  return DATE_FORMAT.format(new Date(`${isoDate}T00:00:00Z`));
}

/**
 * Returns a `YYYY-MM-DD` date shifted from today.
 * @param daysFromToday - number of days to add (may be negative)
 * @returns the shifted calendar date, in UTC
 */
export function isoDateFromToday(daysFromToday: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + daysFromToday);
  return date.toISOString().slice(0, 10);
}
