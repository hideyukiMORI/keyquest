import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { runApp } from "./app.js";
import type { TextInput } from "./cli/text-input.js";
import type { TextOutput } from "./cli/text-output.js";
import type { Lesson } from "./lessons/schema.js";

const tempDirectories: string[] = [];

describe("runApp", () => {
  afterEach(async () => {
    await Promise.all(tempDirectories.splice(0).map((path) => rm(path, { recursive: true })));
  });

  it("renders the scene shell", async () => {
    const output = createMemoryOutput();
    await runApp({
      mode: "normal",
      saveDirectory: await createTempDirectory(),
      textInput: createQueuedTextInput(["1", "f j f j asdf jkl;"]),
      textOutput: output,
      lesson: createTestLesson(),
      lessonPath: undefined,
      now: new Date("2026-01-01T00:00:00.000Z"),
      completedAt: new Date("2026-01-01T00:00:20.000Z"),
    });

    expect(output.text()).toContain("KeyQuest");
    expect(output.text()).toContain("Story");
    expect(output.text()).toContain("Status");
    expect(output.text()).toContain("Practice");
    expect(output.text()).toContain("Result");
    expect(output.text()).toContain("XP gained");
  });

  it("marks development mode visibly", async () => {
    const output = createMemoryOutput();
    await runApp({
      mode: "development",
      saveDirectory: await createTempDirectory(),
      textInput: createQueuedTextInput(["1", "f j f j asdf jkl;"]),
      textOutput: output,
      lesson: createTestLesson(),
      lessonPath: undefined,
      now: new Date("2026-01-01T00:00:00.000Z"),
      completedAt: new Date("2026-01-01T00:00:20.000Z"),
    });

    expect(output.text()).toContain("DEV MODE");
    expect(output.text()).toContain("DEV MODE CLEAR");
  });

  it("renders practice instructions before waiting for input", async () => {
    const output = createMemoryOutput();
    let readCount = 0;
    const input = createAssertingTextInput(() => {
      readCount += 1;
      if (readCount === 1) {
        expect(output.text()).toContain("Title");
        return "1";
      }

      expect(output.text()).toContain("Type: f j f j asdf jkl;");
      expect(output.text()).not.toContain("Result");
      return "f j f j asdf jkl;";
    });

    await runApp({
      mode: "normal",
      saveDirectory: await createTempDirectory(),
      textInput: input,
      textOutput: output,
      lesson: createTestLesson(),
      lessonPath: undefined,
      now: new Date("2026-01-01T00:00:00.000Z"),
      completedAt: new Date("2026-01-01T00:00:20.000Z"),
    });

    expect(output.text()).toContain("Result");
  });

  it("lets the player change language before starting", async () => {
    const output = createMemoryOutput();
    await runApp({
      mode: "normal",
      saveDirectory: await createTempDirectory(),
      textInput: createQueuedTextInput(["2", "2", "1", "f j f j asdf jkl;"]),
      textOutput: output,
      lesson: createTestLesson(),
      lessonPath: undefined,
      now: new Date("2026-01-01T00:00:00.000Z"),
      completedAt: new Date("2026-01-01T00:00:20.000Z"),
    });

    expect(output.text()).toContain("言語を 日本語 に設定しました。");
    expect(output.text()).toContain("タイトル");
    expect(output.text()).toContain("ストーリー");
    expect(output.text()).toContain("結果");
  });
});

async function createTempDirectory(): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), "keyquest-app-"));
  tempDirectories.push(directory);
  return directory;
}

function createTestLesson(): Lesson {
  return {
    schemaVersion: 1,
    id: "novice-hall-day-1",
    title: "Novice Hall: Home Position",
    day: 1,
    locale: "en",
    focus: ["home position"],
    prompts: [
      {
        id: "home-position-1",
        text: "f j f j asdf jkl;",
        targetKeys: ["f", "j", "a", "s", "d", "k", "l", ";"],
        skillIds: ["homePosition", "fingerResponsibility", "homeRow", "accuracy"],
        fingerHints: ["leftIndex", "rightIndex"],
      },
    ],
  };
}

function createQueuedTextInput(inputs: readonly string[]): TextInput {
  const queue = [...inputs];

  return {
    readLine(): Promise<string> {
      const input = queue.shift();
      if (input === undefined) {
        return Promise.reject(new Error("No queued test input"));
      }

      return Promise.resolve(input);
    },
    close(): void {},
  };
}

function createAssertingTextInput(read: () => string): TextInput {
  return {
    readLine(): Promise<string> {
      return Promise.resolve(read());
    },
    close(): void {},
  };
}

function createMemoryOutput(): TextOutput & { readonly text: () => string } {
  const chunks: string[] = [];

  return {
    write(text: string): void {
      chunks.push(text);
    },
    writeLine(text: string): void {
      chunks.push(`${text}\n`);
    },
    text(): string {
      return chunks.join("");
    },
  };
}
