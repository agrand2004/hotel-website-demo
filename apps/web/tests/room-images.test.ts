import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";
import { roomImageSrcSet } from "../src/lib/room-images";

const ROOM_SLUGS = [
  "cosy-single", "courtyard-single", "classic-double", "superior-double", "rhine-view-double",
  "twin-room", "family-room", "family-suite", "junior-suite", "rhine-penthouse-suite",
];

test("every seeded room has its responsive WebP photos", () => {
  for (const slug of ROOM_SLUGS) {
    const src = `/rooms/${slug}-1200.webp`;
    const sources = roomImageSrcSet(src);
    assert.ok(sources);
    assert.ok(existsSync(new URL(`../public${src}`, import.meta.url)));
    for (const candidate of sources.split(", ")) {
      assert.ok(existsSync(new URL(`../public${candidate.split(" ")[0]}`, import.meta.url)));
    }
  }
});

test("legacy image URLs get no srcset", () => {
  assert.equal(roomImageSrcSet("/rooms/classic-double.jpg"), undefined);
});
