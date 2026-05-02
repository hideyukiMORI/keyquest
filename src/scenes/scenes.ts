import type {
  PracticeAchievementsView,
  PracticeJourneyProgressView,
  PracticeRewardsView,
  PracticeResultView,
  PracticeRunResultView,
  PracticeStreakProgressView,
  PracticeTitleRewardsView,
  Scene,
  SceneContext,
  SceneOutput,
} from "./types.js";
import { MEADOW_ROAD_FINAL_DAY, NOVICE_HALL_FINAL_DAY } from "../lessons/manifest.js";
import { styleText } from "../terminal/ansi.js";

export const titleScene: Scene = {
  id: "title",
  render(context: SceneContext): SceneOutput {
    const { t } = context.translator;

    return {
      id: "title",
      lines: [
        styleText(t("app.title"), "accent", context.terminalRuntime),
        t("app.subtitle"),
        context.mode === "development"
          ? styleText(t("dev.banner"), "warning", context.terminalRuntime)
          : "",
      ].filter((line) => line.length > 0),
      next: "story",
    };
  },
};

export const storyScene: Scene = {
  id: "story",
  render(context: SceneContext): SceneOutput {
    const { t } = context.translator;

    return {
      id: "story",
      lines: [
        styleText(t("story.heading"), "accent", context.terminalRuntime),
        `Day ${context.lesson.day}: ${context.lesson.title}`,
        t("story.noviceIntro"),
        t("story.noviceQuote"),
      ],
      next: "status",
    };
  },
};

export const statusScene: Scene = {
  id: "status",
  render(context: SceneContext): SceneOutput {
    const { t } = context.translator;
    const skills = context.save.progress.skills
      .slice(0, 3)
      .map((skill) => `${skill.id} Lv.${skill.level}`)
      .join(" / ");

    return {
      id: "status",
      lines: [
        styleText(t("status.heading"), "accent", context.terminalRuntime),
        t("status.hero", { hero: context.save.profile.heroName }),
        t("status.xp", { xp: context.save.progress.totalXp }),
        t("status.streak", { days: context.save.progress.streakDays }),
        t("status.training", { skills }),
      ],
      next: "practiceIntro",
    };
  },
};

export const practiceIntroScene: Scene = {
  id: "practiceIntro",
  render(context: SceneContext): SceneOutput {
    const { practicePrompt } = context;
    const { t } = context.translator;

    return {
      id: "practiceIntro",
      lines: [
        styleText(t("practice.heading"), "accent", context.terminalRuntime),
        t("practice.lesson", { lesson: context.lesson.title }),
        t("practice.homeHint"),
        t("practice.keys", { keys: practicePrompt.targetKeys.join(" ") }),
        t("practice.fingers", { fingers: practicePrompt.fingerHints.join(" / ") }),
        t("practice.type", { text: practicePrompt.text }),
      ],
      next: "exit",
    };
  },
};

export const defaultScenes: readonly Scene[] = [
  titleScene,
  storyScene,
  statusScene,
  practiceIntroScene,
];

export function renderPracticeResult(
  result: PracticeResultView,
  translator: SceneContext["translator"],
): readonly string[] {
  const accuracy = Math.round(result.score.accuracy * 100);
  const { t } = translator;
  const devLine = result.mode === "development" ? [t("result.devClear")] : [];

  return [
    t("result.heading"),
    t("result.expected", { text: result.prompt.text }),
    t("result.typed", { text: result.actual }),
    t("result.accuracy", { accuracy }),
    t("result.wpm", { wpm: result.score.wordsPerMinute.toFixed(1) }),
    t("result.elapsed", { seconds: formatElapsedSeconds(result.score.elapsedSeconds) }),
    t("result.mistakes", { mistakes: result.score.mistakes }),
    t("result.xpGained", { xp: result.xpGained }),
    ...devLine,
  ];
}

export function renderPracticeSegmentResult(
  result: PracticeResultView & {
    readonly current: number;
    readonly total: number;
  },
  translator: SceneContext["translator"],
): readonly string[] {
  const accuracy = Math.round(result.score.accuracy * 100);
  const { t } = translator;

  return [
    t("session.segmentHeading", { current: result.current, total: result.total }),
    t("result.accuracy", { accuracy }),
    t("result.wpm", { wpm: result.score.wordsPerMinute.toFixed(1) }),
    t("result.elapsed", { seconds: formatElapsedSeconds(result.score.elapsedSeconds) }),
    t("result.mistakes", { mistakes: result.score.mistakes }),
    t("result.xpGained", { xp: result.xpGained }),
  ];
}

