import { describe, expect, it } from "vitest";
import { countNights, parseIsoDate, toIsoDate } from "../lib/dates";

describe("dates", () => {
  it("counts nights between two dates", () => {
    const nights = countNights({
      checkIn: parseIsoDate("2026-11-14"),
      checkOut: parseIsoDate("2026-11-17"),
    });
    expect(nights).toBe(3);
  });

  it("round-trips an ISO date", () => {
    expect(toIsoDate(parseIsoDate("2026-02-28"))).toBe("2026-02-28");
  });

  it("rejects an impossible calendar date", () => {
    expect(() => parseIsoDate("2026-02-31")).toThrow();
  });
});
