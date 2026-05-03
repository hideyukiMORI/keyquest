#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { URL } from "node:url";

import { runApp } from "./app.js";
import { parseCliArgs } from "./cli/args.js";
import { renderCliHelp, renderCliVersion } from "./cli/help.js";
import { createNodeTextInput } from "./cli/text-input.js";
import { createNodeTextOutput } from "./cli/text-output.js";
import { createNodeRealtimeTypingInput } from "./realtime/input.js";
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
    const textInput = createNodeTextInput({
      input: process.stdin,
      output: process.stdout,
    });
    const textOutput = createNodeTextOutput(process.stdout);
    const realtimeInput = createNodeRealtimeTypingInput(process.stdin, { forceRawMode: forceTty });
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
      textInput.close();
    }
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`KeyQuest failed: ${message}`);
  process.exitCode = 1;
}

function readPackageVersion(): string {
  const content = readFileSync(new URL("../package.json", import.meta.url), "utf8");
  const packageJson = JSON.parse(content) as { readonly version?: unknown };

  return typeof packageJson.version === "string" ? packageJson.version : "0.0.0";
}
