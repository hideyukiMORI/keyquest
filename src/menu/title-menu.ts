import {
  SUPPORTED_LOCALES,
  createTranslator,
  localeDisplayName,
  resolveLocale,
  type LocaleId,
  type Translator,
} from "../i18n/messages.js";
import { JOURNEY_ENDING_DAY, getJourneyEndingState } from "../quest/ending.js";
import { QUEST_ARCS } from "../quest/map.js";
import type { KeyQuestSave } from "../save/model.js";
import type { InteractiveMenuItem } from "./interactive-menu.js";

export type TitleMenuAction =
  | "start"
  | "review"
  | "options"
  | "newGame"
  | "loadGame"
  | "help"
  | "journey";

export function getTitleMenuItems(
  save: KeyQuestSave,
  translator: Translator,
): readonly InteractiveMenuItem<TitleMenuAction>[] {
  const hasExistingSession = save.progress.sessions.length > 0;
  const firstAction = hasExistingSession
    ? translator.t("title.menu.continue")
    : translator.t("title.menu.start");

  return [
    { value: "start", label: firstAction },
    { value: "review", label: translator.t("title.menu.review") },
    { value: "options", label: translator.t("title.menu.options") },
    { value: "newGame", label: translator.t("title.menu.newGame") },
    { value: "loadGame", label: translator.t("title.menu.loadGame") },
    { value: "help", label: translator.t("title.menu.help") },
    { value: "journey", label: translator.t("title.menu.journey") },
  ];
}

export function renderTitleMenu(save: KeyQuestSave, translator: Translator): readonly string[] {
  const items = getTitleMenuItems(save, translator);

  return [
    translator.t("app.title"),
    translator.t("app.subtitle"),
    "",
    translator.t("title.menu.heading"),
    ...items.map((item, index) => `${index + 1}. ${item.label}`),
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

  if (normalized === "2" || normalized === "review" || normalized === "weak keys") {
    return "review";
  }

  if (normalized === "3" || normalized === "options" || normalized === "option") {
    return "options";
  }

  if (normalized === "4" || normalized === "new" || normalized === "new game") {
    return "newGame";
  }

  if (normalized === "5" || normalized === "load" || normalized === "load game") {
    return "loadGame";
  }

  if (normalized === "6" || normalized === "help") {
    return "help";
  }

  if (normalized === "7" || normalized === "journey" || normalized === "progress") {
    return "journey";
  }

  return "start";
}

export function renderInGameHelp(translator: Translator): readonly string[] {
  return [
    translator.t("help.heading"),
    "",
    translator.t("help.daily"),
    translator.t("help.review"),
    translator.t("help.progression"),
    translator.t("help.options"),
    "",
    translator.t("help.back"),
  ];
}

export function renderJourneyProgress(
  save: KeyQuestSave,
  translator: Translator,
): readonly string[] {
  const arc = getDisplayQuestArc(save.journey.day);
  const endingState = getJourneyEndingState(save);
  const endingLine =
    endingState.status === "inProgress"
      ? translator.t("journeyProgress.daysRemaining", {
          days: endingState.daysRemaining,
          total: JOURNEY_ENDING_DAY,
        })
      : endingState.status === "endingReady"
        ? translator.t("journeyProgress.endingReady")
        : translator.t("journeyProgress.postGame");

  return [
    translator.t("journeyProgress.heading"),
    "",
    translator.t("journeyProgress.day", {
      day: save.journey.day,
      total: JOURNEY_ENDING_DAY,
    }),
    translator.t("journeyProgress.arc", { arc: arc.title }),
    translator.t("journeyProgress.theme", { theme: arc.theme }),
    translator.t("journeyProgress.trial", {
      trial: arc.trial.title,
      day: arc.trial.day,
    }),
    endingLine,
    "",
    translator.t("journeyProgress.back"),
  ];
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

export type LanguageMenuAction = LocaleId | "back";

export function getLanguageMenuItems(
  translator: Translator,
): readonly InteractiveMenuItem<LanguageMenuAction>[] {
  return [
    ...SUPPORTED_LOCALES.map((locale) => ({
      value: locale,
      label: localeDisplayName(locale),
    })),
    {
      value: "back",
      label: translator.t("options.back"),
    },
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

function getDisplayQuestArc(day: number): (typeof QUEST_ARCS)[number] {
  const arc = QUEST_ARCS.find((candidate) => day >= candidate.startDay && day <= candidate.endDay);
  if (arc !== undefined) {
    return arc;
  }

  const finalArc = QUEST_ARCS[QUEST_ARCS.length - 1];
  if (finalArc === undefined) {
    throw new Error("At least one quest arc is required");
  }

  return finalArc;
}
