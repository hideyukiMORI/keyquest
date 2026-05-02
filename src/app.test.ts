import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { runApp } from "./app.js";
import type { TextInput } from "./cli/text-input.js";

const tempDirectories: string[] = [];

describe("runApp", () => {
  afterEach(async () => {
    await Promise.all(tempDirectories.splice(0).map((path) => rm(path, { recursive: true })));
  });

  it("renders the scene shell", async () => {
    const output = await runApp({
      mode: "normal",
      saveDirectory: await createTempDirectory(),
      textInput: createFixedTextInput("f j f j asdf jkl;"),
      now: new Date("2026-01-01T00:00:00.000Z"),
      completedAt: new Date("2026-01-01T00:00:20.000Z"),
    });

    expect(output).toContain("KeyQuest");
    expect(output).toContain("Story");
    expect(output).toContain("Status");
    expect(output).toContain("Practice");
    expect(output).toContain("Result");
    expect(output).toContain("XP gained");
  });

  it("marks development mode visibly", async () => {
    const output = await runApp({
      mode: "development",
      saveDirectory: await createTempDirectory(),
      textInput: createFixedTextInput("f j f j asdf jkl;"),
      now: new Date("2026-01-01T00:00:00.000Z"),
      completedAt: new Date("2026-01-01T00:00:20.000Z"),
    });

    expect(output).toContain("DEV MODE");
    expect(output).toContain("DEV MODE CLEAR");
  });
});

async function createTempDirectory(): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), "keyquest-app-"));
  tempDirectories.push(directory);
  return directory;
}

function createFixedTextInput(input: string): TextInput {
  return {
    readLine(): Promise<string> {
      return Promise.resolve(input);
    },
    close(): void {},
  };
}
