#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { URL } from "node:url";

const packageJson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const version = typeof packageJson.version === "string" ? packageJson.version : "0.0.0";
const today = new Date().toISOString().slice(0, 10);
const latestTag = getLatestTag();
const range = latestTag === undefined ? "HEAD" : `${latestTag}..HEAD`;
const commits = getCommitSubjects(range).filter((commit) => !commit.subject.startsWith("Merge "));
const sections = groupCommits(commits);

console.log(`# Release Notes: v${version}`);
console.log("");
console.log(`Date: ${today}`);
if (latestTag !== undefined) {
  console.log(`Range: ${latestTag}..HEAD`);
}
console.log("");
printSection("Added", sections.added);
printSection("Fixed", sections.fixed);
printSection("Changed", sections.changed);

function getLatestTag() {
  try {
    return execFileSync("git", ["describe", "--tags", "--abbrev=0"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return undefined;
  }
}

function getCommitSubjects(range) {
  const output = execFileSync("git", ["log", "--pretty=format:%s%x09%h", range], {
    encoding: "utf8",
  }).trim();

  if (output.length === 0) {
    return [];
  }

  return output.split("\n").map((line) => {
    const [subject = "", hash = ""] = line.split("\t");
    return { subject, hash };
  });
}

function groupCommits(commits) {
  return commits.reduce(
    (groups, commit) => {
      if (/^(fix|resolve|repair)\b/i.test(commit.subject)) {
        groups.fixed.push(commit);
        return groups;
      }

      if (/^(add|introduce|create)\b/i.test(commit.subject)) {
        groups.added.push(commit);
        return groups;
      }

      groups.changed.push(commit);
      return groups;
    },
    {
      added: [],
      fixed: [],
      changed: [],
    },
  );
}

function printSection(title, commits) {
  console.log(`## ${title}`);
  console.log("");
  if (commits.length === 0) {
    console.log("- No changes.");
    console.log("");
    return;
  }

  for (const commit of commits) {
    console.log(`- ${commit.subject} (${commit.hash})`);
  }
  console.log("");
}
