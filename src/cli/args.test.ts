import { describe, expect, it } from "vitest";

import { parseCliArgs } from "./args.js";

describe("parseCliArgs", () => {
  it("parses development mode aliases", () => {
    expect(parseCliArgs(["--dev"]).devMode).toBe(true);
    expect(parseCliArgs(["-dev"]).devMode).toBe(true);
  });

  it("parses save directory forms", () => {
    expect(parseCliArgs(["--save-dir", "/tmp/keyquest"]).saveDirectory).toBe("/tmp/keyquest");
    expect(parseCliArgs(["--save-dir=/tmp/keyquest"]).saveDirectory).toBe("/tmp/keyquest");
  });

  it("parses lesson path forms", () => {
    expect(parseCliArgs(["--lesson", "lessons/day-1.json"]).lessonPath).toBe("lessons/day-1.json");
    expect(parseCliArgs(["--lesson=lessons/day-1.json"]).lessonPath).toBe("lessons/day-1.json");
  });

  it("rejects unknown options", () => {
    expect(() => parseCliArgs(["--mystery"])).toThrow("Unknown option");
  });
});
