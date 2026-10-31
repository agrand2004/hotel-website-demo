import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

// Fictitious rooms of the fictitious "Hotel Rheinblick", Basel.
const ROOMS = [
  { name: "Cosy Single", type: "Single", capacity: 1, pricePerNight: 120, description: "A quiet single room facing the courtyard." },
  { name: "Courtyard Single", type: "Single", capacity: 1, pricePerNight: 135, description: "Single room with a writing desk and garden view." },
  { name: "Classic Double", type: "Double", capacity: 2, pricePerNight: 180, description: "Queen bed, rain shower and a view over the old town." },
  { name: "Superior Double", type: "Double", capacity: 2, pricePerNight: 210, description: "Spacious double with a reading corner." },
  { name: "Rhine View Double", type: "Double", capacity: 2, pricePerNight: 240, description: "Double room with a balcony over the Rhine." },
  { name: "Twin Room", type: "Twin", capacity: 2, pricePerNight: 170, description: "Two single beds, ideal for colleagues and friends." },
  { name: "Family Room", type: "Family", capacity: 4, pricePerNight: 290, description: "Two connected sleeping areas for up to four guests." },
  { name: "Family Suite", type: "Family", capacity: 4, pricePerNight: 340, description: "Lounge, two bedrooms and a bathtub." },
  { name: "Junior Suite", type: "Suite", capacity: 2, pricePerNight: 320, description: "Lounge area and a king-size bed." },
  { name: "Rhine Penthouse Suite", type: "Suite", capacity: 3, pricePerNight: 450, description: "Top-floor suite with a private terrace." },
] as const;

/**
 * Builds the URL of a room photo served by the web app from `apps/web/public/rooms/`.
 * @param roomName - room name, e.g. `Cosy Single`
 * @returns the public path, e.g. `/rooms/cosy-single.jpg`
 */
function roomImageUrl(roomName: string): string {
  return `/rooms/${roomName.toLowerCase().replaceAll(" ", "-")}.jpg`;
}

async function main() {
  await prisma.booking.deleteMany();
  await prisma.room.deleteMany();
  for (const room of ROOMS) {
    await prisma.room.create({ data: { ...room, imageUrl: roomImageUrl(room.name) } });
  }
  console.log(`Seeded ${ROOMS.length} rooms.`);
}

main().finally(() => prisma.$disconnect());
