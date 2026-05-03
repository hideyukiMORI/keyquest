#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { createReadStream, openSync, readFileSync } from "node:fs";
import { URL } from "node:url";

import { runApp } from "./app.js";
import { parseCliArgs } from "./cli/args.js";
import { renderCliHelp, renderCliVersion } from "./cli/help.js";
import { createNodeTextInput } from "./cli/text-input.js";
import { createNodeTextOutput } from "./cli/text-output.js";
import type { RawModeController } from "./realtime/raw-mode.js";
import { createNodeRealtimeTypingInput, type RealtimeInputStream } from "./realtime/input.js";
import { ANSI_RESET } from "./terminal/ansi.js";
import { resolveTerminalRuntime } from "./terminal/runtime.js";

try {
  const options = parseCliArgs(process.argv.slice(2));
  if (options.action === "help") {
    console.log(renderCliHelp());
    process.exitCode = 0;
  } else if (options.action === "version") {
    console.log(renderCliVersion(readPackageVersion()));
    process.exitCode = 0;
  } else {
    const forceTty = options.forceTty || process.env["npm_config_force_tty"] === "true";
    const realtimeStream = createRealtimeInputStream({ forceTty });
    const textInput = createNodeTextInput({
      input: process.stdin,
      output: process.stdout,
    });
    const textOutput = createNodeTextOutput(process.stdout);
    const realtimeInput = createNodeRealtimeTypingInput(realtimeStream.stream, {
      forceRawMode: forceTty,
      ...(realtimeStream.rawModeController === undefined
        ? {}
        : { rawModeController: realtimeStream.rawModeController }),
    });
    const terminalRuntime = resolveTerminalRuntime({
      colorMode: options.colorMode,
      theme: undefined,
      reducedMotion: options.reducedMotion,
      columns: process.stdout.columns,
      rows: process.stdout.rows,
      isTty: process.stdin.isTTY === true || process.stdout.isTTY === true,
      forceTty,
      env: process.env,
    });
    try {
      await runApp({
        mode: options.devMode ? "development" : "normal",
        saveDirectory: options.saveDirectory,
        lesson: undefined,
        lessonPath: options.lessonPath,
        ...(options.lessonPackPath === undefined ? {} : { lessonPackPath: options.lessonPackPath }),
        terminalRuntime,
        realtimeInput,
        textInput,
        textOutput,
      });
    } finally {
      resetTerminalStyles();
      textInput.close();
      realtimeStream.close();
    }
  }
} catch (error) {
  resetTerminalStyles();
  const message = error instanceof Error ? error.message : String(error);
  console.error(`KeyQuest failed: ${message}`);
  process.exitCode = 1;
}

function readPackageVersion(): string {
  const content = readFileSync(new URL("../package.json", import.meta.url), "utf8");
  const packageJson = JSON.parse(content) as { readonly version?: unknown };

  return typeof packageJson.version === "string" ? packageJson.version : "0.0.0";
}

function resetTerminalStyles(): void {
  try {
    process.stdout.write(ANSI_RESET);
    process.stderr.write(ANSI_RESET);
  } catch {
    // Best-effort cleanup so terminal prompts do not inherit game colors.
  }
}

function createRealtimeInputStream(options: { readonly forceTty: boolean }): {
  readonly stream: RealtimeInputStream;
  readonly rawModeController?: RawModeController;
  readonly close: () => void;
} {
  if (!options.forceTty) {
    return {
      stream: process.stdin,
      close(): void {},
    };
  }

  const fd = openSync("/dev/tty", "r");
  const stream = createReadStream("/dev/tty", { fd, autoClose: true }) as RealtimeInputStream;
  const savedMode = execFileSync("sh", ["-c", "stty -g < /dev/tty"], {
    encoding: "utf8",
  }).trim();
  const rawModeController: RawModeController = {
    enable(): void {
      execFileSync("sh", ["-c", "stty -echo -icanon min 1 time 0 < /dev/tty"]);
    },
    disable(): void {
      execFileSync("sh", ["-c", `stty ${savedMode} < /dev/tty`]);
    },
    resume(): void {
      stream.resume();
    },
    pause(): void {
      stream.pause();
    },
  };

  return {
    stream,
    rawModeController,
    close(): void {
      stream.destroy();
    },
  };
}
