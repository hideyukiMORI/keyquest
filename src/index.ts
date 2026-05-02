#!/usr/bin/env node

import { runApp } from "./app.js";
import { parseCliArgs } from "./cli/args.js";
import { createNodeTextInput } from "./cli/text-input.js";

try {
  const options = parseCliArgs(process.argv.slice(2));
  const textInput = createNodeTextInput({
    input: process.stdin,
    output: process.stdout,
  });
  try {
    const output = await runApp({
      mode: options.devMode ? "development" : "normal",
      saveDirectory: options.saveDirectory,
      textInput,
    });

    console.log(output);
  } finally {
    textInput.close();
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`KeyQuest failed: ${message}`);
  process.exitCode = 1;
}
