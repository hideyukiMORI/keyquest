import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { createSaveStore } from "./store.js";

const tempDirectories: string[] = [];

describe("createSaveStore", () => {
  afterEach(async () => {
    await Promise.all(tempDirectories.splice(0).map((path) => rm(path, { recursive: true })));
  });

  it("creates tamper-friction normal saves", async () => {
    const directory = await createTempDirectory();
    const store = createSaveStore({ mode: "normal", directory });
    const save = await store.loadOrCreate(new Date("2026-01-01T00:00:00.000Z"));

    await store.write(save);

    const content = await readFile(join(directory, "save.kq"), "utf8");
    expect(content.startsWith("KQSV1.")).toBe(true);
    expect(content).not.toContain("Apprentice");
  });

  it("creates readable development saves", async () => {
    const directory = await createTempDirectory();
    const store = createSaveStore({ mode: "development", directory });
    const save = await store.loadOrCreate(new Date("2026-01-01T00:00:00.000Z"));

    await store.write(save);

    const content = await readFile(join(directory, "save.dev.json"), "utf8");
    expect(content).toContain('"heroName": "Apprentice"');
    expect(content).toContain('"everUsedDevMode": true');
  });
});

async function createTempDirectory(): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), "keyquest-"));
  tempDirectories.push(directory);
  return directory;
}
