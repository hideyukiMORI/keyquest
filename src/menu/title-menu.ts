import {
  SUPPORTED_LOCALES,
  createTranslator,
  localeDisplayName,
  resolveLocale,
  type LocaleId,
  type Translator,
} from "../i18n/messages.js";
import { ACHIEVEMENTS } from "../achievements/engine.js";
import { JOURNEY_ENDING_DAY, getJourneyEndingState } from "../quest/ending.js";
import { getDisplayQuestArcForDay } from "../quest/map.js";
import { TITLE_REWARDS } from "../rewards/titles.js";
import {
  createInitialQuestResources,
  type EquipmentUpgradeRecord,
  type KeyQuestSave,
  type SaveMode,
} from "../save/model.js";
import { renderFixedScreenLayout } from "../terminal/layout.js";
import type { TerminalRuntime } from "../terminal/runtime.js";
import type { InteractiveMenuItem } from "./interactive-menu.js";

export type TitleMenuAction =
  | "start"
  | "review"
  | "options"
  | "newGame"
  | "loadGame"
  | "help"
  | "journey"
  | "resources"
  | "achievements"
  | "titles";

export type RenderTitleMenuOptions = {
  readonly runtime?: TerminalRuntime | undefined;
  readonly selectedIndex?: number | undefined;
  readonly mode?: SaveMode | undefined;
  readonly notice?: string | undefined;
};

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
    { value: "resources", label: translator.t("title.menu.resources") },
    { value: "achievements", label: translator.t("title.menu.achievements") },
    { value: "titles", label: translator.t("title.menu.titles") },
  ];
}

export function renderTitleMenu(
  save: KeyQuestSave,
  translator: Translator,
  options: RenderTitleMenuOptions = {},
): readonly string[] {
  const items = getTitleMenuItems(save, translator);
  const arc = getDisplayQuestArcForDay(save.journey.day);
  const menuLines = items.map((item, index) =>
    options.selectedIndex === undefined
      ? `${index + 1}. ${item.label}`
      : `${index === options.selectedIndex ? ">" : " "} ${item.label}`,
  );
  const extraLines = [
    ...(options.mode === "development" ? [translator.t("dev.banner")] : []),
    ...(options.notice === undefined ? [] : [options.notice]),
  ];

  return renderFixedScreenLayout({
    runtime: options.runtime,
    title: translator.t("app.title"),
    subtitle: translator.t("app.subtitle"),
    status: [
      `Day ${save.journey.day}`,
      `XP ${save.progress.totalXp}`,
      `Streak ${save.progress.streakDays}`,
    ],
    body: [
      "Quest",
      `  ${arc.title}`,
      `  ${arc.theme}`,
      "",
      translator.t("title.menu.heading"),
      ...menuLines,
      ...extraLines,
    ],
    hints:
      options.selectedIndex === undefined
        ? [translator.t("title.menu.prompt").trim()]
        : [translator.t("menu.controls")],
  });
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

  if (normalized === "8" || normalized === "resources" || normalized === "resource") {
    return "resources";
  }

  if (normalized === "9" || normalized === "achievements" || normalized === "achievement") {
    return "achievements";
  }

  if (normalized === "10" || normalized === "titles" || normalized === "title") {
    return "titles";
  }

  return "start";
}

export function renderInGameHelp(
  translator: Translator,
  runtime?: TerminalRuntime,
): readonly string[] {
  return renderFixedScreenLayout({
    runtime,
    title: translator.t("help.heading"),
    body: [
      "Daily",
      `  ${translator.t("help.daily")}`,
      "",
      "Review",
      `  ${translator.t("help.review")}`,
      "",
      "Progression",
      `  ${translator.t("help.progression")}`,
      "",
      "Options",
      `  ${translator.t("help.options")}`,
    ],
    hints: [translator.t("help.back")],
  });
}

export function renderJourneyProgress(
  save: KeyQuestSave,
  translator: Translator,
  runtime?: TerminalRuntime,
): readonly string[] {
  const arc = getDisplayQuestArcForDay(save.journey.day);
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
  const postGameLines =
    endingState.status === "postGame"
      ? endingState.goals.map((goal) =>
          translator.t("postGame.goalProgress", {
            goal: translator.t(`postGame.goal.${goal.id}`),
            current: goal.current,
            target: goal.target,
          }),
        )
      : [];

  return renderFixedScreenLayout({
    runtime,
    title: translator.t("journeyProgress.heading"),
    status: [`Day ${save.journey.day}/${JOURNEY_ENDING_DAY}`],
    body: [
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
      ...postGameLines,
    ],
    hints: [translator.t("journeyProgress.back")],
  });
}

