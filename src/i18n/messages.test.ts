import { describe, expect, it } from "vitest";

import {
  assertCompleteCatalogs,
  createTranslator,
  localeDisplayName,
  resolveLocale,
} from "./messages.js";

describe("i18n messages", () => {
  it("keeps every locale catalog complete", () => {
    expect(() => {
      assertCompleteCatalogs();
    }).not.toThrow();
  });

  it("resolves unsupported locales to English", () => {
    expect(resolveLocale("unknown")).toBe("en");
  });

  it("interpolates localized messages", () => {
    const translator = createTranslator("ja");

    expect(translator.t("options.saved", { language: localeDisplayName("ja") })).toBe(
      "言語を 日本語 に設定しました。",
    );
  });
});
