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

  it("parses lesson pack manifest path forms", () => {
    expect(
      parseCliArgs(["--lesson-pack", "packs/home-row/keyquest-pack.json"]).lessonPackPath,
    ).toBe("packs/home-row/keyquest-pack.json");
    expect(parseCliArgs(["--lesson-pack=packs/home-row/keyquest-pack.json"]).lessonPackPath).toBe(
      "packs/home-row/keyquest-pack.json",
    );
  });

  it("parses terminal runtime flags", () => {
    expect(parseCliArgs(["--color", "always"]).colorMode).toBe("always");
    expect(parseCliArgs(["--color=never"]).colorMode).toBe("never");
    expect(parseCliArgs(["--no-color"]).colorMode).toBe("never");
    expect(parseCliArgs(["--reduced-motion"]).reducedMotion).toBe(true);
  });

  it("rejects unknown options", () => {
    expect(() => parseCliArgs(["--mystery"])).toThrow("Unknown option");
  });

  it("rejects unsupported color modes", () => {
    expect(() => parseCliArgs(["--color", "sparkles"])).toThrow("Unsupported color mode");
  });
});
