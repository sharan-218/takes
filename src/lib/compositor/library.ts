export type LibraryKind = "video" | "image";

export interface LibraryAsset {
  key: string;
  kind: LibraryKind;
  url: string;
  durationMs?: number;
  width: number;
  height: number;
  tags: string[];
  credit: string;
}

export interface LibraryEntry {
  castLockId: string;
  label: string;
  assets: LibraryAsset[];
}

export const LIBRARY: LibraryEntry[] = [
  {
    castLockId: "lock_kitchen_serum",
    label: "Kitchen · Glow Serum",
    assets: [
      { key: "kitchen-serenity-1", kind: "video", url: "/library/kitchen-cast/serum-1.mp4", durationMs: 6000, width: 1080, height: 1920, tags: ["talking-head", "cinematic", "9x16"], credit: "Pexels · CC0" },
      { key: "kitchen-serenity-2", kind: "video", url: "/library/kitchen-cast/serum-2.mp4", durationMs: 6000, width: 1080, height: 1920, tags: ["demo", "fast-cut", "9x16"], credit: "Pexels · CC0" },
      { key: "kitchen-serenity-3", kind: "video", url: "/library/kitchen-cast/serum-3.mp4", durationMs: 6000, width: 1080, height: 1920, tags: ["pov", "asmr", "9x16"], credit: "Pexels · CC0" },
      { key: "kitchen-serenity-4", kind: "video", url: "/library/kitchen-cast/serum-4.mp4", durationMs: 6000, width: 1080, height: 1920, tags: ["unboxing", "testimonial", "9x16"], credit: "Pexels · CC0" },
    ],
  },
  {
    castLockId: "lock_street_sneaker",
    label: "Street · Sneaker Drop",
    assets: [
      { key: "street-sneaker-1", kind: "video", url: "/library/street-cast/sneaker-1.mp4", durationMs: 6000, width: 1080, height: 1920, tags: ["fast-cut", "9x16"], credit: "Pexels · CC0" },
      { key: "street-sneaker-2", kind: "video", url: "/library/street-cast/sneaker-2.mp4", durationMs: 6000, width: 1080, height: 1920, tags: ["pov", "9x16"], credit: "Pexels · CC0" },
      { key: "street-sneaker-3", kind: "video", url: "/library/street-cast/sneaker-3.mp4", durationMs: 6000, width: 1080, height: 1920, tags: ["cinematic", "9x16"], credit: "Pexels · CC0" },
      { key: "street-sneaker-4", kind: "video", url: "/library/street-cast/sneaker-4.mp4", durationMs: 6000, width: 1080, height: 1920, tags: ["demo", "9x16"], credit: "Pexels · CC0" },
    ],
  },
  {
    castLockId: "lock_studio_tech",
    label: "Studio · Earbuds Pro",
    assets: [
      { key: "studio-tech-1", kind: "video", url: "/library/studio-cast/tech-1.mp4", durationMs: 6000, width: 1080, height: 1920, tags: ["cinematic", "9x16"], credit: "Pexels · CC0" },
      { key: "studio-tech-2", kind: "video", url: "/library/studio-cast/tech-2.mp4", durationMs: 6000, width: 1080, height: 1920, tags: ["demo", "9x16"], credit: "Pexels · CC0" },
      { key: "studio-tech-3", kind: "video", url: "/library/studio-cast/tech-3.mp4", durationMs: 6000, width: 1080, height: 1920, tags: ["testimonial", "9x16"], credit: "Pexels · CC0" },
      { key: "studio-tech-4", kind: "video", url: "/library/studio-cast/tech-4.mp4", durationMs: 6000, width: 1080, height: 1920, tags: ["unboxing", "9x16"], credit: "Pexels · CC0" },
    ],
  },
];

export function findLibraryEntry(castLockId: string): LibraryEntry | undefined {
  return LIBRARY.find((l) => l.castLockId === castLockId);
}

export function pickAssetFor(entry: LibraryEntry | undefined, tags: string[]): LibraryAsset | undefined {
  if (!entry || entry.assets.length === 0) return undefined;
  let best: LibraryAsset | undefined;
  let bestScore = -1;
  for (const a of entry.assets) {
    const overlap = a.tags.filter((t) => tags.includes(t)).length;
    if (overlap > bestScore) {
      bestScore = overlap;
      best = a;
    }
  }
  return best ?? entry.assets[0];
}
