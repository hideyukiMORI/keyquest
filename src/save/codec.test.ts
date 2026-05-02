import { describe, expect, it } from "vitest";

import {
  decodeDevelopmentSave,
  decodeNormalSave,
  encodeDevelopmentSave,
  encodeNormalSave,
} from "./codec.js";
import { createNewSave } from "./model.js";

describe("save codecs", () => {
  const save = createNewSave(new Date("2026-01-01T00:00:00.000Z"), "normal");

  it("round-trips normal saves without exposing plain JSON", () => {
    const encoded = encodeNormalSave(save);

    expect(encoded.startsWith("KQSV1.")).toBe(true);
    expect(encoded).not.toContain("Apprentice");
    expect(decodeNormalSave(encoded)).toEqual(save);
  });

  it("rejects tampered normal saves", () => {
    const encoded = encodeNormalSave(save);
    const tampered = encoded.replace("KQSV1.", "KQSV1.x");

    expect(() => decodeNormalSave(tampered)).toThrow("integrity");
  });

  it("writes readable JSON in development mode", () => {
    const encoded = encodeDevelopmentSave(save);

    expect(encoded).toContain('"heroName": "Apprentice"');
    expect(decodeDevelopmentSave(encoded)).toEqual(save);
  });
});
