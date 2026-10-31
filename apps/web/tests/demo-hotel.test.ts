import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";
import { bookingSchema, roomSchema } from "@hotel/shared";
import data from "../src/data/demo-hotel.json";
import { ApiError } from "../src/lib/api-error";
import { createDemoHotel, DEMO_GUEST, DEMO_STORAGE_KEY } from "../src/lib/demo-hotel";
import { roomImageSrcSet } from "../src/lib/room-images";

const TODAY = Date.parse("2026-11-01T12:00:00Z");
const stay = { checkIn: "2026-11-21", checkOut: "2026-11-23", adults: 2 };
const request = { ...stay, roomId: "classic-double", ...DEMO_GUEST };
const hasCode = (code: string) => (error: unknown) => error instanceof ApiError && error.code === code;

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
  };
}

test("catalogue uses the existing Room contract, unique IDs and bundled photography", () => {
  const rooms = roomSchema.array().parse(data.rooms);
  assert.equal(rooms.length, 10);
  assert.equal(new Set(rooms.map((room) => room.id)).size, 10);
  for (const room of rooms) {
    assert.ok(existsSync(new URL(`../public${room.imageUrl}`, import.meta.url)));
    const sources = roomImageSrcSet(room.imageUrl);
    assert.ok(sources);
    for (const candidate of sources.split(", ")) {
      assert.ok(existsSync(new URL(`../public${candidate.split(" ")[0]}`, import.meta.url)));
    }
  }
  assert.equal(roomImageSrcSet("/rooms/classic-double.jpg"), undefined);
});

test("search filters guests and changes availability with the selected dates", () => {
  const hotel = createDemoHotel(undefined, () => TODAY);
  assert.equal(hotel.searchRooms({ ...stay, adults: "1" }).length, 10);
  assert.equal(hotel.searchRooms(stay).length, 8);
  assert.deepEqual(hotel.searchRooms({ ...stay, adults: 4 }).map((room) => room.id), ["family-room", "family-suite"]);
  assert.equal(hotel.searchRooms({ ...stay, adults: 6 }).length, 0);
  const busy = hotel.searchRooms({ checkIn: "2026-11-15", checkOut: "2026-11-17", adults: 2 });
  assert.equal(busy.length, 6);
  assert.ok(!busy.some((room) => room.id === "twin-room" || room.id === "family-suite"));
});

test("invalid, impossible and past stays are rejected before display or booking", () => {
  const hotel = createDemoHotel(undefined, () => TODAY);
  for (const invalid of [
    { checkIn: "no-date" }, { checkIn: "2027-02-29" }, { checkOut: "2026-11-31" },
    { checkIn: "2026-10-31" }, { checkOut: stay.checkIn }, { checkOut: "2026-11-20" },
    { adults: 0 }, { adults: 7 }, { adults: 1.5 }, { adults: "invalid" },
  ]) {
    assert.throws(() => hotel.searchRooms({ ...stay, ...invalid }), ApiError);
    assert.throws(() => hotel.createBooking({ ...request, ...invalid }), ApiError);
  }
  const leapStay = hotel.createBooking({ ...request, checkIn: "2028-02-28", checkOut: "2028-03-01" });
  assert.equal(leapStay.nights, 2);
});

test("review creates only a pending hold, with correct price; explicit confirmation survives reload", () => {
  const storage = memoryStorage();
  const hotel = createDemoHotel(storage, () => TODAY);
  const pending = bookingSchema.parse(hotel.createBooking(request));
  assert.equal(pending.status, "pending");
  assert.equal(pending.nights, 2);
  assert.equal(pending.totalPrice, 360);
  assert.equal(Date.parse(pending.holdUntil!), TODAY + 15 * 60_000);
  assert.match(pending.reference, /^DEMO-/);
  const reloaded = createDemoHotel(storage, () => TODAY);
  assert.equal(reloaded.getBooking(pending.id).status, "pending");
  const confirmed = reloaded.confirmBooking(pending.id);
  assert.equal(confirmed.status, "confirmed");
  assert.equal(confirmed.holdUntil, null);
  assert.deepEqual(reloaded.confirmBooking(pending.id), confirmed);
  assert.equal(createDemoHotel(storage, () => TODAY).getBooking(pending.id).status, "confirmed");
});

