#!/usr/bin/env node

import { runApp } from "./app.js";
import { parseCliArgs } from "./cli/args.js";
import { createNodeTextInput } from "./cli/text-input.js";
import { createNodeTextOutput } from "./cli/text-output.js";

try {
  const options = parseCliArgs(process.argv.slice(2));
  const textInput = createNodeTextInput({
    input: process.stdin,
    output: process.stdout,
  });
  const textOutput = createNodeTextOutput(process.stdout);
  try {
    await runApp({
      mode: options.devMode ? "development" : "normal",
      saveDirectory: options.saveDirectory,
      lesson: undefined,
      lessonPath: options.lessonPath,
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
