import type {
  PracticeRewardsView,
  PracticeResultView,
  PracticeRunResultView,
  Scene,
  SceneContext,
  SceneOutput,
} from "./types.js";

export const titleScene: Scene = {
  id: "title",
  render(context: SceneContext): SceneOutput {
    const { t } = context.translator;

    return {
      id: "title",
      lines: [
        t("app.title"),
        t("app.subtitle"),
        context.mode === "development" ? t("dev.banner") : "",
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
        t("story.heading"),
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
        t("status.heading"),
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
        t("practice.heading"),
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

function formatElapsedSeconds(elapsedSeconds: number): string {
  return elapsedSeconds.toFixed(1);
}
