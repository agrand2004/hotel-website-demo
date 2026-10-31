import assert from "node:assert/strict";
import test from "node:test";
import { addDays, addMonths, calendarDays, dateInputError, isCalendarDate, mondayIndex, stayNights } from "../src/lib/calendar-dates";

test("calendar validation rejects impossible and malformed URL dates", () => {
  for (const invalid of [undefined, "", "2026-02-29", "2026-11-31", "2026-1-1", "hello"]) assert.equal(isCalendarDate(invalid), false);
  assert.equal(isCalendarDate("2028-02-29"), true);
});

test("manual date input validates real dates and the allowed stay interval", () => {
  const arrival = "2026-11-01";
  assert.equal(dateInputError("", arrival), "");
  for (const value of ["2026-1-1", "not-a-date", "2027-02-29", "2026-11-31", "2026-10-31"]) {
    assert.notEqual(dateInputError(value, arrival), "");
  }
  assert.equal(dateInputError(arrival, arrival), "");
  assert.equal(dateInputError("2028-02-29", arrival), "");
  assert.notEqual(dateInputError(arrival, addDays(arrival, 1)), "");
  assert.equal(dateInputError("2026-11-02", addDays(arrival, 1)), "");
  assert.notEqual(dateInputError("9999-12-31", arrival, "9999-12-30"), "");
});

test("day and night arithmetic crosses month, year and daylight-saving boundaries", () => {
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(addDays("2028-03-01", -1), "2028-02-29");
  assert.equal(addDays("2026-03-28", 2), "2026-03-30");
  assert.equal(stayNights("2026-03-28", "2026-03-30"), 2);
  assert.equal(stayNights("2026-10-24", "2026-10-26"), 2);
});

test("keyboard month navigation clamps end-of-month dates and handles years", () => {
  assert.equal(addMonths("2026-01-31", 1), "2026-02-28");
  assert.equal(addMonths("2028-01-31", 1), "2028-02-29");
  assert.equal(addMonths("2028-02-29", 12), "2029-02-28");
  assert.equal(addMonths("2027-01-15", -1), "2026-12-15");
});

test("every month gets a stable six-week Monday-first grid, including leap day", () => {
  for (const month of ["2026-02-01", "2026-03-01", "2026-11-01", "2028-02-29"]) {
    const days = calendarDays(month);
    assert.equal(days.length, 42);
    assert.equal(new Set(days).size, 42);
    assert.equal(mondayIndex(days[0]!), 0);
    assert.ok(days.includes(month));
    for (let index = 1; index < days.length; index++) assert.equal(days[index], addDays(days[index - 1]!, 1));
  }
  assert.ok(calendarDays("2028-02-01").includes("2028-02-29"));
});
