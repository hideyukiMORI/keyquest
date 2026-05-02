import { describe, expect, it } from "vitest";

import {
  SUPPORTED_LOCALES,
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

  it("localizes representative gameplay keys for every non-English locale", () => {
    const localizedExpectations = {
      ja: {
        "title.menu.loadGame": "ロードゲーム",
        "review.resultHeading": "復習フォーカス",
        "journey.lanternKeepClear":
          "Beacon Trial クリア。Lantern Keep の灯があなたの数字段の到達を照らしています。",
      },
      "zh-CN": {
        "title.menu.loadGame": "读取游戏",
        "review.resultHeading": "复习重点",
        "journey.lanternKeepClear": "Beacon Trial 已通过。Lantern Keep 照亮了你的数字行触达。",
      },
      ko: {
        "title.menu.loadGame": "불러오기",
        "review.resultHeading": "복습 초점",
        "journey.lanternKeepClear":
          "Beacon Trial 클리어. Lantern Keep의 빛이 숫자 행 도달을 비춥니다.",
      },
      es: {
        "title.menu.loadGame": "Cargar partida",
        "review.resultHeading": "Foco del repaso",
        "journey.lanternKeepClear":
          "Beacon Trial superada. Lantern Keep ilumina tu alcance en la fila numérica.",
      },
      "pt-BR": {
        "title.menu.loadGame": "Carregar jogo",
        "review.resultHeading": "Foco da revisão",
        "journey.lanternKeepClear":
          "Beacon Trial concluída. Lantern Keep ilumina seu alcance na fileira numérica.",
      },
    } as const;

    for (const locale of SUPPORTED_LOCALES) {
      if (locale === "en") {
        continue;
      }

      const translator = createTranslator(locale);
      const expectedMessages = localizedExpectations[locale];

      expect(translator.t("title.menu.loadGame")).toBe(expectedMessages["title.menu.loadGame"]);
      expect(translator.t("review.resultHeading")).toBe(expectedMessages["review.resultHeading"]);
      expect(translator.t("journey.lanternKeepClear")).toBe(
        expectedMessages["journey.lanternKeepClear"],
      );
    }
  });
});