export function renderPracticeRunResult(
  result: PracticeRunResultView,
  translator: SceneContext["translator"],
): readonly string[] {
  const accuracy = Math.round(result.score.accuracy * 100);
  const { t } = translator;
  const devLine = result.mode === "development" ? [t("result.devClear")] : [];

  return [
    t("session.finalHeading"),
    t("session.promptCount", { count: result.promptCount }),
    t("result.accuracy", { accuracy }),
    t("result.wpm", { wpm: result.score.wordsPerMinute.toFixed(1) }),
    t("result.elapsed", { seconds: formatElapsedSeconds(result.score.elapsedSeconds) }),
    t("result.mistakes", { mistakes: result.score.mistakes }),
    t("result.xpGained", { xp: result.xpGained }),
    ...devLine,
  ];
}

export function renderPracticeRewards(
  rewards: PracticeRewardsView,
  translator: SceneContext["translator"],
): readonly string[] {
  const { t } = translator;
  const rewardLines = rewards.afterSave.progress.skills.flatMap((afterSkill) => {
    const beforeSkill = rewards.beforeSave.progress.skills.find(
      (skill) => skill.id === afterSkill.id,
    );
    if (beforeSkill === undefined) {
      return [];
    }

    const xpGained = afterSkill.xp - beforeSkill.xp;
    if (xpGained <= 0) {
      return [];
    }

    const skillLine = t("reward.skillXp", {
      skill: afterSkill.id,
      xp: xpGained,
      level: afterSkill.level,
    });
    const levelLine =
      afterSkill.level > beforeSkill.level
        ? [
            t("reward.levelUp", {
              skill: afterSkill.id,
              level: afterSkill.level,
            }),
          ]
        : [];

    return [skillLine, ...levelLine];
  });

  return [t("reward.heading"), ...rewardLines];
}

export function renderPracticeStreakProgress(
  progress: PracticeStreakProgressView,
  translator: SceneContext["translator"],
): readonly string[] {
  const beforeStreak = progress.beforeSave.progress.streakDays;
  const afterStreak = progress.afterSave.progress.streakDays;
  const reachedMilestones = [3, 7, 30].filter(
    (milestone) => beforeStreak < milestone && afterStreak >= milestone,
  );

  if (reachedMilestones.length === 0) {
    return [];
  }

  const { t } = translator;
  const milestoneLines = reachedMilestones.map((days) => {
    const key =
      days === 30
        ? "streak.milestoneThirty"
        : days === 7
          ? "streak.milestoneSeven"
          : "streak.milestoneThree";

    return t(key);
  });

  return [t("streak.heading"), t("streak.current", { days: afterStreak }), ...milestoneLines];
}

export function renderPracticeAchievements(
  achievements: PracticeAchievementsView,
  translator: SceneContext["translator"],
): readonly string[] {
  const beforeAchievementIds = new Set(
    (achievements.beforeSave.progress.achievements ?? []).map((achievement) => achievement.id),
  );
  const unlockedAchievementLines = (achievements.afterSave.progress.achievements ?? [])
    .filter((achievement) => !beforeAchievementIds.has(achievement.id))
    .map((achievement) =>
      translator.t("achievement.unlocked", {
        title: translator.t(`achievement.${achievement.id}`),
      }),
    );

  if (unlockedAchievementLines.length === 0) {
    return [];
  }

  return [translator.t("achievement.heading"), ...unlockedAchievementLines];
}

export function renderPracticeTitleRewards(
  titles: PracticeTitleRewardsView,
  translator: SceneContext["translator"],
): readonly string[] {
  const beforeTitleIds = new Set(
    (titles.beforeSave.progress.titles ?? []).map((title) => title.id),
  );
  const unlockedTitleLines = (titles.afterSave.progress.titles ?? [])
    .filter((title) => !beforeTitleIds.has(title.id))
    .map((title) =>
      translator.t("titleReward.unlocked", {
        title: translator.t(`titleReward.${title.id}`),
      }),
    );

  if (unlockedTitleLines.length === 0) {
    return [];
  }

  return [translator.t("titleReward.heading"), ...unlockedTitleLines];
}

export function renderPracticeJourneyProgress(
  progress: PracticeJourneyProgressView,
  translator: SceneContext["translator"],
): readonly string[] {
  const { t } = translator;
  const beforeDay = progress.beforeSave.journey.day;
  const afterDay = progress.afterSave.journey.day;
  const progressLines = [
    beforeDay === NOVICE_HALL_FINAL_DAY ? t("journey.noviceHallClear") : "",
    beforeDay === MEADOW_ROAD_FINAL_DAY ? t("journey.meadowRoadClear") : "",
    afterDay > beforeDay ? t("journey.nextDay", { day: afterDay }) : "",
  ].filter((line) => line.length > 0);

  if (progressLines.length === 0) {
    return [];
  }

  return [t("journey.heading"), ...progressLines];
}

function formatElapsedSeconds(elapsedSeconds: number): string {
  return elapsedSeconds.toFixed(1);
}
