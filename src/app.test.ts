import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { runApp } from "./app.js";
import type { TextInput } from "./cli/text-input.js";
import type { TextOutput } from "./cli/text-output.js";
import type { Lesson } from "./lessons/schema.js";
import type { RealtimeTypingInput } from "./realtime/input.js";
import { RawModeUnavailableError } from "./realtime/raw-mode.js";
import { createNewSave } from "./save/model.js";
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
    expect(output.text()).toContain("Modifier: Steady Torch");
    expect(output.text()).toContain("Practice");
    expect(output.text()).toContain("Segment 1/3");
    expect(output.text()).toContain("Session Result");
    expect(output.text()).toContain("Time: 20.0s");
    expect(output.text()).toContain("XP gained");
    expect(output.text()).toContain("Rewards");
    expect(output.text()).not.toContain("Review Focus");
    expect(output.text()).toContain("Achievements");
    expect(output.text()).toContain("Unlocked: First Steps");
    expect(output.text()).toContain("Unlocked: Flawless Focus");
    expect(output.text()).toContain("Next lesson: Day 2 is ready for next time.");
  });

  it("returns to the title menu after showing in-game help", async () => {
    const output = createMemoryOutput();
    await runApp({
      mode: "normal",
      saveDirectory: await createTempDirectory(),
      textInput: createQueuedTextInput(["6", "", "1", "f j", "ff jj", "fj jf"]),
      textOutput: output,
      lesson: createTestLesson(),
      lessonPath: undefined,
      now: new Date("2026-01-01T00:00:00.000Z"),
      completedAt: new Date("2026-01-01T00:00:20.000Z"),
    });

    expect(output.text()).toContain("How to Play");
    expect(output.text()).toContain("Press Enter to return to the title.");
    expect(output.text()).toContain("Session Result");
  });

  it("shows a notice when loading before any journey is saved", async () => {
    const output = createMemoryOutput();
    await runApp({
      mode: "normal",
      saveDirectory: await createTempDirectory(),
      textInput: createQueuedTextInput(["5", "1", "f j", "ff jj", "fj jf"]),
      textOutput: output,
      lesson: createTestLesson(),
      lessonPath: undefined,
      now: new Date("2026-01-01T00:00:00.000Z"),
      completedAt: new Date("2026-01-01T00:00:20.000Z"),
    });

    expect(output.text()).toContain("No saved journey is available yet");
    expect(output.text()).toContain("Session Result");
  });

  it("loads the current saved journey from the title menu", async () => {
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
    const output = createMemoryOutput();
    await runApp({
      mode: "development",
      saveDirectory: directory,
      textInput: createQueuedTextInput(["5", "f j", "ff jj", "fj jf"]),
      textOutput: output,
      lesson: createTestLesson(),
      lessonPath: undefined,
      now: new Date("2026-01-02T00:00:00.000Z"),
      completedAt: new Date("2026-01-02T00:00:20.000Z"),
    });

    const save = await createSaveStore({ mode: "development", directory }).loadOrCreate(
      new Date("2026-01-02T00:01:00.000Z"),
    );
    expect(output.text()).not.toContain("No saved journey is available yet");
    expect(save.progress.sessions).toHaveLength(2);
    expect(save.journey.day).toBe(3);
  });

  it("shows Gatekeeper clear and Day 8 advancement after Day 7", async () => {
    const directory = await createTempDirectory();
    const now = new Date("2026-01-01T00:00:00.000Z");
    await createSaveStore({ mode: "development", directory }).write({
      ...createNewSave(now, "development"),
      journey: {
        day: 7,
        chapter: 1,
        storyFlag: "noviceHallStarted",
      },
    });
    const output = createMemoryOutput();

    await runApp({
      mode: "development",
      saveDirectory: directory,
      textInput: createQueuedTextInput(["1", "f j", "ff jj", "fj jf"]),
      textOutput: output,
      lesson: createTestLesson(),
      lessonPath: undefined,
      now,
      completedAt: new Date("2026-01-01T00:00:20.000Z"),
    });

    expect(output.text()).toContain("Gatekeeper Trial cleared");
    expect(output.text()).toContain("Earned title: Novice Hall Graduate");
    expect(output.text()).toContain("Next lesson: Day 8 is ready for next time.");
  });

  it("does not show journey advancement when already at the latest bundled day", async () => {
    const directory = await createTempDirectory();
    const now = new Date("2026-01-01T00:00:00.000Z");
    await createSaveStore({ mode: "development", directory }).write({
      ...createNewSave(now, "development"),
      journey: {
        day: 28,
        chapter: 4,
        storyFlag: "noviceHallStarted",
      },
    });
    const output = createMemoryOutput();

    await runApp({
      mode: "development",
      saveDirectory: directory,
      textInput: createQueuedTextInput(["1", "f j", "ff jj", "fj jf"]),
      textOutput: output,
      lesson: createTestLesson(),
      lessonPath: undefined,
      now,
      completedAt: new Date("2026-01-01T00:00:20.000Z"),
    });

    expect(output.text()).not.toContain("Next lesson:");
    expect(output.text()).not.toContain("Gatekeeper Trial cleared");
    expect(output.text()).not.toContain("Waystone Trial cleared");
    expect(output.text()).not.toContain("Ferryman Trial cleared");
    expect(output.text()).toContain("Beacon Trial cleared");
    expect(output.text()).toContain("Earned title: Lantern Keep Beacon");
  });

  it("shows Meadow Road clear and second-week title after Day 14", async () => {
    const directory = await createTempDirectory();
    const now = new Date("2026-01-01T00:00:00.000Z");
    await createSaveStore({ mode: "development", directory }).write({
      ...createNewSave(now, "development"),
      journey: {
        day: 14,
        chapter: 2,
        storyFlag: "noviceHallStarted",
      },
    });
    const output = createMemoryOutput();

    await runApp({
      mode: "development",
      saveDirectory: directory,
      textInput: createQueuedTextInput(["1", "f j", "ff jj", "fj jf"]),
      textOutput: output,
      lesson: createTestLesson(),
      lessonPath: undefined,
      now,
      completedAt: new Date("2026-01-01T00:00:20.000Z"),
    });

    expect(output.text()).toContain("Waystone Trial cleared");
    expect(output.text()).toContain("Earned title: Meadow Road Pathfinder");
  });

  it("shows River Gate clear and third-week title after Day 21", async () => {
    const directory = await createTempDirectory();
    const now = new Date("2026-01-01T00:00:00.000Z");
    await createSaveStore({ mode: "development", directory }).write({
      ...createNewSave(now, "development"),
      journey: {
        day: 21,
        chapter: 3,
        storyFlag: "noviceHallStarted",
      },
    });
    const output = createMemoryOutput();

    await runApp({
      mode: "development",
      saveDirectory: directory,
      textInput: createQueuedTextInput(["1", "f j", "ff jj", "fj jf"]),
      textOutput: output,
      lesson: createTestLesson(),
      lessonPath: undefined,
      now,
      completedAt: new Date("2026-01-01T00:00:20.000Z"),
    });

    expect(output.text()).toContain("Ferryman Trial cleared");
    expect(output.text()).toContain("Earned title: River Gate Ferryman");
    expect(output.text()).toContain("Next lesson: Day 22 is ready for next time.");
  });

  it("uses lesson session prompt count overrides", async () => {
    const output = createMemoryOutput();
    await runApp({
      mode: "normal",
      saveDirectory: await createTempDirectory(),
      textInput: createQueuedTextInput(["1", "f j", "ff jj", "fj jf", "f j"]),
      textOutput: output,
      lesson: {
        ...createTestLesson(),
        sessionPromptCount: 4,
        prompts: [
          ...createTestLesson().prompts,
          {
            id: "home-position-4",
            text: "f j",
            targetKeys: ["f", "j"],
            skillIds: ["homePosition"],
            fingerHints: ["leftIndex", "rightIndex"],
          },
        ],
      },
      lessonPath: undefined,
      now: new Date("2026-01-01T00:00:00.000Z"),
      completedAt: new Date("2026-01-01T00:00:20.000Z"),
    });

    expect(output.text()).toContain("Segment 4/4");
    expect(output.text()).toContain("Prompts: 4");
  });

  it("loads the current day lesson from an imported lesson pack", async () => {
    const packDirectory = await createTempDirectory();
    const lessonsDirectory = join(packDirectory, "lessons");
    await mkdir(lessonsDirectory);
    const lesson = {
      ...createTestLesson(),
      id: "pack-day-1",
      title: "Pack Day 1",
      prompts: createTestLesson().prompts.map((prompt, index) => ({
        ...prompt,
        id: `pack-prompt-${index + 1}`,
        text: ["aa", "ss", "dd"][index] ?? prompt.text,
      })),
    };
    await writeFile(join(lessonsDirectory, "day-1.json"), JSON.stringify(lesson), "utf8");
    const manifestPath = join(packDirectory, "keyquest-pack.json");
    await writeFile(
      manifestPath,
      JSON.stringify({
        version: 1,
        id: "test-pack",
        title: "Test Pack",
        lessons: [
          {
            day: 1,
            path: "lessons/day-1.json",
          },
        ],
      }),
      "utf8",
    );
    const output = createMemoryOutput();

    await runApp({
      mode: "normal",
      saveDirectory: await createTempDirectory(),
      textInput: createQueuedTextInput(["1", "aa", "ss", "dd"]),
      textOutput: output,
      lesson: undefined,
      lessonPath: undefined,
      lessonPackPath: manifestPath,
      now: new Date("2026-01-01T00:00:00.000Z"),
      completedAt: new Date("2026-01-01T00:00:20.000Z"),
    });

    expect(output.text()).toContain("Lesson: Pack Day 1");
    expect(output.text()).toContain("Type: aa");
    expect(output.text()).toContain("Session Result");
  });

  it("shows streak milestone messages after rewards", async () => {
    const directory = await createTempDirectory();
    const now = new Date("2026-01-03T00:00:00.000Z");
    const save = createNewSave(now, "normal");
    await createSaveStore({ mode: "normal", directory }).write({
      ...save,
      progress: {
        ...save.progress,
        streakDays: 2,
        sessions: [
          {
            id: "session-previous",
            mode: "normal",
            startedAt: "2026-01-02T00:00:00.000Z",
            completedAt: "2026-01-02T00:10:00.000Z",
            promptCount: 1,
            accuracy: 1,
            wordsPerMinute: 30,
            xpGained: 10,
            mistakes: [],
          },
        ],
      },
    });
    const output = createMemoryOutput();

    await runApp({
      mode: "normal",
      saveDirectory: directory,
      textInput: createQueuedTextInput(["1", "f j", "ff jj", "fj jf"]),
      textOutput: output,
      lesson: createTestLesson(),
      lessonPath: undefined,
      now,
      completedAt: new Date("2026-01-03T00:00:20.000Z"),
    });

    expect(output.text()).toContain("3 days in a row.");
    expect(output.text()).toContain("Three days steady. The habit is taking root.");
  });

  it("styles headings when terminal color is enabled", async () => {
    const output = createMemoryOutput();
    await runApp({
      mode: "normal",
      saveDirectory: await createTempDirectory(),
      textInput: createQueuedTextInput(["1", "f j", "ff jj", "fj jf"]),
      textOutput: output,
      lesson: createTestLesson(),
      lessonPath: undefined,
      terminalRuntime: {
        colorMode: "always",
        colorEnabled: true,
        screenEnabled: false,
        theme: "classic",
        reducedMotion: false,
        size: {
          columns: 100,
          rows: 30,
          isBelowMinimum: false,
        },
      },
      now: new Date("2026-01-01T00:00:00.000Z"),
      completedAt: new Date("2026-01-01T00:00:20.000Z"),
    });

    expect(output.text()).toContain("\u001b[93mStory\u001b[0m");
  });

  it("redraws major screens when terminal screen rendering is enabled", async () => {
    const output = createMemoryOutput();
    await runApp({
      mode: "normal",
      saveDirectory: await createTempDirectory(),
      textInput: createQueuedTextInput(["1", "f j", "ff jj", "fj jf"]),
      textOutput: output,
      lesson: createTestLesson(),
      lessonPath: undefined,
      terminalRuntime: {
        colorMode: "never",
        colorEnabled: false,
        screenEnabled: true,
        theme: "classic",
        reducedMotion: false,
        size: {
          columns: 100,
          rows: 30,
          isBelowMinimum: false,
        },
      },
      now: new Date("2026-01-01T00:00:00.000Z"),
      completedAt: new Date("2026-01-01T00:00:20.000Z"),
    });

    expect(output.text()).toContain("\u001b[2J\u001b[H");
    expect(output.text()).toContain("Session Result");
  });

  it("uses realtime typing input when screen rendering is enabled", async () => {
    const output = createMemoryOutput();
    await runApp({
      mode: "normal",
      saveDirectory: await createTempDirectory(),
      textInput: createQueuedTextInput(["1"]),
      textOutput: output,
      lesson: createTestLesson(),
      lessonPath: undefined,
      realtimeInput: createQueuedRealtimeInput([
        "\r",
        "f",
        " ",
        "j",
        "\r",
        "f",
        "f",
        " ",
        "j",
        "j",
        "\r",
        "f",
        "j",
        " ",
        "j",
        "f",
        "\r",
      ]),
      terminalRuntime: {
        colorMode: "never",
        colorEnabled: false,
        screenEnabled: true,
        theme: "classic",
        reducedMotion: false,
        size: {
          columns: 100,
          rows: 30,
          isBelowMinimum: false,
        },
      },
      now: new Date("2026-01-01T00:00:00.000Z"),
      completedAt: new Date("2026-01-01T00:00:20.000Z"),
    });

    expect(output.text()).toContain("Real-time Practice");
    expect(output.text()).toContain("Input:  f j");
    expect(output.text()).toContain("Session Result");
    expect(output.text()).toContain("Unlocked: Flawless Focus");
  });

  it("uses interactive title and language menus with realtime input", async () => {
    const output = createMemoryOutput();
    await runApp({
      mode: "normal",
      saveDirectory: await createTempDirectory(),
      textInput: createQueuedTextInput([]),
      textOutput: output,
      lesson: createTestLesson(),
      lessonPath: undefined,
      realtimeInput: createQueuedRealtimeInput([
        "j",
        "j",
        "\r",
        "j",
        "\r",
        "\r",
        "f",
        " ",
        "j",
        "\r",
        "f",
        "f",
        " ",
        "j",
        "j",
        "\r",
        "f",
        "j",
        " ",
        "j",
        "f",
        "\r",
      ]),
      terminalRuntime: {
        colorMode: "never",
        colorEnabled: false,
        screenEnabled: true,
        theme: "classic",
        reducedMotion: false,
        size: {
          columns: 100,
          rows: 30,
          isBelowMinimum: false,
        },
      },
      now: new Date("2026-01-01T00:00:00.000Z"),
      completedAt: new Date("2026-01-01T00:00:20.000Z"),
    });

    expect(output.text()).toContain("オプション");
    expect(output.text()).toContain("j/k または矢印キーで移動");
    expect(output.text()).toContain("言語を 日本語 に設定しました。");
    expect(output.text()).toContain("セッション結果");
  });

  it("lets the player change options during practice", async () => {
    const directory = await createTempDirectory();
    const output = createMemoryOutput();
    await runApp({
      mode: "development",
      saveDirectory: directory,
      textInput: createQueuedTextInput(["1", "options", "2", "f j", "ff jj", "fj jf"]),
      textOutput: output,
      lesson: createTestLesson(),
      lessonPath: undefined,
      now: new Date("2026-01-01T00:00:00.000Z"),
      completedAt: new Date("2026-01-01T00:00:20.000Z"),
    });

    const save = await createSaveStore({ mode: "development", directory }).loadOrCreate(
      new Date("2026-01-01T00:01:00.000Z"),
    );
    expect(save.settings.locale).toBe("ja");
    expect(output.text()).toContain("言語を 日本語 に設定しました。");
    expect(output.text()).toContain("セッション結果");
  });

  it("falls back to line input when raw mode is unavailable", async () => {
    const output = createMemoryOutput();
    await runApp({
      mode: "normal",
      saveDirectory: await createTempDirectory(),
      textInput: createQueuedTextInput(["1", "f j", "ff jj", "fj jf"]),
      textOutput: output,
      lesson: createTestLesson(),
      lessonPath: undefined,
      realtimeInput: createUnavailableRealtimeInput(),
      terminalRuntime: {
        colorMode: "never",
        colorEnabled: false,
        screenEnabled: true,
        theme: "classic",
        reducedMotion: false,
        size: {
          columns: 100,
          rows: 30,
          isBelowMinimum: false,
        },
      },
      now: new Date("2026-01-01T00:00:00.000Z"),
      completedAt: new Date("2026-01-01T00:00:20.000Z"),
    });

    expect(output.text()).not.toContain("Real-time Practice");
    expect(output.text()).toContain("Session Result");
    expect(output.text()).toContain("Unlocked: Flawless Focus");
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
        screenEnabled: false,
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
        screenEnabled: false,
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
      textInput: createQueuedTextInput(["3", "2", "1", "f j", "ff jj", "fj jf"]),
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

  it("returns to the title when loading without a saved journey", async () => {
    const output = createMemoryOutput();
    await runApp({
      mode: "normal",
      saveDirectory: await createTempDirectory(),
      textInput: createQueuedTextInput(["5", "1", "f j", "ff jj", "fj jf"]),
      textOutput: output,
      lesson: createTestLesson(),
      lessonPath: undefined,
      now: new Date("2026-01-01T00:00:00.000Z"),
      completedAt: new Date("2026-01-01T00:00:20.000Z"),
    });

    expect(output.text()).toContain("No saved journey is available yet");
    expect(output.text()).toContain("Session Result");
  });

  it("runs a weak-key review without advancing the journey", async () => {
    const directory = await createTempDirectory();
    const now = new Date("2026-01-01T00:00:00.000Z");
    const save = createNewSave(now, "normal");
    await createSaveStore({ mode: "normal", directory }).write({
      ...save,
      progress: {
        ...save.progress,
        sessions: [
          {
            id: "session-previous",
            mode: "normal",
            startedAt: "2026-01-01T00:00:00.000Z",
            completedAt: "2026-01-01T00:10:00.000Z",
            promptCount: 1,
            accuracy: 0.5,
            wordsPerMinute: 20,
            xpGained: 5,
            mistakes: [
              { promptId: "p1", index: 0, expected: "j", actual: "f" },
              { promptId: "p1", index: 1, expected: "j", actual: "f" },
              { promptId: "p1", index: 2, expected: "f", actual: "j" },
            ],
          },
        ],
      },
    });
    const output = createMemoryOutput();

    await runApp({
      mode: "normal",
      saveDirectory: directory,
      textInput: createQueuedTextInput(["2", "j j j f f f jf fj"]),
      textOutput: output,
      lesson: createTestLesson(),
      lessonPath: undefined,
      now,
      completedAt: new Date("2026-01-01T00:00:20.000Z"),
    });

    const updatedSave = await createSaveStore({ mode: "normal", directory }).loadOrCreate(now);
    expect(output.text()).toContain("Lesson: Weak-Key Review");
    expect(output.text()).toContain("Review Focus");
    expect(output.text()).toContain("Targeted weak keys: j f");
    expect(output.text()).toContain("Prompts: 1");
    expect(updatedSave.journey.day).toBe(1);
  });

  it("returns to title when weak-key review is unavailable", async () => {
    const output = createMemoryOutput();

    await runApp({
      mode: "normal",
      saveDirectory: await createTempDirectory(),
      textInput: createQueuedTextInput(["2", "1", "f j", "ff jj", "fj jf"]),
      textOutput: output,
      lesson: createTestLesson(),
      lessonPath: undefined,
      now: new Date("2026-01-01T00:00:00.000Z"),
      completedAt: new Date("2026-01-01T00:00:20.000Z"),
    });

    expect(output.text()).toContain("No weak-key review is ready yet");
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
      textInput: createQueuedTextInput(["4", "yes", "f j", "ff jj", "fj jf"]),
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

  it("preserves options when New Game replaces progress", async () => {
    const directory = await createTempDirectory();
    await runApp({
      mode: "development",
      saveDirectory: directory,
      textInput: createQueuedTextInput(["3", "2", "1", "f j", "ff jj", "fj jf"]),
      textOutput: createMemoryOutput(),
      lesson: createTestLesson(),
      lessonPath: undefined,
      now: new Date("2026-01-01T00:00:00.000Z"),
      completedAt: new Date("2026-01-01T00:00:20.000Z"),
    });
    await runApp({
      mode: "development",
      saveDirectory: directory,
      textInput: createQueuedTextInput(["4", "yes", "f j", "ff jj", "fj jf"]),
      textOutput: createMemoryOutput(),
      lesson: createTestLesson(),
      lessonPath: undefined,
      now: new Date("2026-01-02T00:00:00.000Z"),
      completedAt: new Date("2026-01-02T00:00:20.000Z"),
    });

    const save = await createSaveStore({ mode: "development", directory }).loadOrCreate(
      new Date("2026-01-02T00:01:00.000Z"),
    );
    expect(save.settings.locale).toBe("ja");
    expect(save.progress.sessions).toHaveLength(1);
    expect(save.profile.createdAt).toBe("2026-01-02T00:00:00.000Z");
  });

  it("keeps the current save when New Game confirmation is cancelled", async () => {
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
    const output = createMemoryOutput();
    await runApp({
      mode: "development",
      saveDirectory: directory,
      textInput: createQueuedTextInput(["4", "no", "5", "f j", "ff jj", "fj jf"]),
      textOutput: output,
      lesson: createTestLesson(),
      lessonPath: undefined,
      now: new Date("2026-01-02T00:00:00.000Z"),
      completedAt: new Date("2026-01-02T00:00:20.000Z"),
    });

    const save = await createSaveStore({ mode: "development", directory }).loadOrCreate(
      new Date("2026-01-02T00:01:00.000Z"),
    );
    expect(output.text()).toContain("New Game cancelled");
    expect(save.profile.createdAt).toBe("2026-01-01T00:00:00.000Z");
    expect(save.progress.sessions).toHaveLength(2);
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

function createQueuedRealtimeInput(keys: readonly string[]): RealtimeTypingInput {
  const queue = [...keys];

  return {
    readKey(): Promise<string> {
      const key = queue.shift();
      if (key === undefined) {
        return Promise.reject(new Error("No queued realtime key"));
      }

      return Promise.resolve(key);
    },
    async withRawMode<T>(run: () => Promise<T> | T): Promise<T> {
      return run();
    },
  };
}

function createUnavailableRealtimeInput(): RealtimeTypingInput {
  return {
    readKey(): Promise<string> {
      return Promise.reject(new Error("raw key should not be read"));
    },
    withRawMode(): Promise<never> {
      return Promise.reject(
        new RawModeUnavailableError(
          new TypeError("Cannot read properties of undefined (reading '_handle')"),
        ),
      );
    },
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
