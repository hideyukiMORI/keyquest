import {
  SUPPORTED_LOCALES,
  createTranslator,
  localeDisplayName,
  resolveLocale,
  type LocaleId,
  type Translator,
} from "../i18n/messages.js";
import type { KeyQuestSave } from "../save/model.js";

export type TitleMenuAction = "start" | "options";

export function renderTitleMenu(save: KeyQuestSave, translator: Translator): readonly string[] {
  const hasExistingSession = save.progress.sessions.length > 0;
  const firstAction = hasExistingSession
    ? translator.t("title.menu.continue")
    : translator.t("title.menu.start");

  return [
    translator.t("app.title"),
    translator.t("app.subtitle"),
    "",
    translator.t("title.menu.heading"),
    `1. ${firstAction}`,
    `2. ${translator.t("title.menu.options")}`,
    `3. ${translator.t("title.menu.newGame")} (${translator.t("title.menu.planned")})`,
    `4. ${translator.t("title.menu.loadGame")} (${translator.t("title.menu.planned")})`,
  ];
}

export function parseTitleMenuAction(input: string): TitleMenuAction {
  const normalized = input.trim().toLowerCase();

  if (
    normalized === "" ||
    normalized === "1" ||
    normalized === "start" ||
    normalized === "continue"
  ) {
    return "start";
  }

  if (normalized === "2" || normalized === "options" || normalized === "option") {
    return "options";
  }

  return "start";
}

export function renderLanguageOptions(
  currentLocale: LocaleId,
  translator: Translator,
): readonly string[] {
  return [
    translator.t("options.heading"),
    `${translator.t("options.language")}: ${localeDisplayName(currentLocale)}`,
    "",
    ...SUPPORTED_LOCALES.map((locale, index) => `${index + 1}. ${localeDisplayName(locale)}`),
    `0. ${translator.t("options.back")}`,
  ];
}

export function parseLocaleChoice(input: string, currentLocale: LocaleId): LocaleId {
  const normalized = input.trim();
  if (normalized === "" || normalized === "0") {
    return currentLocale;
  }

  const index = Number.parseInt(normalized, 10);
  if (Number.isInteger(index) && index >= 1 && index <= SUPPORTED_LOCALES.length) {
    const locale = SUPPORTED_LOCALES[index - 1];
    if (locale !== undefined) {
      return locale;
    }
  }

  return resolveLocale(normalized);
}

export function createMenuTranslator(save: KeyQuestSave): Translator {
  return createTranslator(save.settings.locale);
}
