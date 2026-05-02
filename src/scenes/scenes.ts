import type { PracticeResultView, Scene, SceneContext, SceneOutput } from "./types.js";

export const titleScene: Scene = {
  id: "title",
  render(context: SceneContext): SceneOutput {
    return {
      id: "title",
      lines: [
        "KeyQuest",
        "A terminal typing adventure for steady hands.",
        context.mode === "development" ? "DEV MODE - debug magic is not sung by bards." : "",
      ].filter((line) => line.length > 0),
      next: "story",
    };
  },
};

export const storyScene: Scene = {
  id: "story",
  render(context: SceneContext): SceneOutput {
    return {
      id: "story",
      lines: [
        "Story",
        `Day ${context.lesson.day}: ${context.lesson.title}`,
        "The old instructor points to the home row.",
        '"Before the blade, learn the stance."',
      ],
      next: "status",
    };
  },
};

export const statusScene: Scene = {
  id: "status",
  render(context: SceneContext): SceneOutput {
    const skills = context.save.progress.skills
      .slice(0, 3)
      .map((skill) => `${skill.id} Lv.${skill.level}`)
      .join(" / ");

    return {
      id: "status",
      lines: [
        "Status",
        `Hero: ${context.save.profile.heroName}`,
        `XP: ${context.save.progress.totalXp}`,
        `Streak: ${context.save.progress.streakDays} days`,
        `Training: ${skills}`,
      ],
      next: "practiceIntro",
    };
  },
};

export const practiceIntroScene: Scene = {
  id: "practiceIntro",
  render(context: SceneContext): SceneOutput {
    const { practicePrompt } = context;

    return {
      id: "practiceIntro",
      lines: [
        "Practice",
        `Lesson: ${context.lesson.title}`,
        "Keep your fingers on the home position.",
        `Keys: ${practicePrompt.targetKeys.join(" ")}`,
        `Fingers: ${practicePrompt.fingerHints.join(" / ")}`,
        `Type: ${practicePrompt.text}`,
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

export function renderPracticeResult(result: PracticeResultView): readonly string[] {
  const accuracy = Math.round(result.score.accuracy * 100);
  const devLine =
    result.mode === "development"
      ? ["DEV MODE CLEAR - the bards refuse to sing about debug magic."]
      : [];

  return [
    "Result",
    `Expected: ${result.prompt.text}`,
    `Typed:    ${result.actual}`,
    `Accuracy: ${accuracy}%`,
    `WPM: ${result.score.wordsPerMinute.toFixed(1)}`,
    `Mistakes: ${result.score.mistakes}`,
    `XP gained: ${result.xpGained}`,
    ...devLine,
  ];
}
