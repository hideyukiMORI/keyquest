import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { runApp } from "./app.js";

const tempDirectories: string[] = [];

describe("runApp", () => {
  afterEach(async () => {
    await Promise.all(tempDirectories.splice(0).map((path) => rm(path, { recursive: true })));
  });

  it("renders the scene shell", async () => {
    const output = await runApp({
      mode: "normal",
      saveDirectory: await createTempDirectory(),
      now: new Date("2026-01-01T00:00:00.000Z"),
    });

    expect(output).toContain("KeyQuest");
    expect(output).toContain("Story");
    expect(output).toContain("Status");
    expect(output).toContain("Practice Preview");
  });

  it("marks development mode visibly", async () => {
    const output = await runApp({
      mode: "development",
      saveDirectory: await createTempDirectory(),
      now: new Date("2026-01-01T00:00:00.000Z"),
    });

    expect(output).toContain("DEV MODE");
  });
});

async function createTempDirectory(): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), "keyquest-app-"));
  tempDirectories.push(directory);
  return directory;
}