export function renderResourceRecords(
  save: KeyQuestSave,
  translator: Translator,
  runtime?: TerminalRuntime,
): readonly string[] {
  const resources = save.progress.resources ?? createInitialQuestResources();
  const upgradeLines = resources.equipmentUpgrades.map((upgrade) =>
    translator.t("records.resources.equipment", {
      name: formatEquipmentUpgradeName(upgrade, translator),
      level: upgrade.level,
    }),
  );

  return renderFixedScreenLayout({
    runtime,
    title: translator.t("records.resources.heading"),
    body: [
      translator.t("status.resources", {
        hp: resources.hp,
        maxHp: resources.maxHp,
        mp: resources.mp,
        maxMp: resources.maxMp,
      }),
      translator.t("records.resources.materials", {
        focusCrystal: resources.materials.focusCrystal,
        repairShard: resources.materials.repairShard,
      }),
      translator.t("records.resources.weapons", {
        weapons:
          resources.weapons.length === 0
            ? translator.t("records.none")
            : resources.weapons.join(", "),
      }),
      translator.t("records.resources.magic", {
        magic:
          resources.magic.length === 0 ? translator.t("records.none") : resources.magic.join(", "),
      }),
      ...upgradeLines,
    ],
    hints: [translator.t("records.back")],
  });
}

export function renderAchievementRecords(
  save: KeyQuestSave,
  translator: Translator,
  runtime?: TerminalRuntime,
): readonly string[] {
  const unlockedIds = new Set(
    (save.progress.achievements ?? []).map((achievement) => achievement.id),
  );
  const lines = Object.values(ACHIEVEMENTS).map((achievement) =>
    translator.t(
      unlockedIds.has(achievement.id)
        ? "records.achievement.unlocked"
        : "records.achievement.locked",
      {
        title: translator.t(`achievement.${achievement.id}`),
      },
    ),
  );

  return renderFixedScreenLayout({
    runtime,
    title: translator.t("records.achievements.heading"),
    body: lines,
    hints: [translator.t("records.back")],
  });
}

export function renderTitleRecords(
  save: KeyQuestSave,
  translator: Translator,
  runtime?: TerminalRuntime,
): readonly string[] {
  const unlockedIds = new Set((save.progress.titles ?? []).map((title) => title.id));
  const lines = Object.values(TITLE_REWARDS).map((title) =>
    translator.t(unlockedIds.has(title.id) ? "records.title.unlocked" : "records.title.locked", {
      title: translator.t(`titleReward.${title.id}`),
    }),
  );

  return renderFixedScreenLayout({
    runtime,
    title: translator.t("records.titles.heading"),
    body: lines,
    hints: [translator.t("records.back")],
  });
}

export function renderLanguageOptions(
  currentLocale: LocaleId,
  translator: Translator,
  runtime?: TerminalRuntime,
  selectedIndex?: number,
): readonly string[] {
  const optionLabels = [
    ...SUPPORTED_LOCALES.map((locale) => localeDisplayName(locale)),
    translator.t("options.back"),
  ];
  const body =
    selectedIndex === undefined
      ? [
          ...SUPPORTED_LOCALES.map((locale, index) => `${index + 1}. ${localeDisplayName(locale)}`),
          `0. ${translator.t("options.back")}`,
        ]
      : optionLabels.map((label, index) => `${index === selectedIndex ? ">" : " "} ${label}`);

  return renderFixedScreenLayout({
    runtime,
    title: translator.t("options.heading"),
    subtitle: `${translator.t("options.language")}: ${localeDisplayName(currentLocale)}`,
    body,
    hints:
      selectedIndex === undefined
        ? [translator.t("options.prompt").trim()]
        : [translator.t("menu.controls")],
  });
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

function formatEquipmentUpgradeName(
  upgrade: EquipmentUpgradeRecord,
  translator: Translator,
): string {
  return translator.t(`equipment.${upgrade.id}`);
}
