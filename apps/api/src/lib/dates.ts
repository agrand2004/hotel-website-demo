const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Parses a `YYYY-MM-DD` string as a UTC midnight date.
 * @param value - calendar date
 * @returns the matching UTC date
 * @throws if the string is not a valid calendar date
 */
export function parseIsoDate(value: string): Date {
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error(`Invalid date: ${value}`);
  }
  return date;
}

/**
 * Formats a UTC date as `YYYY-MM-DD`.
 * @param date - date to format
 * @returns the calendar date string
 */
export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Counts the nights between check-in and check-out.
 * @param params.checkIn - arrival date
 * @param params.checkOut - departure date
 * @returns number of nights (0 or negative when the range is invalid)
 */
export function countNights(params: { checkIn: Date; checkOut: Date }): number {
  return Math.round((params.checkOut.getTime() - params.checkIn.getTime()) / MS_PER_DAY);
}
