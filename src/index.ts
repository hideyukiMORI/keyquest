#!/usr/bin/env node

import { runApp } from "./app.js";
import { parseCliArgs } from "./cli/args.js";
import { createNodeTextInput } from "./cli/text-input.js";
import { createNodeTextOutput } from "./cli/text-output.js";
import { createNodeRealtimeTypingInput } from "./realtime/input.js";
import { resolveTerminalRuntime } from "./terminal/runtime.js";

try {
  const options = parseCliArgs(process.argv.slice(2));
  const textInput = createNodeTextInput({
    input: process.stdin,
    output: process.stdout,
  });
  const textOutput = createNodeTextOutput(process.stdout);
  const realtimeInput = createNodeRealtimeTypingInput(process.stdin);
  const terminalRuntime = resolveTerminalRuntime({
    colorMode: options.colorMode,
    theme: undefined,
    reducedMotion: options.reducedMotion,
    columns: process.stdout.columns,
    rows: process.stdout.rows,
    isTty: process.stdout.isTTY === true,
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
    textInput.close();
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`KeyQuest failed: ${message}`);
  process.exitCode = 1;
}
