#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { URL } from "node:url";

const packageRoot = new URL("..", import.meta.url);
const tempDirectory = mkdtempSync(join(tmpdir(), "keyquest-package-smoke-"));
let tarballPath;

try {
  exec("npm", ["run", "build"], { cwd: packageRoot });
  const packOutput = exec("npm", ["pack", "--json"], { cwd: packageRoot });
  const packedFiles = JSON.parse(packOutput);
  const firstPack = Array.isArray(packedFiles) ? packedFiles[0] : undefined;
  if (firstPack === undefined || typeof firstPack.filename !== "string") {
    throw new Error("npm pack did not report a tarball filename");
  }

  tarballPath = new URL(firstPack.filename, packageRoot).pathname;
  exec("npm", ["install", tarballPath], { cwd: tempDirectory });

  const binaryPath = join(tempDirectory, "node_modules", ".bin", "keyquest");
  const versionOutput = exec(binaryPath, ["--version"], { cwd: tempDirectory }).trim();
  if (!/^keyquest \d+\.\d+\.\d+/.test(versionOutput)) {
    throw new Error(`Unexpected --version output: ${versionOutput}`);
  }

  const helpOutput = exec(binaryPath, ["--help"], { cwd: tempDirectory });
  if (!helpOutput.includes("Usage:") || !helpOutput.includes("--lesson-pack <path>")) {
    throw new Error("--help output did not include expected usage text");
  }

  console.log(`Package smoke passed: ${versionOutput}`);
} finally {
  rmSync(tempDirectory, { recursive: true, force: true });
  if (tarballPath !== undefined) {
    unlinkSync(tarballPath);
  }
}

function exec(command, args, options) {
  return execFileSync(command, args, {
    cwd: options.cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  });
}
