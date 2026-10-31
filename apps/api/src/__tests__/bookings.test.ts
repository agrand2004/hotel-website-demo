import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "../app";
import { prisma } from "../db";
import { sendBookingConfirmationEmail } from "../email/booking-confirmation.sender";

vi.mock("../email/booking-confirmation.sender", () => ({
  sendBookingConfirmationEmail: vi.fn(),
}));

const sendEmail = vi.mocked(sendBookingConfirmationEmail);

const STAY = { checkIn: "2030-06-10", checkOut: "2030-06-13", adults: 2 };
const GUEST = { guestName: "Ada Test", guestEmail: "ada@example.test", guestPhone: "+41 00 000 00 00" };

let roomId = "";

async function postJson(path: string, body?: unknown) {
  return app.request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

async function createBooking() {
  return postJson("/api/bookings", { roomId, ...STAY, ...GUEST });
}

describe("bookings API (requires the seeded database)", () => {
  beforeAll(async () => {
    const room = await prisma.room.findFirstOrThrow({ where: { capacity: { gte: 2 } } });
    roomId = room.id;
  });

  beforeEach(async () => {
    sendEmail.mockReset();
    sendEmail.mockResolvedValue(true);
    await prisma.booking.deleteMany({ where: { checkIn: new Date("2030-06-10T00:00:00Z") } });
  });

  afterAll(async () => {
    await prisma.booking.deleteMany({ where: { checkIn: new Date("2030-06-10T00:00:00Z") } });
    await prisma.$disconnect();
  });

  it("creates a pending booking with the total price", async () => {
    const response = await createBooking();
    const { booking } = await response.json();
    expect(response.status).toBe(201);
    expect(booking.status).toBe("pending");
    expect(booking.nights).toBe(3);
    expect(booking.totalPrice).toBe(3 * booking.room.pricePerNight);
    expect(booking.reference).toMatch(/^BSL-[A-Z0-9]{5}$/);
  });

  it("hides a held room from the search and rejects a second booking", async () => {
    await createBooking();
    const search = await app.request(`/api/rooms?checkIn=${STAY.checkIn}&checkOut=${STAY.checkOut}&adults=2`);
    const { rooms } = await search.json();
    expect(rooms.map((room: { id: string }) => room.id)).not.toContain(roomId);
    const second = await createBooking();
    expect(second.status).toBe(409);
  });

  it("frees the room again once the hold has expired", async () => {
    const { booking } = await (await createBooking()).json();
    await prisma.booking.update({ where: { id: booking.id }, data: { holdUntil: new Date(Date.now() - 1000) } });
    const confirm = await postJson(`/api/bookings/${booking.id}/confirm`);
    expect(confirm.status).toBe(409);
    expect((await createBooking()).status).toBe(201);
  });

  it("confirms a pending booking", async () => {
    const { booking } = await (await createBooking()).json();
    const confirm = await postJson(`/api/bookings/${booking.id}/confirm`);
    const body = await confirm.json();
    expect(confirm.status).toBe(200);
    expect(body.booking.status).toBe("confirmed");
  });

  it("sends the confirmation email once and records it", async () => {
    const { booking } = await (await createBooking()).json();
    const confirm = await postJson(`/api/bookings/${booking.id}/confirm`);
    const body = await confirm.json();
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(sendEmail.mock.calls[0]?.[0]).toMatchObject({ id: booking.id, guestEmail: GUEST.guestEmail, status: "confirmed" });
    expect(body.booking.confirmationEmailSent).toBe(true);
    await postJson(`/api/bookings/${booking.id}/confirm`);
    expect(sendEmail).toHaveBeenCalledTimes(1);
  });

  it("still confirms the booking when the email cannot be sent", async () => {
    sendEmail.mockResolvedValue(false);
    const { booking } = await (await createBooking()).json();
    const confirm = await postJson(`/api/bookings/${booking.id}/confirm`);
    const body = await confirm.json();
    expect(confirm.status).toBe(200);
    expect(body.booking.status).toBe("confirmed");
    expect(body.booking.confirmationEmailSent).toBe(false);
  });

  it("does not send an email for a booking that is not confirmed", async () => {
    await createBooking();
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("rejects a stay where check-out is not after check-in", async () => {
    const response = await postJson("/api/bookings", { roomId, ...STAY, checkOut: STAY.checkIn, ...GUEST });
    expect(response.status).toBe(400);
  });
});
