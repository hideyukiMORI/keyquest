#!/usr/bin/env node

import { scoreTypingResult } from "./core/scoring.js";

const samplePrompt = "find the key, keep the rhythm, open the gate";
const startedAt = new Date();
const completedAt = new Date(startedAt.getTime() + 30_000);
const score = scoreTypingResult({
  expected: samplePrompt,
  actual: samplePrompt,
  startedAt,
  completedAt,
});

console.log("KeyQuest");
console.log("A terminal typing adventure game for fun and effective practice.");
console.log("");
console.log(`Sample prompt: ${samplePrompt}`);
console.log(`Baseline score model: ${score.wordsPerMinute.toFixed(1)} WPM, 100% accuracy`);
console.log("");
console.log("Next: build the interactive lesson loop from the tracked GitHub issues.");
