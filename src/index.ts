#!/usr/bin/env node

import { runApp } from "./app.js";
import { parseCliArgs } from "./cli/args.js";

try {
  const options = parseCliArgs(process.argv.slice(2));
  const output = await runApp({
    mode: options.devMode ? "development" : "normal",
    saveDirectory: options.saveDirectory,
  });

  console.log(output);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`KeyQuest failed: ${message}`);
  process.exitCode = 1;
}
