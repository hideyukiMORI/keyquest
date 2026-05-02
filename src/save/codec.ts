import { createHmac, timingSafeEqual } from "node:crypto";
import { gunzipSync, gzipSync } from "node:zlib";

import type { KeyQuestSave } from "./model.js";

const NORMAL_SAVE_PREFIX = "KQSV1";
const NORMAL_SAVE_SECRET = "keyquest-local-save-integrity-v1";

export function encodeNormalSave(save: KeyQuestSave): string {
  const canonical = JSON.stringify(save);
  const payload = gzipSync(canonical).toString("base64url");
  const signature = signPayload(payload);

  return `${NORMAL_SAVE_PREFIX}.${payload}.${signature}`;
}

export function decodeNormalSave(content: string): KeyQuestSave {
  const [prefix, payload, signature] = content.split(".");

  if (prefix !== NORMAL_SAVE_PREFIX || payload === undefined || signature === undefined) {
    throw new Error("Invalid KeyQuest save format");
  }

  const expectedSignature = signPayload(payload);
  if (!safeEqual(signature, expectedSignature)) {
    throw new Error("KeyQuest save integrity check failed");
  }

  const json = gunzipSync(Buffer.from(payload, "base64url")).toString("utf8");
  return JSON.parse(json) as KeyQuestSave;
}

export function encodeDevelopmentSave(save: KeyQuestSave): string {
  return `${JSON.stringify(save, null, 2)}\n`;
}

export function decodeDevelopmentSave(content: string): KeyQuestSave {
  return JSON.parse(content) as KeyQuestSave;
}

function signPayload(payload: string): string {
  return createHmac("sha256", NORMAL_SAVE_SECRET).update(payload).digest("base64url");
}

function safeEqual(actual: string, expected: string): boolean {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);

  if (actualBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(actualBuffer, expectedBuffer);
}
