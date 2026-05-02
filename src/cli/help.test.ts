import { describe, expect, it } from "vitest";

import { renderCliHelp, renderCliVersion } from "./help.js";

describe("CLI help", () => {
  it("renders usage and public options", () => {
    const help = renderCliHelp();

    expect(help).toContain("Usage:");
    expect(help).toContain("keyquest [options]");
    expect(help).toContain("--lesson-pack <path>");
    expect(help).toContain("--reduced-motion");
  });

  it("renders the package version", () => {
    expect(renderCliVersion("0.1.0")).toBe("keyquest 0.1.0");
  });
});
