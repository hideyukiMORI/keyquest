import { describe, expect, it } from "vitest";

import {
  isRawModeUnavailableError,
  toTypingInputFromKey,
  withRawMode,
  type RawModeStream,
} from "./raw-mode.js";

describe("raw mode helpers", () => {
  it("restores raw mode after successful runs", async () => {
    const calls: string[] = [];
    const stream = createFakeRawModeStream(calls);

    const result = await withRawMode(stream, () => "ok");

    expect(result).toBe("ok");
    expect(calls).toEqual(["raw:true", "resume", "raw:false", "pause"]);
  });

  it("restores raw mode after throwing runs", async () => {
    const calls: string[] = [];
    const stream = createFakeRawModeStream(calls);

    await expect(
      withRawMode(stream, () => {
        throw new Error("boom");
      }),
    ).rejects.toThrow("boom");
    expect(calls).toEqual(["raw:true", "resume", "raw:false", "pause"]);
  });

  it("ignores non-TTY streams", async () => {
    const calls: string[] = [];
    const stream: RawModeStream = {
      isTTY: false,
      setRawMode(enabled: boolean): void {
        calls.push(`raw:${enabled}`);
      },
    };

    await withRawMode(stream, () => "ok");

    expect(calls).toEqual([]);
  });

  it("reports raw-mode startup failures as unavailable", async () => {
    const stream: RawModeStream = {
      isTTY: true,
      setRawMode(): void {
        throw new TypeError("Cannot read properties of undefined (reading '_handle')");
      },
    };

    await expect(withRawMode(stream, () => "ok")).rejects.toSatisfy((error: unknown) =>
      isRawModeUnavailableError(error),
    );
  });

  it("maps terminal keys to typing inputs", () => {
    expect(toTypingInputFromKey("\u0003")).toEqual({ kind: "cancel" });
    expect(toTypingInputFromKey("\r")).toEqual({ kind: "submit" });
    expect(toTypingInputFromKey("\u007f")).toEqual({ kind: "backspace" });
    expect(toTypingInputFromKey("f")).toEqual({ kind: "character", value: "f" });
    expect(toTypingInputFromKey("\u001b[A")).toBeUndefined();
  });
});

function createFakeRawModeStream(calls: string[]): RawModeStream {
  return {
    isTTY: true,
    setRawMode(enabled: boolean): void {
      calls.push(`raw:${enabled}`);
    },
    resume(): void {
      calls.push("resume");
    },
    pause(): void {
      calls.push("pause");
    },
  };
}
