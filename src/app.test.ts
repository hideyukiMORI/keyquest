import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { runApp } from "./app.js";
import type { TextInput } from "./cli/text-input.js";
import type { TextOutput } from "./cli/text-output.js";
import type { Lesson } from "./lessons/schema.js";
import { createSaveStore } from "./save/store.js";

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
      textInput: createQueuedTextInput(["1", "f j", "ff jj", "fj jf"]),
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
    expect(output.text()).toContain("Segment 1/3");
    expect(output.text()).toContain("Session Result");
    expect(output.text()).toContain("Time: 20.0s");
    expect(output.text()).toContain("XP gained");
  });

  it("warns when the terminal is below the recommended size", async () => {
    const output = createMemoryOutput();
    await runApp({
      mode: "normal",
      saveDirectory: await createTempDirectory(),
      textInput: createQueuedTextInput(["1", "f j", "ff jj", "fj jf"]),
      textOutput: output,
      lesson: createTestLesson(),
      lessonPath: undefined,
      terminalRuntime: {
        colorMode: "auto",
        colorEnabled: true,
        theme: "classic",
        reducedMotion: false,
        size: {
          columns: 79,
          rows: 24,
          isBelowMinimum: true,
        },
      },
      now: new Date("2026-01-01T00:00:00.000Z"),
      completedAt: new Date("2026-01-01T00:00:20.000Z"),
    });

    expect(output.text()).toContain("WARNING: Terminal is 79x24");
  });

  it("does not warn when terminal size is unknown", async () => {
    const output = createMemoryOutput();
    await runApp({
      mode: "normal",
      saveDirectory: await createTempDirectory(),
      textInput: createQueuedTextInput(["1", "f j", "ff jj", "fj jf"]),
      textOutput: output,
      lesson: createTestLesson(),
      lessonPath: undefined,
      terminalRuntime: {
        colorMode: "auto",
        colorEnabled: true,
        theme: "classic",
        reducedMotion: false,
        size: {
          columns: undefined,
          rows: undefined,
          isBelowMinimum: false,
        },
      },
      now: new Date("2026-01-01T00:00:00.000Z"),
      completedAt: new Date("2026-01-01T00:00:20.000Z"),
    });

    expect(output.text()).not.toContain("WARNING: Terminal");
  });

  it("marks development mode visibly", async () => {
    const output = createMemoryOutput();
    await runApp({
      mode: "development",
      saveDirectory: await createTempDirectory(),
      textInput: createQueuedTextInput(["1", "f j", "ff jj", "fj jf"]),
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

      expect(output.text()).toContain("Type: f j");
      expect(output.text()).not.toContain("Session Result");
      return "f j";
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

    expect(output.text()).toContain("Session Result");
  });

  it("lets the player change language before starting", async () => {
    const output = createMemoryOutput();
    await runApp({
      mode: "normal",
      saveDirectory: await createTempDirectory(),
      textInput: createQueuedTextInput(["2", "2", "1", "f j", "ff jj", "fj jf"]),
      textOutput: output,
      lesson: createTestLesson(),
      lessonPath: undefined,
      now: new Date("2026-01-01T00:00:00.000Z"),
      completedAt: new Date("2026-01-01T00:00:20.000Z"),
    });

    expect(output.text()).toContain("言語を 日本語 に設定しました。");
    expect(output.text()).toContain("タイトル");
    expect(output.text()).toContain("ストーリー");
    expect(output.text()).toContain("時間: 20.0秒");
    expect(output.text()).toContain("セッション結果");
  });

  it("explains that load game is planned and returns to the title menu", async () => {
    const output = createMemoryOutput();
    await runApp({
      mode: "normal",
      saveDirectory: await createTempDirectory(),
      textInput: createQueuedTextInput(["4", "1", "f j", "ff jj", "fj jf"]),
      textOutput: output,
      lesson: createTestLesson(),
      lessonPath: undefined,
      now: new Date("2026-01-01T00:00:00.000Z"),
      completedAt: new Date("2026-01-01T00:00:20.000Z"),
    });

    expect(output.text()).toContain("Load Game will open save slots later");
    expect(output.text()).toContain("Session Result");
  });

  it("starts a new save when New Game is selected", async () => {
    const directory = await createTempDirectory();
    await runApp({
      mode: "development",
      saveDirectory: directory,
      textInput: createQueuedTextInput(["1", "f j", "ff jj", "fj jf"]),
      textOutput: createMemoryOutput(),
      lesson: createTestLesson(),
      lessonPath: undefined,
      now: new Date("2026-01-01T00:00:00.000Z"),
      completedAt: new Date("2026-01-01T00:00:20.000Z"),
    });
    await runApp({
      mode: "development",
      saveDirectory: directory,
      textInput: createQueuedTextInput(["3", "f j", "ff jj", "fj jf"]),
      textOutput: createMemoryOutput(),
      lesson: createTestLesson(),
      lessonPath: undefined,
      now: new Date("2026-01-02T00:00:00.000Z"),
      completedAt: new Date("2026-01-02T00:00:20.000Z"),
    });

    const save = await createSaveStore({ mode: "development", directory }).loadOrCreate(
      new Date("2026-01-02T00:01:00.000Z"),
    );
    expect(save.progress.sessions).toHaveLength(1);
    expect(save.profile.createdAt).toBe("2026-01-02T00:00:00.000Z");
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
        text: "f j",
        targetKeys: ["f", "j"],
        skillIds: ["homePosition", "fingerResponsibility"],
        fingerHints: ["leftIndex", "rightIndex"],
      },
      {
        id: "home-position-2",
        text: "ff jj",
        targetKeys: ["f", "j"],
        skillIds: ["homePosition", "fingerResponsibility"],
        fingerHints: ["leftIndex", "rightIndex"],
      },
      {
        id: "home-position-3",
        text: "fj jf",
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