test("pending and confirmed bookings prevent overlap but allow same-day turnover", () => {
  const hotel = createDemoHotel(undefined, () => TODAY);
  const pending = hotel.createBooking(request);
  for (const phase of ["pending", "confirmed"]) {
    if (phase === "confirmed") hotel.confirmBooking(pending.id);
    assert.ok(!hotel.searchRooms(stay).some((room) => room.id === request.roomId));
    for (const interval of [
      stay,
      { checkIn: "2026-11-20", checkOut: "2026-11-22" },
      { checkIn: "2026-11-22", checkOut: "2026-11-24" },
      { checkIn: "2026-11-20", checkOut: "2026-11-24" },
    ]) assert.throws(() => hotel.createBooking({ ...request, ...interval }), hasCode("room_unavailable"));
  }
  assert.equal(hotel.createBooking({ ...request, checkIn: "2026-11-19", checkOut: stay.checkIn }).nights, 2);
  assert.equal(hotel.createBooking({ ...request, checkIn: stay.checkOut, checkOut: "2026-11-25" }).nights, 2);
});

test("expired holds release inventory and cannot be confirmed", () => {
  let time = TODAY;
  const storage = memoryStorage();
  const hotel = createDemoHotel(storage, () => time);
  const pending = hotel.createBooking(request);
  time += 15 * 60_000;
  assert.equal(hotel.getBooking(pending.id).status, "expired");
  assert.throws(() => hotel.confirmBooking(pending.id), hasCode("booking_hold_expired"));
  assert.ok(hotel.searchRooms(stay).some((room) => room.id === request.roomId));
  const reloaded = createDemoHotel(storage, () => time);
  assert.equal(reloaded.getBooking(pending.id).status, "expired");
  assert.equal(reloaded.createBooking(request).status, "pending");
});

test("direct links cannot bypass capacity, fixture occupancy or missing-room errors", () => {
  const hotel = createDemoHotel(undefined, () => TODAY);
  assert.throws(() => hotel.getRoom("missing", stay), hasCode("room_not_found"));
  assert.throws(() => hotel.getRoom("cosy-single", stay), hasCode("room_capacity_exceeded"));
  assert.throws(() => hotel.createBooking({ ...request, roomId: "cosy-single" }), hasCode("room_capacity_exceeded"));
  assert.throws(() => hotel.getRoom("twin-room", { ...stay, checkIn: "2026-11-15", checkOut: "2026-11-17" }), hasCode("room_unavailable"));
  assert.throws(() => hotel.getBooking("missing"), hasCode("booking_not_found"));
  assert.throws(() => hotel.confirmBooking("missing"), hasCode("booking_not_found"));
});

test("editable fictional guest details are validated, preserved and survive confirmation and reload", () => {
  const storage = memoryStorage();
  const hotel = createDemoHotel(storage, () => TODAY);
  for (const invalid of [{ guestName: "" }, { guestEmail: "not-an-email" }, { guestPhone: "" }]) {
    assert.throws(() => hotel.createBooking({ ...request, ...invalid }), hasCode("invalid_booking"));
  }
  assert.equal(storage.getItem(DEMO_STORAGE_KEY), null);
  const guest = { guestName: "Jamie Taylor (Demo)", guestEmail: "jamie.taylor@example.com", guestPhone: "+1 202-555-0198" };
  const booking = hotel.createBooking({ ...request, ...guest });
  assert.equal(booking.status, "pending");
  hotel.confirmBooking(booking.id);
  const reloaded = createDemoHotel(storage, () => TODAY).getBooking(booking.id);
  assert.equal(reloaded.status, "confirmed");
  for (const field of ["guestName", "guestEmail", "guestPhone"] as const) assert.equal(reloaded[field], guest[field]);
});

test("corrupt or disabled browser storage does not prevent a demonstration", () => {
  const storage = memoryStorage();
  for (const corrupt of ["not json", "{}", '[{"id":"incomplete"}]']) {
    storage.setItem(DEMO_STORAGE_KEY, corrupt);
    assert.equal(createDemoHotel(storage, () => TODAY).searchRooms(stay).length, 8);
  }
  const blockedStorage = {
    getItem: () => { throw new Error("Storage disabled"); },
    setItem: () => { throw new Error("Storage full"); },
  };
  const hotel = createDemoHotel(blockedStorage, () => TODAY);
  const pending = hotel.createBooking(request);
  assert.equal(hotel.confirmBooking(pending.id).status, "confirmed");
});
