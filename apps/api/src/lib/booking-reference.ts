const REFERENCE_PREFIX = "BSL";
const REFERENCE_LENGTH = 5;
// No 0/O or 1/I so a reference read aloud is unambiguous.
const REFERENCE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

/**
 * Generates a human-friendly booking reference such as `BSL-4F9K2`.
 * @returns a new random reference
 */
export function generateBookingReference(): string {
  let suffix = "";
  for (let index = 0; index < REFERENCE_LENGTH; index += 1) {
    suffix += REFERENCE_ALPHABET[Math.floor(Math.random() * REFERENCE_ALPHABET.length)];
  }
  return `${REFERENCE_PREFIX}-${suffix}`;
}
