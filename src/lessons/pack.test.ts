import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  getLessonPackLessonPath,
  loadLessonPackManifest,
  validateLessonPackManifest,
} from "./pack.js";

describe("lesson packs", () => {
  it("validates lesson pack manifests", () => {
    expect(
      validateLessonPackManifest({
        version: 1,
        id: "home-row-pack",
        title: "Home Row Pack",
        lessons: [
          {
            day: 1,
            path: "day-1.json",
          },
        ],
      }),
    ).toEqual({
      version: 1,
      id: "home-row-pack",
      title: "Home Row Pack",
      lessons: [
        {
          day: 1,
          path: "day-1.json",
        },
      ],
    });
  });

  it("loads manifests and resolves lesson paths relative to the manifest", async () => {
    const directory = await mkdtemp(join(tmpdir(), "keyquest-pack-"));
    const manifestPath = join(directory, "keyquest-pack.json");
    await writeFile(
      manifestPath,
      JSON.stringify({
        version: 1,
        id: "custom-pack",
        title: "Custom Pack",
        lessons: [
          {
            day: 2,
            path: "lessons/day-2.json",
          },
        ],
      }),
      "utf8",
    );

    const manifest = await loadLessonPackManifest(manifestPath);

    expect(getLessonPackLessonPath(manifest, manifestPath, 2)).toBe(
      join(directory, "lessons/day-2.json"),
    );
  });

  it("rejects missing days", () => {
    const manifest = validateLessonPackManifest({
      version: 1,
      id: "custom-pack",
      title: "Custom Pack",
      lessons: [
        {
          day: 1,
          path: "day-1.json",
        },
      ],
    });

    expect(() => getLessonPackLessonPath(manifest, "/packs/keyquest-pack.json", 2)).toThrow(
      "does not include day 2",
    );
  });
});
